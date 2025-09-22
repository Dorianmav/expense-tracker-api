# Expense Tracker API

API backend pour l'application de suivi des dépenses développée avec NestJS, PostgreSQL et Sequelize.

## 🚀 Fonctionnalités

- **Gestion des dépenses** : CRUD complet avec filtres par date, catégorie, banque
- **Catégories hiérarchiques** : Support des catégories principales et sous-catégories
- **Gestion des banques** : Suivi des dépenses par établissement bancaire
- **Abonnements récurrents** : Gestion des paiements périodiques
- **Paiements échelonnés** : Support des dates personnalisées pour chaque échéance
- **Statistiques** : Totaux par catégorie, banque et période
- **Documentation Swagger** : API documentée automatiquement

## 🛠️ Technologies

- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de données
- **Sequelize** - ORM TypeScript
- **Swagger** - Documentation API
- **TypeScript** - Langage de développement

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v13 ou supérieur)
- npm ou yarn

## 🔧 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer la base de données**
   - Créer une base de données PostgreSQL
   - Copier `.env.example` vers `.env`
   - Configurer les variables d'environnement

3. **Variables d'environnement**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=expense_tracker
   PORT=3000
   NODE_ENV=development
   ```

## 🚀 Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`

## 📚 Documentation

La documentation Swagger est accessible sur `http://localhost:3000/api`

## 🗂️ Structure du projet

```
src/
├── main.ts                 # Point d'entrée
├── app.module.ts           # Module principal
├── models/                 # Modèles Sequelize
│   ├── expense.model.ts
│   ├── category.model.ts
│   ├── bank.model.ts
│   ├── subscription.model.ts
│   └── installment.model.ts
└── modules/                # Modules métier
    ├── expenses/           # Gestion des dépenses
    ├── categories/         # Gestion des catégories
    ├── banks/             # Gestion des banques
    ├── subscriptions/     # Gestion des abonnements
    └── installments/      # Gestion des paiements échelonnés
```

## 🔗 Endpoints principaux

### Dépenses
- `GET /expenses` - Liste toutes les dépenses
- `GET /expenses/today` - Dépenses du jour
- `POST /expenses` - Créer une dépense
- `GET /expenses/stats/by-category` - Statistiques par catégorie

### Catégories
- `GET /categories` - Liste toutes les catégories
- `GET /categories/main` - Catégories principales uniquement
- `POST /categories` - Créer une catégorie

### Banques
- `GET /banks` - Liste toutes les banques
- `POST /banks` - Créer une banque

### Abonnements
- `GET /subscriptions/active` - Abonnements actifs
- `POST /subscriptions` - Créer un abonnement

### Paiements échelonnés
- `GET /installments/active` - Paiements actifs
- `GET /installments/:id/upcoming-payments` - Prochaines échéances
- `POST /installments` - Créer un paiement échelonné

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 📝 Scripts disponibles

- `npm run build` - Compiler le projet
- `npm run start` - Démarrer en mode production
- `npm run start:dev` - Démarrer en mode développement
- `npm run lint` - Vérifier le code avec ESLint
- `npm run format` - Formater le code avec Prettier

## 🔒 Sécurité

- Validation des données avec `class-validator`
- Protection CORS configurée
- Variables d'environnement pour les secrets

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
