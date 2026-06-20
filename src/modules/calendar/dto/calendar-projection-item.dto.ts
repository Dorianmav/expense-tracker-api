import { ApiProperty } from '@nestjs/swagger';
import { OccurrenceStatus } from '../../../models/occurrence-status.enum';

export enum CalendarProjectionKind {
  SUBSCRIPTION = 'subscription',
  INSTALLMENT = 'installment',
}

export class CalendarProjectionItemDto {
  @ApiProperty({ description: 'ID unique de l occurrence', example: 12 })
  id: number;

  @ApiProperty({
    description: 'Type de source calendrier',
    enum: CalendarProjectionKind,
    example: CalendarProjectionKind.SUBSCRIPTION,
  })
  kind: CalendarProjectionKind;

  @ApiProperty({ description: 'ID de l abonnement ou du paiement echelonne', example: 3 })
  ownerId: number;

  @ApiProperty({
    description: 'Nom de l abonnement ou du paiement echelonne',
    example: 'Netflix Premium',
  })
  ownerName: string;

  @ApiProperty({
    description: 'Date theorique de paiement au format DD/MM/YYYY',
    example: '14/02/2026',
  })
  dueDate: string;

  @ApiProperty({
    description: 'Date reelle de paiement si deja payee au format DD/MM/YYYY',
    example: '14/02/2026',
    nullable: true,
  })
  paidDate: string | null;

  @ApiProperty({
    description: 'ID de la depense reelle si occurrence payee',
    example: 42,
    nullable: true,
  })
  expenseId: number | null;

  @ApiProperty({
    description: 'Statut de l occurrence',
    enum: OccurrenceStatus,
    example: OccurrenceStatus.PENDING,
  })
  status: OccurrenceStatus;

  @ApiProperty({ description: 'Montant prevu ou reel', example: 15.99 })
  amount: number;

  @ApiProperty({ description: 'ID de la categorie associee', example: 1, nullable: true })
  categoryId: number | null;

  @ApiProperty({
    description: 'Nom de la categorie associee',
    example: 'Streaming',
    nullable: true,
  })
  categoryName: string | null;

  @ApiProperty({ description: 'ID de la banque associee', example: 1, nullable: true })
  bankId: number | null;

  @ApiProperty({ description: 'Nom de la banque associee', example: 'BNP Paribas', nullable: true })
  bankName: string | null;
}
