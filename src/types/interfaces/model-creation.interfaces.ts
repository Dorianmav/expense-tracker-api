import { ExpenseSource, ExpenseType } from '../../models/expense.model';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import { SubscriptionFrequency } from '../../models/subscription.model';

export interface ExpenseCreationAttributes {
  amount: number;
  date: Date;
  description: string;
  type: ExpenseType;
  color?: string;
  source?: ExpenseSource;
  categoryId: number;
  bankId: number;
  occurrenceId?: number;
}

export interface SubscriptionCreationAttributes {
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
  categoryId?: number;
  bankId?: number;
}

export interface InstallmentCreationAttributes {
  name: string;
  totalAmount: number;
  numberOfPayments: number;
  startDate: Date;
  nextPaymentDate?: Date;
  customPaymentDates?: Date[];
  isCompleted?: boolean;
  categoryId?: number;
  bankId?: number;
}

export interface SubscriptionOccurrenceCreationAttributes {
  subscriptionId: number;
  dueDate: Date;
  paidDate?: Date | null;
  expenseId?: number | null;
  status?: OccurrenceStatus;
  amount: number;
}

export interface InstallmentOccurrenceCreationAttributes {
  installmentId: number;
  occurrenceNumber: number;
  dueDate: Date;
  amount: number;
  paidDate?: Date | null;
  expenseId?: number | null;
  status?: OccurrenceStatus;
}

export interface CategoryCreationAttributes {
  name: string;
  parentId?: number;
}

export interface BankCreationAttributes {
  name: string;
}
