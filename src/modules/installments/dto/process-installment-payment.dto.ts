import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ProcessInstallmentPaymentDto {
  @ApiProperty({
    description: 'Montant reel paye pour la prochaine occurrence',
    example: 100,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;
}
