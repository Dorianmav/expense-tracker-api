import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OccurrenceStatus } from '../../../models/occurrence-status.enum';

export class UpdateOccurrenceStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de l occurrence',
    enum: OccurrenceStatus,
    example: OccurrenceStatus.PAID,
  })
  @IsEnum(OccurrenceStatus)
  status: OccurrenceStatus;
}
