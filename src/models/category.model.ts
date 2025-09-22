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
import { CategoryCreationAttributes } from '../types/interfaces';
import { Expense } from './expense.model';

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model<Category, CategoryCreationAttributes> {
  @ApiProperty({ description: 'ID unique de la catégorie' })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ApiProperty({ description: 'Nom de la catégorie' })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ description: 'ID de la catégorie parent (pour les sous-catégories)', required: false })
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare parentId: number;

  @ApiProperty({ description: 'Catégorie parent', required: false })
  @BelongsTo(() => Category, 'parentId')
  declare parent: Category;

  @ApiProperty({ description: 'Sous-catégories', required: false })
  @HasMany(() => Category, 'parentId')
  declare children: Category[];

  @ApiProperty({ description: 'Dépenses associées à cette catégorie', required: false })
  @HasMany(() => require('./expense.model').Expense)
  declare expenses: Expense[];

  @ApiProperty({ description: 'Date de création' })
  @CreatedAt
  declare createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  @UpdatedAt
  declare updatedAt: Date;
}
