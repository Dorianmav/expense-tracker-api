import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import type { Migration } from './migration.types';

type InstallmentRow = {
  id: number;
  totalAmount: string | number;
  numberOfPayments: number;
  startDate: Date | string | null;
  nextPaymentDate: Date | string | null;
  customPaymentDates: unknown;
  isCompleted: boolean;
  createdAt: Date | string;
};

const OCCURRENCE_STATUS = ['pending', 'paid', 'skipped', 'late'];
const EXPENSE_SOURCE = ['manual', 'bank_import'];

const migration: Migration = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await addColumnIfMissing(queryInterface, 'expenses', 'color', {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'expenses', 'source', {
      type: DataTypes.ENUM(...EXPENSE_SOURCE),
      allowNull: false,
      defaultValue: 'manual',
    });
    await addColumnIfMissing(queryInterface, 'expenses', 'occurrenceId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, 'subscriptions', 'dayOfMonth', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'subscriptions', 'dayOfWeek', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'subscriptions', 'categoryId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'categories', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await addColumnIfMissing(queryInterface, 'subscriptions', 'bankId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'banks', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await addColumnIfMissing(queryInterface, 'installments', 'startDate', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'installments', 'categoryId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'categories', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await addColumnIfMissing(queryInterface, 'installments', 'bankId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'banks', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await createTableIfMissing(queryInterface, 'subscription_occurrences', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      subscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'subscriptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paidDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expenseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'expenses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: DataTypes.ENUM(...OCCURRENCE_STATUS),
        allowNull: false,
        defaultValue: 'pending',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await createTableIfMissing(queryInterface, 'installment_occurrences', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      installmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'installments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      occurrenceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paidDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expenseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'expenses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: DataTypes.ENUM(...OCCURRENCE_STATUS),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "subscription_occurrences_subscription_id_due_date" ON "subscription_occurrences" ("subscriptionId", "dueDate")',
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "subscription_occurrences_due_date" ON "subscription_occurrences" ("dueDate")',
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "subscription_occurrences_status" ON "subscription_occurrences" ("status")',
    );
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "installment_occurrences_installment_id_occurrence_number" ON "installment_occurrences" ("installmentId", "occurrenceNumber")',
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "installment_occurrences_due_date" ON "installment_occurrences" ("dueDate")',
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "installment_occurrences_status" ON "installment_occurrences" ("status")',
    );

    await backfillInstallmentOccurrences(queryInterface);

    await removeColumnIfExists(queryInterface, 'installments', 'remainingAmount');
    await removeColumnIfExists(queryInterface, 'installments', 'remainingPayments');
    await removeColumnIfExists(queryInterface, 'expenses', 'subscriptionId');
    await removeColumnIfExists(queryInterface, 'expenses', 'installmentId');
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('expenses', 'subscriptionId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'subscriptions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('expenses', 'installmentId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'installments', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('installments', 'remainingAmount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('installments', 'remainingPayments', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.dropTable('installment_occurrences');
    await queryInterface.dropTable('subscription_occurrences');

    await queryInterface.removeColumn('installments', 'bankId');
    await queryInterface.removeColumn('installments', 'categoryId');
    await queryInterface.removeColumn('installments', 'startDate');
    await queryInterface.removeColumn('subscriptions', 'bankId');
    await queryInterface.removeColumn('subscriptions', 'categoryId');
    await queryInterface.removeColumn('subscriptions', 'dayOfWeek');
    await queryInterface.removeColumn('subscriptions', 'dayOfMonth');
    await queryInterface.removeColumn('expenses', 'occurrenceId');
    await queryInterface.removeColumn('expenses', 'source');
    await queryInterface.removeColumn('expenses', 'color');

    await dropPostgresEnum(queryInterface, 'enum_expenses_source');
    await dropPostgresEnum(queryInterface, 'enum_subscription_occurrences_status');
    await dropPostgresEnum(queryInterface, 'enum_installment_occurrences_status');
  },
};

async function backfillInstallmentOccurrences(queryInterface: QueryInterface): Promise<void> {
  const installments = await queryInterface.sequelize.query<InstallmentRow>(
    'SELECT id, "totalAmount", "numberOfPayments", "startDate", "nextPaymentDate", "customPaymentDates", "isCompleted", "createdAt" FROM installments',
    { type: QueryTypes.SELECT },
  );

  for (const installment of installments) {
    const startDate = resolveStartDate(installment);
    await queryInterface.sequelize.query(
      'UPDATE installments SET "startDate" = :startDate WHERE id = :id',
      {
        replacements: { id: installment.id, startDate },
        type: QueryTypes.UPDATE,
      },
    );

    const dueDates = resolveInstallmentDueDates(
      startDate,
      installment.numberOfPayments,
      installment.customPaymentDates,
    );
    const amount = Number(
      (Number(installment.totalAmount) / installment.numberOfPayments).toFixed(2),
    );

    for (let index = 0; index < dueDates.length; index++) {
      await queryInterface.sequelize.query(
        `INSERT INTO "installment_occurrences"
          ("installmentId", "occurrenceNumber", "dueDate", "amount", "status", "createdAt", "updatedAt")
         VALUES (:installmentId, :occurrenceNumber, :dueDate, :amount, :status, :createdAt, :updatedAt)
         ON CONFLICT ("installmentId", "occurrenceNumber") DO NOTHING`,
        {
          replacements: {
            installmentId: installment.id,
            occurrenceNumber: index + 1,
            dueDate: dueDates[index],
            amount,
            status: resolveStatus(Boolean(installment.isCompleted), dueDates[index]),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          type: QueryTypes.INSERT,
        },
      );
    }
  }

  await queryInterface.changeColumn('installments', 'startDate', {
    type: DataTypes.DATE,
    allowNull: false,
  });
}

async function addColumnIfMissing(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  options: Parameters<QueryInterface['addColumn']>[2],
): Promise<void> {
  const table = await queryInterface.describeTable(tableName);
  if (table[columnName]) {
    return;
  }

  await queryInterface.addColumn(tableName, columnName, options);
}

async function removeColumnIfExists(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
): Promise<void> {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    return;
  }

  await queryInterface.removeColumn(tableName, columnName);
}

async function createTableIfMissing(
  queryInterface: QueryInterface,
  tableName: string,
  attributes: Parameters<QueryInterface['createTable']>[1],
): Promise<void> {
  const tables = await queryInterface.showAllTables();
  if (tables.includes(tableName)) {
    return;
  }

  await queryInterface.createTable(tableName, attributes);
}

function resolveStartDate(installment: InstallmentRow): Date {
  return new Date(installment.startDate || installment.nextPaymentDate || installment.createdAt);
}

function resolveInstallmentDueDates(
  startDate: Date,
  numberOfPayments: number,
  rawCustomPaymentDates: unknown,
): Date[] {
  const customPaymentDates = Array.isArray(rawCustomPaymentDates)
    ? rawCustomPaymentDates.map((value) => new Date(String(value)))
    : [];

  if (customPaymentDates.length > 0) {
    return customPaymentDates.slice(0, numberOfPayments);
  }

  const dates: Date[] = [];
  const dayOfMonth = startDate.getDate();

  for (let index = 0; index < numberOfPayments; index++) {
    const nextDate = new Date(startDate);
    nextDate.setMonth(startDate.getMonth() + index);
    const lastDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    nextDate.setDate(Math.min(dayOfMonth, lastDay));
    dates.push(nextDate);
  }

  return dates;
}

function resolveStatus(isCompleted: boolean, dueDate: Date): string {
  if (isCompleted) {
    return 'paid';
  }

  return dueDate < new Date() ? 'late' : 'pending';
}

async function dropPostgresEnum(queryInterface: QueryInterface, enumName: string): Promise<void> {
  if (queryInterface.sequelize.getDialect() !== 'postgres') {
    return;
  }

  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${enumName}";`);
}

export default migration;
