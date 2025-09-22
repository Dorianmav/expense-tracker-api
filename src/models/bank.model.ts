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
import { BankCreationAttributes } from '../types/interfaces';
import { Expense } from './expense.model';

@Table({
  tableName: 'banks',
  timestamps: true,
})
export class Bank extends Model<Bank, BankCreationAttributes> {
  @ApiProperty({ description: 'ID unique de la banque' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom de la banque' })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @ApiProperty({ description: 'Dépenses associées à cette banque', required: false })
  @HasMany(() => require('./expense.model').Expense)
  declare expenses: Expense[];

  @ApiProperty({ description: 'Date de création' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdatedAt
  declare updatedAt: Date;
}
