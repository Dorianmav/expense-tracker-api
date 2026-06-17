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
import { ExpenseCreationAttributes } from '../types/interfaces';

export enum ExpenseType {
  SIMPLE = 'simple',
  SUBSCRIPTION = 'subscription',
  INSTALLMENT = 'installment',
}

export enum ExpenseSource {
  MANUAL = 'manual',
  BANK_IMPORT = 'bank_import',
}

@Table({
  tableName: 'expenses',
  timestamps: true,
})
export class Expense extends Model<Expense, ExpenseCreationAttributes> {
  @ApiProperty({ description: 'ID unique de la depense' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Montant de la depense', example: 25.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @ApiProperty({ description: 'Date de la depense au format DD/MM/YYYY', example: '24/09/2025' })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @ApiProperty({ description: 'Description de la depense', example: 'Courses du weekend' })
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare description: string;

  @ApiProperty({
    description: 'Couleur optionnelle de la depense',
    example: '#2F80ED',
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare color: string | null;

  @ApiProperty({
    description: 'Type de depense',
    enum: ExpenseType,
    example: ExpenseType.SIMPLE,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ExpenseType)),
    allowNull: false,
    defaultValue: ExpenseType.SIMPLE,
  })
  declare type: ExpenseType;

  @ApiProperty({
    description: 'Source de la depense',
    enum: ExpenseSource,
    example: ExpenseSource.MANUAL,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ExpenseSource)),
    allowNull: false,
    defaultValue: ExpenseSource.MANUAL,
  })
  declare source: ExpenseSource;

  @ApiProperty({ description: 'ID de la categorie', example: 1 })
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @ApiProperty({ description: 'ID de la banque', example: 1 })
  @ForeignKey(() => Bank)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare bankId: number;

  @ApiProperty({
    description: 'ID de l occurrence payee, selon le type',
    example: null,
    required: false,
    nullable: true,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare occurrenceId: number | null;

  @ApiProperty({ description: 'Categorie associee', required: false })
  @BelongsTo(() => Category)
  declare category: Category;

  @ApiProperty({ description: 'Banque associee', required: false })
  @BelongsTo(() => Bank)
  declare bank: Bank;

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
