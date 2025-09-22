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
import { Category } from './category.model';
import { Bank } from './bank.model';
import { Subscription } from './subscription.model';
import { Installment } from './installment.model';
import { ExpenseCreationAttributes } from '../types/interfaces';

export enum ExpenseType {
  SIMPLE = 'simple',
  SUBSCRIPTION = 'subscription',
  INSTALLMENT = 'installment',
}

@Table({
  tableName: 'expenses',
  timestamps: true,
})
export class Expense extends Model<Expense, ExpenseCreationAttributes> {
  @ApiProperty({ description: 'ID unique de la dépense' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Montant de la dépense' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @ApiProperty({ description: 'Date de la dépense' })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @ApiProperty({ description: 'Description de la dépense' })
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare description: string;

  @ApiProperty({ 
    description: 'Type de dépense',
    enum: ExpenseType,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ExpenseType)),
    allowNull: false,
    defaultValue: ExpenseType.SIMPLE,
  })
  declare type: ExpenseType;

  @ApiProperty({ description: 'ID de la catégorie' })
  @ForeignKey(() => require('./category.model').Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @ApiProperty({ description: 'ID de la banque' })
  @ForeignKey(() => require('./bank.model').Bank)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare bankId: number;

  @ApiProperty({ description: 'ID de l\'abonnement (si applicable)', required: false })
  @ForeignKey(() => require('./subscription.model').Subscription)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare subscriptionId: number;

  @ApiProperty({ description: 'ID du paiement échelonné (si applicable)', required: false })
  @ForeignKey(() => require('./installment.model').Installment)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare installmentId: number;

  @ApiProperty({ description: 'Catégorie associée', required: false })
  @BelongsTo(() => require('./category.model').Category)
  declare category: Category;

  @ApiProperty({ description: 'Banque associée', required: false })
  @BelongsTo(() => require('./bank.model').Bank)
  declare bank: Bank;

  @ApiProperty({ description: 'Abonnement associé (si applicable)', required: false })
  @BelongsTo(() => require('./subscription.model').Subscription)
  declare subscription: Subscription;

  @ApiProperty({ description: 'Paiement échelonné associé (si applicable)', required: false })
  @BelongsTo(() => require('./installment.model').Installment)
  declare installment: Installment;

  @ApiProperty({ description: 'Date de création' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdatedAt
  declare updatedAt: Date;
}
