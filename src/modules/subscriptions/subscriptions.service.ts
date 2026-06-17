import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Subscription, SubscriptionFrequency } from '../../models/subscription.model';
import { SubscriptionOccurrence } from '../../models/subscription-occurrence.model';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionCreationAttributes } from '../../types/interfaces';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import {
  generateSubscriptionDueDates,
  nextSubscriptionDate,
  parseFrenchDate,
  resolveSubscriptionAnchor,
} from '../../utils';

const DEFAULT_PROJECTION_MONTHS = 24;

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription)
    private subscriptionModel: typeof Subscription,
    @InjectModel(SubscriptionOccurrence)
    private subscriptionOccurrenceModel: typeof SubscriptionOccurrence,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    this.validateSchedule(
      createSubscriptionDto.frequency,
      createSubscriptionDto.dayOfMonth,
      createSubscriptionDto.dayOfWeek,
    );

    const subscriptionData: SubscriptionCreationAttributes = {
      name: createSubscriptionDto.name,
      amount: createSubscriptionDto.amount,
      frequency: createSubscriptionDto.frequency,
      dayOfMonth: createSubscriptionDto.dayOfMonth,
      dayOfWeek: createSubscriptionDto.dayOfWeek,
      startDate: parseFrenchDate(createSubscriptionDto.startDate),
      endDate: createSubscriptionDto.endDate
        ? parseFrenchDate(createSubscriptionDto.endDate)
        : undefined,
      isActive: createSubscriptionDto.isActive ?? true,
      categoryId: createSubscriptionDto.categoryId,
      bankId: createSubscriptionDto.bankId,
    };

    const subscription = await this.subscriptionModel.create(subscriptionData);
    await this.ensureFutureOccurrences(subscription);
    return this.findOne(subscription.id);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.findAll({
      include: [{ model: SubscriptionOccurrence, as: 'occurrences', required: false }],
      order: [['name', 'ASC']],
    });
  }

  async findActive(): Promise<Subscription[]> {
    const where: WhereOptions<Subscription> = {
      isActive: true,
      [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: new Date() } }],
    };

    return this.subscriptionModel.findAll({
      where,
      include: [{ model: SubscriptionOccurrence, as: 'occurrences', required: false }],
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findByPk(id, {
      include: [{ model: SubscriptionOccurrence, as: 'occurrences', required: false }],
    });

    if (!subscription) {
      throw new NotFoundException(`Abonnement avec l'ID ${id} non trouve`);
    }

    return subscription;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);
    const nextFrequency = updateSubscriptionDto.frequency ?? subscription.frequency;
    const nextDayOfMonth = updateSubscriptionDto.dayOfMonth ?? subscription.dayOfMonth;
    const nextDayOfWeek = updateSubscriptionDto.dayOfWeek ?? subscription.dayOfWeek;
    this.validateSchedule(nextFrequency, nextDayOfMonth, nextDayOfWeek);

    const updateData: Partial<SubscriptionCreationAttributes> = {};

    if (updateSubscriptionDto.name !== undefined) updateData.name = updateSubscriptionDto.name;
    if (updateSubscriptionDto.amount !== undefined)
      updateData.amount = updateSubscriptionDto.amount;
    if (updateSubscriptionDto.frequency !== undefined)
      updateData.frequency = updateSubscriptionDto.frequency;
    if (updateSubscriptionDto.dayOfMonth !== undefined)
      updateData.dayOfMonth = updateSubscriptionDto.dayOfMonth;
    if (updateSubscriptionDto.dayOfWeek !== undefined)
      updateData.dayOfWeek = updateSubscriptionDto.dayOfWeek;
    if (updateSubscriptionDto.isActive !== undefined)
      updateData.isActive = updateSubscriptionDto.isActive;
    if (updateSubscriptionDto.categoryId !== undefined)
      updateData.categoryId = updateSubscriptionDto.categoryId;
    if (updateSubscriptionDto.bankId !== undefined)
      updateData.bankId = updateSubscriptionDto.bankId;

    if (updateSubscriptionDto.startDate) {
      updateData.startDate = parseFrenchDate(updateSubscriptionDto.startDate);
    }

    if (updateSubscriptionDto.endDate) {
      updateData.endDate = parseFrenchDate(updateSubscriptionDto.endDate);
    }

    await subscription.update(updateData);
    await this.ensureFutureOccurrences(subscription);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await subscription.destroy();
  }

  async deactivate(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await subscription.update({ isActive: false });
    return this.findOne(id);
  }

  async activate(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await subscription.update({ isActive: true });
    await this.ensureFutureOccurrences(subscription);
    return this.findOne(id);
  }

  private validateSchedule(
    frequency: SubscriptionFrequency,
    dayOfMonth?: number | null,
    dayOfWeek?: number | null,
  ): void {
    if (
      (frequency === SubscriptionFrequency.WEEKLY ||
        frequency === SubscriptionFrequency.BIWEEKLY) &&
      dayOfWeek !== undefined &&
      dayOfWeek !== null &&
      (dayOfWeek < 0 || dayOfWeek > 6)
    ) {
      throw new BadRequestException('dayOfWeek doit etre compris entre 0 et 6');
    }

    if (
      frequency !== SubscriptionFrequency.WEEKLY &&
      frequency !== SubscriptionFrequency.BIWEEKLY &&
      dayOfMonth !== undefined &&
      dayOfMonth !== null &&
      (dayOfMonth < 1 || dayOfMonth > 31)
    ) {
      throw new BadRequestException('dayOfMonth doit etre compris entre 1 et 31');
    }
  }

  private async ensureFutureOccurrences(subscription: Subscription): Promise<void> {
    const startDate = new Date(subscription.startDate);
    const projectionEnd = subscription.endDate
      ? new Date(subscription.endDate)
      : nextSubscriptionDate(
          resolveSubscriptionAnchor(
            startDate,
            subscription.frequency,
            subscription.dayOfMonth,
            subscription.dayOfWeek,
          ),
          subscription.frequency,
          subscription.dayOfMonth,
        );
    projectionEnd.setMonth(projectionEnd.getMonth() + DEFAULT_PROJECTION_MONTHS);

    const dates = generateSubscriptionDueDates(
      startDate,
      subscription.endDate ? new Date(subscription.endDate) : projectionEnd,
      subscription.frequency,
      subscription.dayOfMonth,
      subscription.dayOfWeek,
    );

    for (const dueDate of dates) {
      await this.subscriptionOccurrenceModel.findOrCreate({
        where: {
          subscriptionId: subscription.id,
          dueDate,
        },
        defaults: {
          subscriptionId: subscription.id,
          dueDate,
          amount: Number(subscription.amount),
          status: dueDate < new Date() ? OccurrenceStatus.LATE : OccurrenceStatus.PENDING,
        },
      });
    }
  }
}
