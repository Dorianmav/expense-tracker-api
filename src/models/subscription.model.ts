import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Expense } from './expense.model';
import { SubscriptionCreationAttributes } from '../types/interfaces';

export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Table({
  tableName: 'subscriptions',
  timestamps: true,
})
export class Subscription extends Model<Subscription, SubscriptionCreationAttributes> {
  @ApiProperty({ description: 'ID unique de l\'abonnement' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom de l\'abonnement' })
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ description: 'Montant de l\'abonnement' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @ApiProperty({ 
    description: 'Fréquence de l\'abonnement',
    enum: SubscriptionFrequency,
  })
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionFrequency)),
    allowNull: false,
    defaultValue: SubscriptionFrequency.MONTHLY,
  })
  declare frequency: SubscriptionFrequency;

  @ApiProperty({ description: 'Date de début de l\'abonnement' })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @ApiProperty({ description: 'Date de fin de l\'abonnement (optionnelle)', required: false })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare endDate: Date;

  @ApiProperty({ description: 'Indique si l\'abonnement est actif' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @ApiProperty({ description: 'Dépenses associées à cet abonnement', required: false })
  @HasMany(() => require('./expense.model').Expense)
  declare expenses: Expense[];

  @ApiProperty({ description: 'Date de création' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdatedAt
  declare updatedAt: Date;
}
