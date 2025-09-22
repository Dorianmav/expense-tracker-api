import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BanksModule } from './modules/banks/banks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { SeedService } from './seeders/seed-data';
import { Category } from './models/category.model';
import { Bank } from './models/bank.model';
import { Subscription } from './models/subscription.model';
import { Installment } from './models/installment.model';
import { Expense } from './models/expense.model';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration de la base de données PostgreSQL avec Sequelize
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'expense_tracker',
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV === 'development', // Attention en production !
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }),

    // Modules de l'application
    ExpensesModule,
    CategoriesModule,
    BanksModule,
    SubscriptionsModule,
    InstallmentsModule,

    // Modèles pour le seeding
    SequelizeModule.forFeature([Category, Bank, Subscription, Installment, Expense]),
  ],
  controllers: [],
  providers: [SeedService],
})
export class AppModule {}
