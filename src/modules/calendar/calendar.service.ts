import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Bank } from '../../models/bank.model';
import { Category } from '../../models/category.model';
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
    @InjectModel(Installment)
    private installmentModel: typeof Installment,
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
    await this.markOverdueOccurrences();

    const [subscriptionOccurrences, installmentOccurrences] = await Promise.all([
      this.subscriptionOccurrenceModel.findAll({
        where: {
          dueDate: { [Op.between]: [startDate, endDate] },
        },
        include: [
          {
            model: Subscription,
            as: 'subscription',
            required: true,
            include: [
              { model: Category, as: 'category', required: false },
              { model: Bank, as: 'bank', required: false },
            ],
          },
        ],
        order: [['dueDate', 'ASC']],
      }),
      this.installmentOccurrenceModel.findAll({
        where: {
          dueDate: { [Op.between]: [startDate, endDate] },
        },
        include: [
          {
            model: Installment,
            as: 'installment',
            required: true,
            include: [
              { model: Category, as: 'category', required: false },
              { model: Bank, as: 'bank', required: false },
            ],
          },
        ],
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
        categoryId: occurrence.subscription.categoryId,
        categoryName: occurrence.subscription.category?.name ?? null,
        bankId: occurrence.subscription.bankId,
        bankName: occurrence.subscription.bank?.name ?? null,
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
        categoryId: occurrence.installment.categoryId,
        categoryName: occurrence.installment.category?.name ?? null,
        bankId: occurrence.installment.bankId,
        bankName: occurrence.installment.bank?.name ?? null,
      })),
    ].sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime());

    return items.map((item) => ({
      ...item,
      dueDate: formatToFrenchDate(item.dueDate),
      paidDate: item.paidDate ? formatToFrenchDate(item.paidDate) : null,
    }));
  }

  async updateOccurrenceStatus(
    kind: 'subscription' | 'installment',
    id: number,
    status: OccurrenceStatus,
  ): Promise<{ status: OccurrenceStatus }> {
    if (!Object.values(OccurrenceStatus).includes(status)) {
      throw new BadRequestException('Statut invalide');
    }

    const values = {
      status,
      paidDate: status === OccurrenceStatus.PAID ? new Date() : null,
    };

    if (kind === CalendarProjectionKind.SUBSCRIPTION) {
      const occurrence = await this.subscriptionOccurrenceModel.findByPk(id);

      if (!occurrence) {
        throw new NotFoundException(`Occurrence ${kind} avec l'ID ${id} non trouvee`);
      }

      await occurrence.update(values);
      return { status };
    }

    const occurrence = await this.installmentOccurrenceModel.findByPk(id);

    if (!occurrence) {
      throw new NotFoundException(`Occurrence ${kind} avec l'ID ${id} non trouvee`);
    }

    await occurrence.update(values);
    await this.refreshInstallmentCompletion(occurrence.installmentId);
    return { status };
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

  private async markOverdueOccurrences(): Promise<void> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const where = {
      status: OccurrenceStatus.PENDING,
      dueDate: { [Op.lt]: startOfDay },
    };

    await Promise.all([
      this.subscriptionOccurrenceModel.update({ status: OccurrenceStatus.LATE }, { where }),
      this.installmentOccurrenceModel.update({ status: OccurrenceStatus.LATE }, { where }),
    ]);
  }

  private async refreshInstallmentCompletion(installmentId: number): Promise<void> {
    const remaining = await this.installmentOccurrenceModel.count({
      where: {
        installmentId,
        status: { [Op.in]: [OccurrenceStatus.PENDING, OccurrenceStatus.LATE] },
      },
    });

    await this.installmentModel.update(
      { isCompleted: remaining === 0 },
      { where: { id: installmentId } },
    );
  }
}
