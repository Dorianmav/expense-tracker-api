import { ExpenseType } from '../../models/expense.model';
import { SubscriptionFrequency } from '../../models/subscription.model';

/**
 * Interface pour les attributs de création d'une dépense dans Sequelize
 * Définit les champs requis et optionnels lors de la création d'une nouvelle dépense
 */
export interface ExpenseCreationAttributes {
  /** Montant de la dépense */
  amount: number;
  /** Date de la dépense */
  date: Date;
  /** Description de la dépense */
  description: string;
  /** Type de dépense (simple, abonnement, échelonné) */
  type: ExpenseType;
  /** ID de la catégorie associée */
  categoryId: number;
  /** ID de la banque associée */
  bankId: number;
  /** ID de l'abonnement (optionnel, uniquement pour les dépenses d'abonnement) */
  subscriptionId?: number;
  /** ID du paiement échelonné (optionnel, uniquement pour les dépenses échelonnées) */
  installmentId?: number;
}

/**
 * Interface pour les attributs de création d'un abonnement dans Sequelize
 * Définit les champs requis et optionnels lors de la création d'un nouvel abonnement
 */
export interface SubscriptionCreationAttributes {
  /** Nom de l'abonnement */
  name: string;
  /** Montant de l'abonnement */
  amount: number;
  /** Fréquence de l'abonnement (hebdomadaire, mensuel, annuel) */
  frequency: SubscriptionFrequency;
  /** Date de début de l'abonnement */
  startDate: Date;
  /** Date de fin de l'abonnement (optionnelle) */
  endDate?: Date;
  /** Indique si l'abonnement est actif (par défaut: true) */
  isActive?: boolean;
}

/**
 * Interface pour les attributs de création d'un paiement échelonné dans Sequelize
 * Définit les champs requis et optionnels lors de la création d'un nouveau paiement échelonné
 */
export interface InstallmentCreationAttributes {
  /** Nom du paiement échelonné */
  name: string;
  /** Montant total du paiement échelonné */
  totalAmount: number;
  /** Montant restant à payer */
  remainingAmount: number;
  /** Nombre total de paiements */
  numberOfPayments: number;
  /** Nombre de paiements restants */
  remainingPayments: number;
  /** Date du prochain paiement (optionnelle) */
  nextPaymentDate?: Date;
  /** Dates personnalisées de tous les paiements (optionnelles) */
  customPaymentDates?: Date[];
  /** Indique si le paiement échelonné est terminé (par défaut: false) */
  isCompleted?: boolean;
}

/**
 * Interface pour les attributs de création d'une catégorie dans Sequelize
 * Définit les champs requis et optionnels lors de la création d'une nouvelle catégorie
 */
export interface CategoryCreationAttributes {
  /** Nom de la catégorie */
  name: string;
  /** ID de la catégorie parent (optionnel, pour les sous-catégories) */
  parentId?: number;
}

/**
 * Interface pour les attributs de création d'une banque dans Sequelize
 * Définit les champs requis et optionnels lors de la création d'une nouvelle banque
 */
export interface BankCreationAttributes {
  /** Nom de la banque */
  name: string;
}
