import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Installment } from '../../models/installment.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import { Subscription } from '../../models/subscription.model';
import { SubscriptionOccurrence } from '../../models/subscription-occurrence.model';
import {
  assertProjectionRange,
  addMonthsClamped,
  formatToFrenchDate,
  generateSubscriptionDueDates,
  parseFrenchDate,
} from '../../utils';
import {
  CalendarProjectionItemDto,
  CalendarProjectionKind,
} from './dto/calendar-projection-item.dto';
import { CalendarProjectionQueryDto } from './dto/calendar-projection-query.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Subscription)
    private subscriptionModel: typeof Subscription,
    @InjectModel(SubscriptionOccurrence)
    private subscriptionOccurrenceModel: typeof SubscriptionOccurrence,
    @InjectModel(InstallmentOccurrence)
    private installmentOccurrenceModel: typeof InstallmentOccurrence,
  ) {}

  async getProjection(query: CalendarProjectionQueryDto): Promise<CalendarProjectionItemDto[]> {
    const today = new Date();
    const startDate = query.startDate ? parseFrenchDate(query.startDate) : today;
    const endDate = query.endDate
      ? parseFrenchDate(query.endDate)
      : addMonthsClamped(startDate, 6, startDate.getDate());
    assertProjectionRange(startDate, endDate);
    await this.ensureSubscriptionOccurrencesUntil(endDate);

    const [subscriptionOccurrences, installmentOccurrences] = await Promise.all([
      this.subscriptionOccurrenceModel.findAll({
        where: {
          dueDate: { [Op.between]: [startDate, endDate] },
        },
        include: [{ model: Subscription, as: 'subscription', required: true }],
        order: [['dueDate', 'ASC']],
      }),
      this.installmentOccurrenceModel.findAll({
        where: {
          dueDate: { [Op.between]: [startDate, endDate] },
        },
        include: [{ model: Installment, as: 'installment', required: true }],
        order: [['dueDate', 'ASC']],
      }),
    ]);

    const items = [
      ...subscriptionOccurrences.map((occurrence) => ({
        id: occurrence.id,
        kind: CalendarProjectionKind.SUBSCRIPTION,
        ownerId: occurrence.subscriptionId,
        ownerName: occurrence.subscription.name,
        dueDate: occurrence.dueDate,
        paidDate: occurrence.paidDate,
        expenseId: occurrence.expenseId,
        status: this.resolveStatus(occurrence.status, occurrence.dueDate),
        amount: Number(occurrence.amount),
      })),
      ...installmentOccurrences.map((occurrence) => ({
        id: occurrence.id,
        kind: CalendarProjectionKind.INSTALLMENT,
        ownerId: occurrence.installmentId,
        ownerName: occurrence.installment.name,
        dueDate: occurrence.dueDate,
        paidDate: occurrence.paidDate,
        expenseId: occurrence.expenseId,
        status: this.resolveStatus(occurrence.status, occurrence.dueDate),
        amount: Number(occurrence.amount),
      })),
    ].sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime());

    return items.map((item) => ({
      ...item,
      dueDate: formatToFrenchDate(item.dueDate),
      paidDate: item.paidDate ? formatToFrenchDate(item.paidDate) : null,
    }));
  }

  private resolveStatus(status: OccurrenceStatus, dueDate: Date): OccurrenceStatus {
    if (status === OccurrenceStatus.PENDING && dueDate < new Date()) {
      return OccurrenceStatus.LATE;
    }

    return status;
  }

  private async ensureSubscriptionOccurrencesUntil(endDate: Date): Promise<void> {
    const subscriptions = await this.subscriptionModel.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: new Date() } }],
      },
    });

    for (const subscription of subscriptions) {
      const subscriptionEndDate =
        subscription.endDate && subscription.endDate < endDate ? subscription.endDate : endDate;
      const dueDates = generateSubscriptionDueDates(
        new Date(subscription.startDate),
        subscriptionEndDate,
        subscription.frequency,
        subscription.dayOfMonth,
        subscription.dayOfWeek,
      );

      for (const dueDate of dueDates) {
        await this.subscriptionOccurrenceModel.findOrCreate({
          where: {
            subscriptionId: subscription.id,
            dueDate,
          },
          defaults: {
            subscriptionId: subscription.id,
            dueDate,
            amount: Number(subscription.amount),
            status: this.resolveStatus(OccurrenceStatus.PENDING, dueDate),
          },
        });
      }
    }
  }
}
