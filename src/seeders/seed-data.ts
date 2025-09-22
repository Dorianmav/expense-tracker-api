import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../models/category.model';
import { Bank } from '../models/bank.model';
import { Subscription, SubscriptionFrequency } from '../models/subscription.model';
import { Installment } from '../models/installment.model';
import { Expense, ExpenseType } from '../models/expense.model';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(Bank) private bankModel: typeof Bank,
    @InjectModel(Subscription) private subscriptionModel: typeof Subscription,
    @InjectModel(Installment) private installmentModel: typeof Installment,
    @InjectModel(Expense) private expenseModel: typeof Expense,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      await this.seedData();
    }
  }

  private async seedData() {
    console.log('🌱 Début du seeding des données...');

    try {
      // Vérifier si des données existent déjà
      const existingCategories = await this.categoryModel.count();
      if (existingCategories > 0) {
        console.log('📊 Données déjà présentes, seeding ignoré');
        return;
      }

      // Seed des banques
      const banks = await this.seedBanks();
      console.log(`🏦 ${banks.length} banques créées`);

      // Seed des catégories
      const categories = await this.seedCategories();
      console.log(`📂 ${categories.length} catégories créées`);

      // Seed des abonnements
      const subscriptions = await this.seedSubscriptions();
      console.log(`🔄 ${subscriptions.length} abonnements créés`);

      // Seed des paiements échelonnés
      const installments = await this.seedInstallments();
      console.log(`📅 ${installments.length} paiements échelonnés créés`);

      // Seed des dépenses
      const expenses = await this.seedExpenses(categories, banks, subscriptions, installments);
      console.log(`💰 ${expenses.length} dépenses créées`);

      console.log('✅ Seeding terminé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors du seeding:', error);
    }
  }

  private async seedBanks(): Promise<Bank[]> {
    const banksData = [
      { name: 'BNP Paribas' },
      { name: 'Crédit Agricole' },
      { name: 'Société Générale' },
      { name: 'LCL' },
      { name: 'Banque Populaire' },
      { name: 'Crédit Mutuel' },
      { name: 'La Banque Postale' },
      { name: 'ING Direct' },
      { name: 'Boursorama' },
      { name: 'Revolut' },
    ];

    return Promise.all(
      banksData.map(bank => this.bankModel.create(bank))
    );
  }

  private async seedCategories(): Promise<Category[]> {
    // Catégories principales
    const mainCategories = [
      { name: 'Alimentation', parentId: undefined },
      { name: 'Transport', parentId: undefined },
      { name: 'Logement', parentId: undefined },
      { name: 'Loisirs', parentId: undefined },
      { name: 'Santé', parentId: undefined },
      { name: 'Vêtements', parentId: undefined },
      { name: 'Services', parentId: undefined },
      { name: 'Éducation', parentId: undefined },
    ];

    const createdMainCategories = await Promise.all(
      mainCategories.map(category => this.categoryModel.create(category))
    );

    // Sous-catégories
    const subCategories = [
      // Alimentation
      { name: 'Courses', parentId: createdMainCategories[0].id },
      { name: 'Restaurant', parentId: createdMainCategories[0].id },
      { name: 'Fast-food', parentId: createdMainCategories[0].id },
      { name: 'Boulangerie', parentId: createdMainCategories[0].id },

      // Transport
      { name: 'Essence', parentId: createdMainCategories[1].id },
      { name: 'Transport public', parentId: createdMainCategories[1].id },
      { name: 'Taxi/VTC', parentId: createdMainCategories[1].id },
      { name: 'Parking', parentId: createdMainCategories[1].id },

      // Logement
      { name: 'Loyer', parentId: createdMainCategories[2].id },
      { name: 'Électricité', parentId: createdMainCategories[2].id },
      { name: 'Gaz', parentId: createdMainCategories[2].id },
      { name: 'Internet', parentId: createdMainCategories[2].id },
      { name: 'Assurance habitation', parentId: createdMainCategories[2].id },

      // Santé
      { name: 'Médecin', parentId: createdMainCategories[3].id },
      { name: 'Pharmacie', parentId: createdMainCategories[3].id },
      { name: 'Dentiste', parentId: createdMainCategories[3].id },
      { name: 'Mutuelle', parentId: createdMainCategories[3].id },

      // Loisirs
      { name: 'Cinéma', parentId: createdMainCategories[4].id },
      { name: 'Sport', parentId: createdMainCategories[4].id },
      { name: 'Streaming', parentId: createdMainCategories[4].id },
      { name: 'Jeux', parentId: createdMainCategories[4].id },

      // Shopping
      { name: 'Vêtements', parentId: createdMainCategories[5].id },
      { name: 'Électronique', parentId: createdMainCategories[5].id },
      { name: 'Maison', parentId: createdMainCategories[5].id },
      { name: 'Beauté', parentId: createdMainCategories[5].id },
    ];

    const createdSubCategories = await Promise.all(
      subCategories.map(category => this.categoryModel.create(category))
    );

    return [...createdMainCategories, ...createdSubCategories];
  }

  private async seedSubscriptions(): Promise<Subscription[]> {
    const subscriptionsData = [
      {
        name: 'Netflix Premium',
        amount: 15.99,
        frequency: SubscriptionFrequency.MONTHLY,
        startDate: new Date('2024-01-01'),
        endDate: undefined,
        isActive: true,
      },
      {
        name: 'Spotify Premium',
        amount: 9.99,
        frequency: SubscriptionFrequency.MONTHLY,
        startDate: new Date('2024-01-15'),
        endDate: undefined,
        isActive: true,
      },
      {
        name: 'Salle de sport',
        amount: 29.99,
        frequency: SubscriptionFrequency.MONTHLY,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
      {
        name: 'Adobe Creative Suite',
        amount: 59.99,
        frequency: SubscriptionFrequency.MONTHLY,
        startDate: new Date('2024-01-01'),
        endDate: undefined,
        isActive: true,
      },
    ];

    return Promise.all(
      subscriptionsData.map(subscription => this.subscriptionModel.create(subscription))
    );
  }

  private async seedInstallments(): Promise<Installment[]> {
    const installmentsData = [
      {
        name: 'iPhone 15 Pro',
        totalAmount: 1199.99,
        remainingAmount: 800.00,
        numberOfPayments: 12,
        remainingPayments: 8,
        nextPaymentDate: new Date('2024-03-01'),
        customPaymentDates: [
          new Date('2024-01-01'),
          new Date('2024-02-01'),
          new Date('2024-03-01'),
          new Date('2024-04-01'),
          new Date('2024-05-01'),
          new Date('2024-06-01'),
          new Date('2024-07-01'),
          new Date('2024-08-01'),
          new Date('2024-09-01'),
          new Date('2024-10-01'),
          new Date('2024-11-01'),
          new Date('2024-12-01'),
        ],
        isCompleted: false,
      },
      {
        name: 'MacBook Pro M3',
        totalAmount: 2499.99,
        remainingAmount: 1666.66,
        numberOfPayments: 3,
        remainingPayments: 2,
        nextPaymentDate: new Date('2024-03-15'),
        customPaymentDates: [
          new Date('2024-01-15'),
          new Date('2024-03-15'),
          new Date('2024-05-15'),
        ],
        isCompleted: false,
      },
    ];

    return Promise.all(
      installmentsData.map(installment => this.installmentModel.create(installment))
    );
  }

  private async seedExpenses(
    categories: Category[],
    banks: Bank[],
    subscriptions: Subscription[],
    installments: Installment[]
  ): Promise<Expense[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const expensesData = [
      // Dépenses d'aujourd'hui
      {
        amount: 45.67,
        date: today,
        description: 'Courses du weekend',
        type: ExpenseType.SIMPLE,
        categoryId: categories.find(c => c.name === 'Courses')?.id || 1,
        bankId: banks[0].id,
        subscriptionId: undefined,
        installmentId: undefined,
      },
      {
        amount: 12.50,
        date: today,
        description: 'Déjeuner restaurant',
        type: ExpenseType.SIMPLE,
        categoryId: categories.find(c => c.name === 'Restaurant')?.id || 1,
        bankId: banks[1].id,
        subscriptionId: undefined,
        installmentId: undefined,
      },
      {
        amount: 15.99,
        date: today,
        description: 'Netflix Premium',
        type: ExpenseType.SUBSCRIPTION,
        categoryId: categories.find(c => c.name === 'Streaming')?.id || 1,
        bankId: banks[0].id,
        subscriptionId: subscriptions[0].id,
        installmentId: undefined,
      },

      // Dépenses d'hier
      {
        amount: 35.00,
        date: yesterday,
        description: 'Plein d\'essence',
        type: ExpenseType.SIMPLE,
        categoryId: categories.find(c => c.name === 'Essence')?.id || 1,
        bankId: banks[2].id,
        subscriptionId: undefined,
        installmentId: undefined,
      },
      {
        amount: 99.99,
        date: yesterday,
        description: 'iPhone 15 Pro - Paiement 4/12',
        type: ExpenseType.INSTALLMENT,
        categoryId: categories.find(c => c.name === 'Électronique')?.id || 1,
        bankId: banks[0].id,
        subscriptionId: undefined,
        installmentId: installments[0].id,
      },
    ];

    return Promise.all(
      expensesData.map(expense => this.expenseModel.create(expense))
    );
  }
}
