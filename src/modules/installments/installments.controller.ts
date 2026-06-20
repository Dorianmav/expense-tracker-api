import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import { ProcessInstallmentPaymentDto } from './dto/process-installment-payment.dto';
import { Installment } from '../../models/installment.model';

@ApiTags('installments')
@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement échelonné' })
  @ApiResponse({
    status: 201,
    description: 'Paiement échelonné créé avec succès',
    type: Installment,
  })
  create(@Body() createInstallmentDto: CreateInstallmentDto): Promise<Installment> {
    return this.installmentsService.create(createInstallmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les paiements échelonnés' })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les paiements échelonnés',
    type: [Installment],
  })
  findAll(): Promise<Installment[]> {
    return this.installmentsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les paiements échelonnés actifs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des paiements échelonnés actifs',
    type: [Installment],
  })
  findActive(): Promise<Installment[]> {
    return this.installmentsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement échelonné par son ID' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({
    status: 200,
    description: 'Paiement échelonné trouvé',
    type: Installment,
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Installment> {
    return this.installmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un paiement échelonné' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({
    status: 200,
    description: 'Paiement échelonné mis à jour',
    type: Installment,
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstallmentDto: UpdateInstallmentDto,
  ): Promise<Installment> {
    return this.installmentsService.update(id, updateInstallmentDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marquer un paiement échelonné comme terminé' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({
    status: 200,
    description: 'Paiement échelonné marqué comme terminé',
    type: Installment,
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  markAsCompleted(@Param('id', ParseIntPipe) id: number): Promise<Installment> {
    return this.installmentsService.markAsCompleted(id);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Traiter un paiement pour un paiement échelonné' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiBody({ type: ProcessInstallmentPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Paiement traité avec succès',
    type: Installment,
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  processPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() processPaymentDto: ProcessInstallmentPaymentDto,
  ): Promise<Installment> {
    return this.installmentsService.processPayment(id, processPaymentDto.amount);
  }

  @Get(':id/next-payment-date')
  @ApiOperation({ summary: 'Récupérer la prochaine date de paiement' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({
    status: 200,
    description: 'Prochaine date de paiement',
    schema: { type: 'string', example: '01/02/2024' },
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  getNextPaymentDate(@Param('id', ParseIntPipe) id: number): Promise<Date | null> {
    return this.installmentsService.getNextPaymentDate(id);
  }

  @Get(':id/upcoming-payments')
  @ApiOperation({ summary: 'Récupérer toutes les dates de paiements à venir' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({
    status: 200,
    description: 'Liste des dates de paiements à venir',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['01/02/2024', '01/03/2024', '01/04/2024'],
    },
  })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  getAllUpcomingPayments(@Param('id', ParseIntPipe) id: number): Promise<Date[]> {
    return this.installmentsService.getAllUpcomingPayments(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un paiement échelonné' })
  @ApiParam({ name: 'id', description: 'ID du paiement échelonné' })
  @ApiResponse({ status: 200, description: 'Paiement échelonné supprimé' })
  @ApiResponse({ status: 404, description: 'Paiement échelonné non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.installmentsService.remove(id);
  }
}
