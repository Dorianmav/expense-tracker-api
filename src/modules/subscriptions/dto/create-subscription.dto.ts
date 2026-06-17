import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SubscriptionFrequency } from '../../../models/subscription.model';
import { IsFrenchDate } from '../../../utils';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Nom de l abonnement',
    example: 'Netflix Premium',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Montant de l abonnement',
    example: 15.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Frequence de l abonnement',
    enum: SubscriptionFrequency,
    example: SubscriptionFrequency.MONTHLY,
  })
  @IsEnum(SubscriptionFrequency)
  frequency: SubscriptionFrequency;

  @ApiProperty({
    description: 'Jour du mois pour les frequences mensuelles, trimestrielles et annuelles',
    example: 14,
    minimum: 1,
    maximum: 31,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({
    description: 'Jour de la semaine pour les frequences hebdomadaires, 0 = dimanche',
    example: 1,
    minimum: 0,
    maximum: 6,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({
    description: 'Date de debut de l abonnement',
    example: '01/01/2024',
  })
  @IsFrenchDate()
  startDate: string;

  @ApiProperty({
    description: 'Date de fin de l abonnement au format DD/MM/YYYY',
    example: '31/12/2024',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  endDate?: string;

  @ApiProperty({
    description: 'Indique si l abonnement est actif',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
