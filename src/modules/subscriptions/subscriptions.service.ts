import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Subscription } from '../../models/subscription.model';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionCreationAttributes } from '../../types/interfaces';
import { parseFrenchDate } from '../../utils';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription)
    private subscriptionModel: typeof Subscription,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Préparer les données pour Sequelize avec conversion de dates
    const subscriptionData: SubscriptionCreationAttributes = {
      name: createSubscriptionDto.name,
      amount: createSubscriptionDto.amount,
      frequency: createSubscriptionDto.frequency,
      startDate: parseFrenchDate(createSubscriptionDto.startDate),
      endDate: createSubscriptionDto.endDate ? parseFrenchDate(createSubscriptionDto.endDate) : undefined,
      isActive: createSubscriptionDto.isActive ?? true,
    };
    
    return this.subscriptionModel.create(subscriptionData);
  }


  async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findActive(): Promise<Subscription[]> {
    return this.subscriptionModel.findAll({
      where: { 
        isActive: true,
        [Op.or]: [
          { endDate: null as any },
          { endDate: { [Op.gte]: new Date() } }
        ]
      } as any,
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findByPk(id);

    if (!subscription) {
      throw new NotFoundException(`Abonnement avec l'ID ${id} non trouvé`);
    }

    return subscription;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    // Préparer les données de mise à jour avec conversion de dates
    const updateData: Partial<SubscriptionCreationAttributes> = {};
    
    // Copier les propriétés modifiées
    if (updateSubscriptionDto.name !== undefined) updateData.name = updateSubscriptionDto.name;
    if (updateSubscriptionDto.amount !== undefined) updateData.amount = updateSubscriptionDto.amount;
    if (updateSubscriptionDto.frequency !== undefined) updateData.frequency = updateSubscriptionDto.frequency;
    if (updateSubscriptionDto.isActive !== undefined) updateData.isActive = updateSubscriptionDto.isActive;
    
    // Convertir les dates string en objets Date si fournies
    if (updateSubscriptionDto.startDate) {
      updateData.startDate = parseFrenchDate(updateSubscriptionDto.startDate);
    }
    
    if (updateSubscriptionDto.endDate) {
      updateData.endDate = parseFrenchDate(updateSubscriptionDto.endDate);
    }
    
    await subscription.update(updateData);
    return subscription;
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await subscription.destroy();
  }

  async deactivate(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await subscription.update({ isActive: false });
    return subscription;
  }

  async activate(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await subscription.update({ isActive: true });
    return subscription;
  }
}
