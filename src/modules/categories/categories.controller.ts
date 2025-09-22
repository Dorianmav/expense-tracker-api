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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../../models/category.model';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiResponse({ 
    status: 201, 
    description: 'Catégorie créée avec succès',
    type: Category,
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste de toutes les catégories',
    type: [Category],
  })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get('main')
  @ApiOperation({ summary: 'Récupérer les catégories principales (sans parent)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des catégories principales',
    type: [Category],
  })
  findMainCategories(): Promise<Category[]> {
    return this.categoriesService.findMainCategories();
  }

  @Get('subcategories/:parentId')
  @ApiOperation({ summary: 'Récupérer les sous-catégories d\'une catégorie parent' })
  @ApiParam({ name: 'parentId', description: 'ID de la catégorie parent' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des sous-catégories',
    type: [Category],
  })
  findSubCategories(@Param('parentId', ParseIntPipe) parentId: number): Promise<Category[]> {
    return this.categoriesService.findSubCategories(parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Catégorie trouvée',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Catégorie mise à jour',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
