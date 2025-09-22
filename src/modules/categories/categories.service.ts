import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../../models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  async findMainCategories(): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parentId: null as any },
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  async findSubCategories(parentId: number): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parentId },
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          required: false,
        },
      ],
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} non trouvée`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    await category.update(updateCategoryDto);
    return category;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await category.destroy();
  }
}
