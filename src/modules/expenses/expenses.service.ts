import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Expense, ExpenseType } from '../../models/expense.model';
import { Category } from '../../models/category.model';
import { Bank } from '../../models/bank.model';
import { Subscription } from '../../models/subscription.model';
import { Installment } from '../../models/installment.model';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { BanksService } from '../banks/banks.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { InstallmentsService } from '../installments/installments.service';
import { ExpenseCreationAttributes } from '../../types/interfaces';
import { parseFrenchDate } from '../../utils';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense)
    private expenseModel: typeof Expense,
    private categoriesService: CategoriesService,
    private banksService: BanksService,
    private subscriptionsService: SubscriptionsService,
    private installmentsService: InstallmentsService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    // Vérifier que la catégorie et la banque existent
    await this.categoriesService.findOne(createExpenseDto.categoryId);
    await this.banksService.findOne(createExpenseDto.bankId);

    // Vérifications spécifiques selon le type
    if (createExpenseDto.type === ExpenseType.SUBSCRIPTION) {
      if (!createExpenseDto.subscriptionId) {
        throw new BadRequestException('subscriptionId est requis pour les dépenses d\'abonnement');
      }
      await this.subscriptionsService.findOne(createExpenseDto.subscriptionId);
    }

    if (createExpenseDto.type === ExpenseType.INSTALLMENT) {
      if (!createExpenseDto.installmentId) {
        throw new BadRequestException('installmentId est requis pour les dépenses échelonnées');
      }
      await this.installmentsService.findOne(createExpenseDto.installmentId);
    }

    // Préparer les données pour Sequelize avec conversion de date
    const expenseData: ExpenseCreationAttributes = {
      amount: createExpenseDto.amount,
      description: createExpenseDto.description,
      type: createExpenseDto.type,
      categoryId: createExpenseDto.categoryId,
      bankId: createExpenseDto.bankId,
      date: createExpenseDto.date ? parseFrenchDate(createExpenseDto.date) : new Date(),
      subscriptionId: createExpenseDto.subscriptionId,
      installmentId: createExpenseDto.installmentId,
    };

    return this.expenseModel.create(expenseData);
  }


  async findAll(): Promise<Expense[]> {
    return this.expenseModel.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findTodayExpenses(): Promise<Expense[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.expenseModel.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findByCategory(categoryId: number): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { categoryId },
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findByBank(bankId: number): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { bankId },
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findByType(type: ExpenseType): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { type },
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
      order: [['date', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseModel.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Bank, as: 'bank' },
        { model: Subscription, as: 'subscription', required: false },
        { model: Installment, as: 'installment', required: false },
      ],
    });

    if (!expense) {
      throw new NotFoundException(`Dépense avec l'ID ${id} non trouvée`);
    }

    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    // Vérifications si les IDs sont modifiés
    if (updateExpenseDto.categoryId && updateExpenseDto.categoryId !== expense.categoryId) {
      await this.categoriesService.findOne(updateExpenseDto.categoryId);
    }

    if (updateExpenseDto.bankId && updateExpenseDto.bankId !== expense.bankId) {
      await this.banksService.findOne(updateExpenseDto.bankId);
    }

    if (updateExpenseDto.subscriptionId && updateExpenseDto.subscriptionId !== expense.subscriptionId) {
      await this.subscriptionsService.findOne(updateExpenseDto.subscriptionId);
    }

    if (updateExpenseDto.installmentId && updateExpenseDto.installmentId !== expense.installmentId) {
      await this.installmentsService.findOne(updateExpenseDto.installmentId);
    }

    // Préparer les données de mise à jour avec conversion de date
    const updateData: Partial<ExpenseCreationAttributes> = {};
    
    // Copier les propriétés modifiées
    if (updateExpenseDto.amount !== undefined) updateData.amount = updateExpenseDto.amount;
    if (updateExpenseDto.description !== undefined) updateData.description = updateExpenseDto.description;
    if (updateExpenseDto.type !== undefined) updateData.type = updateExpenseDto.type;
    if (updateExpenseDto.categoryId !== undefined) updateData.categoryId = updateExpenseDto.categoryId;
    if (updateExpenseDto.bankId !== undefined) updateData.bankId = updateExpenseDto.bankId;
    if (updateExpenseDto.subscriptionId !== undefined) updateData.subscriptionId = updateExpenseDto.subscriptionId;
    if (updateExpenseDto.installmentId !== undefined) updateData.installmentId = updateExpenseDto.installmentId;
    
    // Convertir la date string en objet Date si fournie
    if (updateExpenseDto.date) {
      updateData.date = parseFrenchDate(updateExpenseDto.date);
    }

    await expense.update(updateData);
    return expense;
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    await expense.destroy();
  }

  async getTotalByCategory(): Promise<{ categoryName: string; total: number }[]> {
    const expenses = await this.expenseModel.findAll({
      include: [{ model: Category, as: 'category' }],
    });

    const totals = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals).map(([categoryName, total]) => ({
      categoryName,
      total,
    }));
  }

  async getTotalByBank(): Promise<{ bankName: string; total: number }[]> {
    const expenses = await this.expenseModel.findAll({
      include: [{ model: Bank, as: 'bank' }],
    });

    const totals = expenses.reduce((acc, expense) => {
      const bankName = expense.bank.name;
      acc[bankName] = (acc[bankName] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals).map(([bankName, total]) => ({
      bankName,
      total,
    }));
  }

  async getMonthlyTotal(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await this.expenseModel.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  }
}
