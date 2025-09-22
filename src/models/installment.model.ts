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
import { InstallmentCreationAttributes } from '../types/interfaces';

@Table({
  tableName: 'installments',
  timestamps: true,
})
export class Installment extends Model<Installment, InstallmentCreationAttributes> {
  @ApiProperty({ description: 'ID unique du paiement échelonné' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom du paiement échelonné' })
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ description: 'Montant total du paiement échelonné' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare totalAmount: number;

  @ApiProperty({ description: 'Montant restant à payer' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare remainingAmount: number;

  @ApiProperty({ description: 'Nombre total de paiements' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare numberOfPayments: number;

  @ApiProperty({ description: 'Nombre de paiements restants' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare remainingPayments: number;

  @ApiProperty({ description: 'Date du prochain paiement' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare nextPaymentDate: Date;

  @ApiProperty({ description: 'Dates personnalisées de tous les paiements (format JSON)', required: false })
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare customPaymentDates: Date[];

  @ApiProperty({ description: 'Indique si le paiement échelonné est terminé' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCompleted: boolean;

  @ApiProperty({ description: 'Dépenses associées à ce paiement échelonné', required: false })
  @HasMany(() => require('./expense.model').Expense)
  declare expenses: Expense[];

  @ApiProperty({ description: 'Date de création' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdatedAt
  declare updatedAt: Date;
}
