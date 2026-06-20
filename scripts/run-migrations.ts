import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Sequelize, QueryTypes } from 'sequelize';
import type { Migration } from '../src/database/migrations/migration.types';

type MigrationModule = {
  default: Migration;
};

function parsePort(value: string | undefined): number {
  const port = Number.parseInt(value || '5432', 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT invalide');
  }
  return port;
}

async function main(): Promise<void> {
  loadEnvFile();

  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parsePort(process.env.DB_PORT),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'expense_tracker',
    logging: false,
  });

  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await ensureMetaTable(sequelize);

  const migrationsDir = resolve(__dirname, '..', 'src', 'database', 'migrations');
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => /^\d+-.+\.ts$/.test(file))
    .sort();

  if (direction === 'up') {
    const applied = await getAppliedMigrations(sequelize);
    for (const file of migrationFiles) {
      if (applied.has(file)) {
        continue;
      }

      const migration = await loadMigration(join(migrationsDir, file));
      await sequelize.transaction(async (transaction) => {
        await migration.up(queryInterface);
        await sequelize.query('INSERT INTO "SequelizeMeta" (name) VALUES (:name)', {
          replacements: { name: file },
          transaction,
        });
      });
      console.log(`Migration appliquee: ${file}`);
    }
  } else {
    const applied = [...(await getAppliedMigrations(sequelize))].sort().reverse();
    const file = applied[0];
    if (!file) {
      console.log('Aucune migration a annuler.');
      await sequelize.close();
      return;
    }

    const migration = await loadMigration(join(migrationsDir, file));
    await sequelize.transaction(async (transaction) => {
      await migration.down(queryInterface);
      await sequelize.query('DELETE FROM "SequelizeMeta" WHERE name = :name', {
        replacements: { name: file },
        transaction,
      });
    });
    console.log(`Migration annulee: ${file}`);
  }

  await sequelize.close();
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

async function getAppliedMigrations(sequelize: Sequelize): Promise<Set<string>> {
  const rows = await sequelize.query<{ name: string }>('SELECT name FROM "SequelizeMeta"', {
    type: QueryTypes.SELECT,
  });
  return new Set(rows.map((row) => row.name));
}

async function ensureMetaTable(sequelize: Sequelize): Promise<void> {
  await sequelize.query(
    'CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name VARCHAR(255) NOT NULL PRIMARY KEY)',
  );
}

async function loadMigration(filePath: string): Promise<Migration> {
  const module = (await import(pathToFileURL(filePath).href)) as MigrationModule;
  return module.default;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
