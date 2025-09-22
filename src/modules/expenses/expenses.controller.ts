import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseType } from '../../models/expense.model';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle dépense' })
  @ApiResponse({ 
    status: 201, 
    description: 'Dépense créée avec succès',
    type: Expense,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Catégorie ou banque non trouvée' })
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les dépenses' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de toutes les dépenses',
    type: [Expense],
  })
  findAll(): Promise<Expense[]> {
    return this.expensesService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Récupérer les dépenses du jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des dépenses d\'aujourd\'hui',
    type: [Expense],
  })
  findTodayExpenses(): Promise<Expense[]> {
    return this.expensesService.findTodayExpenses();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Récupérer les dépenses par période' })
  @ApiQuery({ name: 'startDate', description: 'Date de début (DD/MM/YYYY)', example: '01/01/2024' })
  @ApiQuery({ name: 'endDate', description: 'Date de fin (DD/MM/YYYY)', example: '31/01/2024' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des dépenses pour la période',
    type: [Expense],
  })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Expense[]> {
    return this.expensesService.findByDateRange(startDate, endDate);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Récupérer les dépenses par catégorie' })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des dépenses pour la catégorie',
    type: [Expense],
  })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number): Promise<Expense[]> {
    return this.expensesService.findByCategory(categoryId);
  }

  @Get('bank/:bankId')
  @ApiOperation({ summary: 'Récupérer les dépenses par banque' })
  @ApiParam({ name: 'bankId', description: 'ID de la banque' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des dépenses pour la banque',
    type: [Expense],
  })
  findByBank(@Param('bankId', ParseIntPipe) bankId: number): Promise<Expense[]> {
    return this.expensesService.findByBank(bankId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Récupérer les dépenses par type' })
  @ApiParam({ 
    name: 'type', 
    description: 'Type de dépense',
    enum: ExpenseType,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des dépenses pour le type',
    type: [Expense],
  })
  findByType(@Param('type') type: ExpenseType): Promise<Expense[]> {
    return this.expensesService.findByType(type);
  }

  @Get('stats/by-category')
  @ApiOperation({ summary: 'Récupérer les totaux par catégorie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Totaux des dépenses par catégorie',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoryName: { type: 'string', example: 'Alimentation' },
          total: { type: 'number', example: 245.67 }
        }
      }
    }
  })
  getTotalByCategory(): Promise<{ categoryName: string; total: number }[]> {
    return this.expensesService.getTotalByCategory();
  }

  @Get('stats/by-bank')
  @ApiOperation({ summary: 'Récupérer les totaux par banque' })
  @ApiResponse({ 
    status: 200, 
    description: 'Totaux des dépenses par banque',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bankName: { type: 'string', example: 'BNP Paribas' },
          total: { type: 'number', example: 1245.67 }
        }
      }
    }
  })
  getTotalByBank(): Promise<{ bankName: string; total: number }[]> {
    return this.expensesService.getTotalByBank();
  }

  @Get('stats/monthly/:year/:month')
  @ApiOperation({ summary: 'Récupérer le total mensuel' })
  @ApiParam({ name: 'year', description: 'Année', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mois (1-12)', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Total des dépenses pour le mois',
    schema: { type: 'number', example: 1245.67 }
  })
  getMonthlyTotal(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<number> {
    return this.expensesService.getMonthlyTotal(year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une dépense par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la dépense' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dépense trouvée',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Expense> {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une dépense' })
  @ApiParam({ name: 'id', description: 'ID de la dépense' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dépense mise à jour',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une dépense' })
  @ApiParam({ name: 'id', description: 'ID de la dépense' })
  @ApiResponse({ status: 200, description: 'Dépense supprimée' })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expensesService.remove(id);
  }
}
