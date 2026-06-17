import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsInt,
  IsOptional,
  MinLength, 
  MaxLength, 
  Min 
} from 'class-validator';
import { ExpenseType } from '../../../models/expense.model';
import { IsFrenchDate } from '../../../utils';

export class CreateExpenseDto {
  @ApiProperty({ 
    description: 'Montant de la dépense',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ 
    description: 'Date de la dépense au format DD/MM/YYYY',
    example: '15/01/2024',
  })
  @IsFrenchDate()
  date: string;

  @ApiProperty({ 
    description: 'Description de la dépense',
    example: 'Repas du midi au restaurant',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @ApiProperty({ 
    description: 'Type de dépense',
    enum: ExpenseType,
    example: ExpenseType.SIMPLE,
  })
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ApiProperty({ 
    description: 'ID de la catégorie',
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
    description: 'ID de l\'abonnement (si applicable)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  subscriptionId?: number;

  @ApiProperty({ 
    description: 'ID du paiement échelonné (si applicable)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  installmentId?: number;
}
