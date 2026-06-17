import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsFrenchDate, IsFrenchDateArray } from '../../../utils';

export class CreateInstallmentDto {
  @ApiProperty({
    description: 'Nom du paiement echelonne',
    example: 'iPhone 15 Pro',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Montant total du paiement echelonne',
    example: 1199.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    description: 'Nombre total de paiements',
    example: 12,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  numberOfPayments: number;

  @ApiProperty({
    description: 'Date de debut du paiement echelonne',
    example: '01/02/2024',
  })
  @IsFrenchDate()
  startDate: string;

  @ApiProperty({
    description: 'Date du prochain paiement, conservee pour compatibilite',
    example: '01/02/2024',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  nextPaymentDate?: string;

  @ApiProperty({
    description: 'Dates personnalisees de tous les paiements',
    example: ['01/02/2024', '01/03/2024', '01/04/2024'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsFrenchDateArray()
  customPaymentDates?: string[];

  @ApiProperty({
    description: 'Indique si le paiement echelonne est termine',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({
    description: 'ID de la categorie',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiProperty({
    description: 'ID de la banque',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  bankId?: number;
}
