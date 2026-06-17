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
import { InstallmentOccurrence } from './installment-occurrence.model';
import { InstallmentCreationAttributes } from '../types/interfaces';

@Table({
  tableName: 'installments',
  timestamps: true,
})
export class Installment extends Model<Installment, InstallmentCreationAttributes> {
  @ApiProperty({ description: 'ID unique du paiement echelonne' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom du paiement echelonne', example: 'iPhone 15 Pro' })
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ description: 'Montant total du paiement echelonne', example: 1199.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare totalAmount: number;

  @ApiProperty({ description: 'Nombre total de paiements', example: 12 })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare numberOfPayments: number;

  @ApiProperty({
    description: 'Date de debut du paiement echelonne au format DD/MM/YYYY',
    example: '01/02/2024',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @ApiProperty({
    description: 'Date du prochain paiement au format DD/MM/YYYY',
    example: '01/03/2024',
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare nextPaymentDate: Date | null;

  @ApiProperty({
    description: 'Anciennes dates personnalisees a migrer au format DD/MM/YYYY',
    example: ['01/02/2024', '01/03/2024', '01/04/2024'],
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare customPaymentDates: Date[] | null;

  @ApiProperty({ description: 'Indique si le paiement echelonne est termine', example: false })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isCompleted: boolean;

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

  @ApiProperty({ description: 'Occurrences associees', required: false })
  @HasMany(() => InstallmentOccurrence)
  declare occurrences: InstallmentOccurrence[];

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
