import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsBoolean,
  MinLength, 
  MaxLength, 
  Min 
} from 'class-validator';
import { SubscriptionFrequency } from '../../../models/subscription.model';
import { IsFrenchDate } from '../../../utils';

export class CreateSubscriptionDto {
  @ApiProperty({ 
    description: 'Nom de l\'abonnement',
    example: 'Netflix Premium',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ 
    description: 'Montant de l\'abonnement',
    example: 15.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ 
    description: 'Fréquence de l\'abonnement',
    enum: SubscriptionFrequency,
    example: SubscriptionFrequency.MONTHLY,
  })
  @IsEnum(SubscriptionFrequency)
  frequency: SubscriptionFrequency;

  @ApiProperty({ 
    description: 'Date de début de l\'abonnement',
    example: '01/01/2024',
  })
  @IsFrenchDate()
  startDate: string;

  @ApiProperty({ 
    description: 'Date de fin de l\'abonnement au format DD/MM/YYYY (optionnelle)',
    example: '31/12/2024',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  endDate?: string;

  @ApiProperty({ 
    description: 'Indique si l\'abonnement est actif',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
