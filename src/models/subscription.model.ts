import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Bank } from './bank.model';
import { Category } from './category.model';
import { SubscriptionOccurrence } from './subscription-occurrence.model';
import { SubscriptionCreationAttributes } from '../types/interfaces';

export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Table({
  tableName: 'subscriptions',
  timestamps: true,
})
export class Subscription extends Model<Subscription, SubscriptionCreationAttributes> {
  @ApiProperty({ description: 'ID unique de l abonnement' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom de l abonnement', example: 'Netflix Premium' })
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ description: 'Montant de l abonnement', example: 15.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @ApiProperty({
    description: 'Frequence de l abonnement',
    enum: SubscriptionFrequency,
    example: SubscriptionFrequency.MONTHLY,
  })
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionFrequency)),
    allowNull: false,
    defaultValue: SubscriptionFrequency.MONTHLY,
  })
  declare frequency: SubscriptionFrequency;

  @ApiProperty({
    description: 'Jour du mois pour les frequences mensuelles',
    example: 14,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 31 },
  })
  declare dayOfMonth: number | null;

  @ApiProperty({
    description: 'Jour de la semaine pour les frequences hebdomadaires',
    example: null,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 6 },
  })
  declare dayOfWeek: number | null;

  @ApiProperty({
    description: 'Date de debut de l abonnement au format DD/MM/YYYY',
    example: '14/01/2024',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @ApiProperty({
    description: 'Date de fin de l abonnement au format DD/MM/YYYY',
    example: null,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare endDate: Date | null;

  @ApiProperty({ description: 'Indique si l abonnement est actif', example: true })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @ApiProperty({ description: 'ID de la categorie', example: 1, required: false, nullable: true })
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number | null;

  @ApiProperty({ description: 'ID de la banque', example: 1, required: false, nullable: true })
  @ForeignKey(() => Bank)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare bankId: number | null;

  @ApiProperty({ description: 'Categorie associee', required: false })
  @BelongsTo(() => Category)
  declare category: Category;

  @ApiProperty({ description: 'Banque associee', required: false })
  @BelongsTo(() => Bank)
  declare bank: Bank;

  @ApiProperty({ description: 'Occurrences associees a cet abonnement', required: false })
  @HasMany(() => SubscriptionOccurrence)
  declare occurrences: SubscriptionOccurrence[];

  @ApiProperty({ description: 'Date de creation', example: '2025-09-25T17:51:06.539Z' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({
    description: 'Date de derniere modification',
    example: '2025-09-25T17:51:06.539Z',
  })
  @UpdatedAt
  declare updatedAt: Date;
}
