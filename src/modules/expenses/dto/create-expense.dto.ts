import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ExpenseSource, ExpenseType } from '../../../models/expense.model';
import { IsFrenchDate } from '../../../utils';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Montant de la depense',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Date de la depense au format DD/MM/YYYY',
    example: '15/01/2024',
  })
  @IsFrenchDate()
  date: string;

  @ApiProperty({
    description: 'Description de la depense',
    example: 'Repas du midi au restaurant',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Couleur optionnelle de la depense',
    example: '#2F80ED',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({
    description: 'Type de depense',
    enum: ExpenseType,
    example: ExpenseType.SIMPLE,
  })
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ApiProperty({
    description: 'Source de la depense',
    enum: ExpenseSource,
    example: ExpenseSource.MANUAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExpenseSource)
  source?: ExpenseSource;

  @ApiProperty({
    description: 'ID de la categorie',
    example: 1,
  })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    description: 'ID de la banque',
    example: 1,
  })
  @IsInt()
  @Min(1)
  bankId: number;

  @ApiProperty({
    description: 'ID de l occurrence payee pour un abonnement ou echeancier',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  occurrenceId?: number;
}
