import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ 
    description: 'Nom de la catégorie',
    example: 'Alimentation',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'ID de la catégorie parent (pour les sous-catégories)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
