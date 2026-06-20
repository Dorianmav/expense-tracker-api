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
import { Installment } from './installment.model';
import { OccurrenceStatus } from './occurrence-status.enum';
import { InstallmentOccurrenceCreationAttributes } from '../types/interfaces';

@Table({
  tableName: 'installment_occurrences',
  timestamps: true,
  indexes: [
    { fields: ['installmentId', 'occurrenceNumber'], unique: true },
    { fields: ['dueDate'] },
    { fields: ['status'] },
  ],
})
export class InstallmentOccurrence extends Model<
  InstallmentOccurrence,
  InstallmentOccurrenceCreationAttributes
> {
  @ApiProperty({ description: 'ID unique de l occurrence echelonnee' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'ID du paiement echelonne', example: 1 })
  @ForeignKey(() => Installment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare installmentId: number;

  @ApiProperty({ description: 'Numero de l occurrence', example: 4 })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare occurrenceNumber: number;

  @ApiProperty({
    description: 'Date theorique de paiement au format DD/MM/YYYY',
    example: '01/05/2026',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare dueDate: Date;

  @ApiProperty({ description: 'Montant de cette occurrence', example: 99.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

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

  @ApiProperty({ description: 'Paiement echelonne associe', required: false })
  @BelongsTo(() => Installment)
  declare installment: Installment;

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
