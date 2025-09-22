import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from '../../models/subscription.model';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel abonnement' })
  @ApiResponse({ 
    status: 201, 
    description: 'Abonnement créé avec succès',
    type: Subscription,
  })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les abonnements' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de tous les abonnements',
    type: [Subscription],
  })
  findAll(): Promise<Subscription[]> {
    return this.subscriptionsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les abonnements actifs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des abonnements actifs',
    type: [Subscription],
  })
  findActive(): Promise<Subscription[]> {
    return this.subscriptionsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un abonnement par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Abonnement trouvé',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Subscription> {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un abonnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Abonnement mis à jour',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver un abonnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Abonnement désactivé',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  deactivate(@Param('id', ParseIntPipe) id: number): Promise<Subscription> {
    return this.subscriptionsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activer un abonnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Abonnement activé',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  activate(@Param('id', ParseIntPipe) id: number): Promise<Subscription> {
    return this.subscriptionsService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un abonnement' })
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @ApiResponse({ status: 200, description: 'Abonnement supprimé' })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.subscriptionsService.remove(id);
  }
}
