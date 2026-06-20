import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Expense } from './expense.model';
import { Subscription } from './subscription.model';
import { OccurrenceStatus } from './occurrence-status.enum';
import { SubscriptionOccurrenceCreationAttributes } from '../types/interfaces';

@Table({
  tableName: 'subscription_occurrences',
  timestamps: true,
  indexes: [
    { fields: ['subscriptionId', 'dueDate'], unique: true },
    { fields: ['dueDate'] },
    { fields: ['status'] },
  ],
})
export class SubscriptionOccurrence extends Model<
  SubscriptionOccurrence,
  SubscriptionOccurrenceCreationAttributes
> {
  @ApiProperty({ description: 'ID unique de l occurrence abonnement' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'ID de l abonnement', example: 1 })
  @ForeignKey(() => Subscription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare subscriptionId: number;

  @ApiProperty({
    description: 'Date theorique de paiement au format DD/MM/YYYY',
    example: '14/02/2026',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare dueDate: Date;

  @ApiProperty({
    description: 'Date reelle de paiement au format DD/MM/YYYY',
    example: null,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare paidDate: Date | null;

  @ApiProperty({
    description: 'ID de la depense payee',
    example: null,
    required: false,
    nullable: true,
  })
  @ForeignKey(() => Expense)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare expenseId: number | null;

  @ApiProperty({
    description: 'Statut de l occurrence',
    enum: OccurrenceStatus,
    example: OccurrenceStatus.PENDING,
  })
  @Column({
    type: DataType.ENUM(...Object.values(OccurrenceStatus)),
    allowNull: false,
    defaultValue: OccurrenceStatus.PENDING,
  })
  declare status: OccurrenceStatus;

  @ApiProperty({ description: 'Montant prevu ou ajuste', example: 15.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @ApiProperty({ description: 'Abonnement associe', required: false })
  @BelongsTo(() => Subscription)
  declare subscription: Subscription;

  @ApiProperty({ description: 'Depense associee', required: false })
  @BelongsTo(() => Expense)
  declare expense: Expense;

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
