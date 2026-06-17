import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Expense, ExpenseSource, ExpenseType } from '../../models/expense.model';
import { Category } from '../../models/category.model';
import { Bank } from '../../models/bank.model';
import { SubscriptionOccurrence } from '../../models/subscription-occurrence.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { BanksService } from '../banks/banks.service';
import { ExpenseCreationAttributes } from '../../types/interfaces';
import { parseFrenchDate } from '../../utils';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense)
    private expenseModel: typeof Expense,
    @InjectModel(SubscriptionOccurrence)
    private subscriptionOccurrenceModel: typeof SubscriptionOccurrence,
    @InjectModel(InstallmentOccurrence)
    private installmentOccurrenceModel: typeof InstallmentOccurrence,
    private categoriesService: CategoriesService,
    private banksService: BanksService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    await this.categoriesService.findOne(createExpenseDto.categoryId);
    await this.banksService.findOne(createExpenseDto.bankId);
    await this.validateOccurrenceForExpense(createExpenseDto.type, createExpenseDto.occurrenceId);

    const expenseData: ExpenseCreationAttributes = {
      amount: createExpenseDto.amount,
      description: createExpenseDto.description,
      color: createExpenseDto.color,
      source: createExpenseDto.source ?? ExpenseSource.MANUAL,
      type: createExpenseDto.type,
      categoryId: createExpenseDto.categoryId,
      bankId: createExpenseDto.bankId,
      date: createExpenseDto.date ? parseFrenchDate(createExpenseDto.date) : new Date(),
      occurrenceId: createExpenseDto.occurrenceId,
    };

    const expense = await this.expenseModel.create(expenseData);
    await this.markOccurrenceAsPaid(expense);
    return this.findOne(expense.id);
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseModel.findAll({
      include: this.defaultIncludes(),
      order: [['date', 'DESC']],
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: {
        date: {
          [Op.between]: [parseFrenchDate(startDate), parseFrenchDate(endDate)],
        },
      },
      include: this.defaultIncludes(),
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
      include: this.defaultIncludes(),
      order: [['date', 'DESC']],
    });
  }

  async findByCategory(categoryId: number): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { categoryId },
      include: this.defaultIncludes(),
      order: [['date', 'DESC']],
    });
  }

  async findByBank(bankId: number): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { bankId },
      include: this.defaultIncludes(),
      order: [['date', 'DESC']],
    });
  }

  async findByType(type: ExpenseType): Promise<Expense[]> {
    return this.expenseModel.findAll({
      where: { type },
      include: this.defaultIncludes(),
      order: [['date', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseModel.findByPk(id, {
      include: this.defaultIncludes(),
    });

    if (!expense) {
      throw new NotFoundException(`Depense avec l'ID ${id} non trouvee`);
    }

    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    const nextType = updateExpenseDto.type ?? expense.type;
    const nextOccurrenceId = updateExpenseDto.occurrenceId ?? expense.occurrenceId ?? undefined;

    if (updateExpenseDto.categoryId && updateExpenseDto.categoryId !== expense.categoryId) {
      await this.categoriesService.findOne(updateExpenseDto.categoryId);
    }

    if (updateExpenseDto.bankId && updateExpenseDto.bankId !== expense.bankId) {
      await this.banksService.findOne(updateExpenseDto.bankId);
    }

    await this.validateOccurrenceForExpense(nextType, nextOccurrenceId, expense.id);

    const updateData: Partial<ExpenseCreationAttributes> = {};

    if (updateExpenseDto.amount !== undefined) updateData.amount = updateExpenseDto.amount;
    if (updateExpenseDto.description !== undefined)
      updateData.description = updateExpenseDto.description;
    if (updateExpenseDto.color !== undefined) updateData.color = updateExpenseDto.color;
    if (updateExpenseDto.source !== undefined) updateData.source = updateExpenseDto.source;
    if (updateExpenseDto.type !== undefined) updateData.type = updateExpenseDto.type;
    if (updateExpenseDto.categoryId !== undefined)
      updateData.categoryId = updateExpenseDto.categoryId;
    if (updateExpenseDto.bankId !== undefined) updateData.bankId = updateExpenseDto.bankId;
    if (updateExpenseDto.occurrenceId !== undefined)
      updateData.occurrenceId = updateExpenseDto.occurrenceId;

    if (updateExpenseDto.date) {
      updateData.date = parseFrenchDate(updateExpenseDto.date);
    }

    await expense.update(updateData);
    await this.markOccurrenceAsPaid(expense);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    await expense.destroy();
  }

  async getTotalByCategory(): Promise<{ categoryName: string; total: number }[]> {
    const expenses = await this.expenseModel.findAll({
      include: [{ model: Category, as: 'category' }],
    });

    const totals = expenses.reduce(
      (acc, expense) => {
        const categoryName = expense.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(totals).map(([categoryName, total]) => ({
      categoryName,
      total,
    }));
  }

  async getTotalByBank(): Promise<{ bankName: string; total: number }[]> {
    const expenses = await this.expenseModel.findAll({
      include: [{ model: Bank, as: 'bank' }],
    });

    const totals = expenses.reduce(
      (acc, expense) => {
        const bankName = expense.bank.name;
        acc[bankName] = (acc[bankName] || 0) + Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

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

  private defaultIncludes() {
    return [
      { model: Category, as: 'category' },
      { model: Bank, as: 'bank' },
    ];
  }

  private async validateOccurrenceForExpense(
    type: ExpenseType,
    occurrenceId?: number | null,
    currentExpenseId?: number,
  ): Promise<void> {
    if (type === ExpenseType.SIMPLE) {
      if (occurrenceId) {
        throw new BadRequestException('Une depense simple ne doit pas avoir occurrenceId');
      }
      return;
    }

    if (!occurrenceId) {
      throw new BadRequestException('occurrenceId est requis pour les depenses periodiques');
    }

    const occurrence =
      type === ExpenseType.SUBSCRIPTION
        ? await this.subscriptionOccurrenceModel.findByPk(occurrenceId)
        : await this.installmentOccurrenceModel.findByPk(occurrenceId);

    if (!occurrence) {
      throw new NotFoundException(`Occurrence avec l'ID ${occurrenceId} non trouvee`);
    }

    if (occurrence.expenseId && occurrence.expenseId !== currentExpenseId) {
      throw new BadRequestException('Cette occurrence est deja liee a une depense');
    }
  }

  private async markOccurrenceAsPaid(expense: Expense): Promise<void> {
    if (!expense.occurrenceId || expense.type === ExpenseType.SIMPLE) {
      return;
    }

    const values = {
      expenseId: expense.id,
      paidDate: expense.date,
      status: OccurrenceStatus.PAID,
      amount: expense.amount,
    };

    if (expense.type === ExpenseType.SUBSCRIPTION) {
      await this.subscriptionOccurrenceModel.update(values, {
        where: { id: expense.occurrenceId },
      });
      return;
    }

    await this.installmentOccurrenceModel.update(values, { where: { id: expense.occurrenceId } });
  }
}
