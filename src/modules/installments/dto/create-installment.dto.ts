import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsInt, 
  IsDateString, 
  IsOptional, 
  IsBoolean,
  MinLength, 
  MaxLength, 
  Min 
} from 'class-validator';
import { IsFrenchDate, IsFrenchDateArray } from '../../../utils';

export class CreateInstallmentDto {
  @ApiProperty({ 
    description: 'Nom du paiement échelonné',
    example: 'iPhone 15 Pro',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ 
    description: 'Montant total du paiement échelonné',
    example: 1199.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiProperty({ 
    description: 'Montant restant à payer',
    example: 1199.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  remainingAmount: number;

  @ApiProperty({ 
    description: 'Nombre total de paiements',
    example: 12,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  numberOfPayments: number;

  @ApiProperty({ 
    description: 'Nombre de paiements restants',
    example: 12,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  remainingPayments: number;

  @ApiProperty({ 
    description: 'Date du prochain paiement',
    example: '01/02/2024',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  nextPaymentDate?: string;

  @ApiProperty({ 
    description: 'Dates personnalisées de tous les paiements',
    example: ['01/02/2024', '01/03/2024', '01/04/2024'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsFrenchDateArray()
  customPaymentDates?: string[];

  @ApiProperty({ 
    description: 'Indique si le paiement échelonné est terminé',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
