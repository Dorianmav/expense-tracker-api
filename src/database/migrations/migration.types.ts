import { QueryInterface } from 'sequelize';

export type Migration = {
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
};
