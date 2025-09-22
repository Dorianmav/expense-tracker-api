import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({ 
    description: 'Nom de la banque',
    example: 'BNP Paribas',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
