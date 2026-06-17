import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Expense } from '../../models/expense.model';
import { Category } from '../../models/category.model';
import { Bank } from '../../models/bank.model';
import { Subscription } from '../../models/subscription.model';
import { Installment } from '../../models/installment.model';
import { SubscriptionOccurrence } from '../../models/subscription-occurrence.model';
import { InstallmentOccurrence } from '../../models/installment-occurrence.model';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CategoriesModule } from '../categories/categories.module';
import { BanksModule } from '../banks/banks.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { InstallmentsModule } from '../installments/installments.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Expense,
      Category,
      Bank,
      Subscription,
      Installment,
      SubscriptionOccurrence,
      InstallmentOccurrence,
    ]),
    CategoriesModule,
    BanksModule,
    SubscriptionsModule,
    InstallmentsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
