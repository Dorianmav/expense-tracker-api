import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsFrenchDate } from '../../../utils';

export class CalendarProjectionQueryDto {
  @ApiProperty({
    description: 'Date de debut au format DD/MM/YYYY',
    example: '01/01/2026',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  startDate?: string;

  @ApiProperty({
    description: 'Date de fin au format DD/MM/YYYY',
    example: '31/12/2026',
    required: false,
  })
  @IsOptional()
  @IsFrenchDate()
  endDate?: string;
}
