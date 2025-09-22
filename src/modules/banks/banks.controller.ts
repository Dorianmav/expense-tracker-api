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
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from '../../models/bank.model';

@ApiTags('banks')
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle banque' })
  @ApiResponse({ 
    status: 201, 
    description: 'Banque créée avec succès',
    type: Bank,
  })
  @ApiResponse({ status: 409, description: 'Une banque avec ce nom existe déjà' })
  create(@Body() createBankDto: CreateBankDto): Promise<Bank> {
    return this.banksService.create(createBankDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les banques' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de toutes les banques',
    type: [Bank],
  })
  findAll(): Promise<Bank[]> {
    return this.banksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une banque par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la banque' })
  @ApiResponse({ 
    status: 200, 
    description: 'Banque trouvée',
    type: Bank,
  })
  @ApiResponse({ status: 404, description: 'Banque non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.banksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une banque' })
  @ApiParam({ name: 'id', description: 'ID de la banque' })
  @ApiResponse({ 
    status: 200, 
    description: 'Banque mise à jour',
    type: Bank,
  })
  @ApiResponse({ status: 404, description: 'Banque non trouvée' })
  @ApiResponse({ status: 409, description: 'Une banque avec ce nom existe déjà' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDto: UpdateBankDto,
  ): Promise<Bank> {
    return this.banksService.update(id, updateBankDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une banque' })
  @ApiParam({ name: 'id', description: 'ID de la banque' })
  @ApiResponse({ status: 200, description: 'Banque supprimée' })
  @ApiResponse({ status: 404, description: 'Banque non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.banksService.remove(id);
  }
}
