import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Sequelize } from 'sequelize-typescript';
import { Bank } from '../src/models/bank.model';
import { Category } from '../src/models/category.model';
import { Expense } from '../src/models/expense.model';
import { Installment } from '../src/models/installment.model';
import { InstallmentOccurrence } from '../src/models/installment-occurrence.model';
import { OccurrenceStatus } from '../src/models/occurrence-status.enum';
import { Subscription } from '../src/models/subscription.model';
import { SubscriptionOccurrence } from '../src/models/subscription-occurrence.model';
import { generateInstallmentDueDates } from '../src/utils';

function parsePort(value: string | undefined): number {
  const port = Number.parseInt(value || '5432', 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT invalide');
  }
  return port;
}

async function main(): Promise<void> {
  loadEnvFile();

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parsePort(process.env.DB_PORT),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'expense_tracker',
    logging: false,
    models: [
      Category,
      Bank,
      Subscription,
      SubscriptionOccurrence,
      Installment,
      InstallmentOccurrence,
      Expense,
    ],
  });

  await sequelize.authenticate();

  const installments = await Installment.findAll();
  let created = 0;

  for (const installment of installments) {
    const customDates = normalizeCustomDates(installment.customPaymentDates);
    const seedDate = installment.startDate || installment.nextPaymentDate || new Date();
    const dueDates = generateInstallmentDueDates(
      new Date(seedDate),
      installment.numberOfPayments,
      customDates,
    );
    const amount = Number(
      (Number(installment.totalAmount) / installment.numberOfPayments).toFixed(2),
    );

    for (let index = 0; index < dueDates.length; index++) {
      const dueDate = dueDates[index];
      const [, wasCreated] = await InstallmentOccurrence.findOrCreate({
        where: {
          installmentId: installment.id,
          occurrenceNumber: index + 1,
        },
        defaults: {
          installmentId: installment.id,
          occurrenceNumber: index + 1,
          dueDate,
          amount,
          status: resolveStatus(installment.isCompleted, dueDate),
        },
      });

      if (wasCreated) {
        created += 1;
      }
    }
  }

  await sequelize.close();
  console.log(`Migration terminee: ${created} occurrence(s) creee(s).`);
}

function loadEnvFile(): void {
  try {
    const content = readFileSync(resolve(__dirname, '..', '.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      process.env[key] ??= value;
    }
  } catch {
    return;
  }
}

function normalizeCustomDates(value: Date[] | string[] | null | undefined): Date[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  return value.map((item) =>
    item instanceof Date ? new Date(item.getTime()) : new Date(String(item)),
  );
}

function resolveStatus(isCompleted: boolean, dueDate: Date): OccurrenceStatus {
  if (isCompleted) {
    return OccurrenceStatus.PAID;
  }

  return dueDate < new Date() ? OccurrenceStatus.LATE : OccurrenceStatus.PENDING;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
