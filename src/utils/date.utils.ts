/**
 * Utilitaires pour la gestion et conversion des dates
 * Centralise toute la logique de conversion de dates pour éviter la duplication
 */

/**
 * Convertit une date au format DD/MM/YYYY en objet Date JavaScript
 * 
 * @param dateString - Date au format DD/MM/YYYY (ex: "25/12/2023")
 * @returns Objet Date JavaScript correspondant
 * @throws Error si le format de date est invalide
 * 
 * @example
 * ```typescript
 * const date = parseFrenchDate("25/12/2023");
 * console.log(date); // Date object for December 25, 2023
 * ```
 */
export function parseFrenchDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date string is required and must be a string');
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    throw new Error('Date must be in DD/MM/YYYY format');
  }

  const [day, month, year] = parts.map(part => parseInt(part, 10));

  // Validation des valeurs
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error('Invalid date components: all parts must be numbers');
  }

  if (day < 1 || day > 31) {
    throw new Error('Day must be between 1 and 31');
  }

  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }

  if (year < 1900 || year > 2100) {
    throw new Error('Year must be between 1900 and 2100');
  }

  // Créer la date (mois - 1 car les mois JavaScript commencent à 0)
  const date = new Date(year, month - 1, day);

  // Vérifier que la date créée correspond aux valeurs données
  // (pour éviter des dates comme 31/02/2023 qui deviennent 03/03/2023)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    throw new Error('Invalid date: the specified date does not exist');
  }

  return date;
}

/**
 * Convertit un tableau de dates au format DD/MM/YYYY en tableau d'objets Date
 * 
 * @param dateStrings - Tableau de dates au format DD/MM/YYYY
 * @returns Tableau d'objets Date JavaScript correspondants
 * 
 * @example
 * ```typescript
 * const dates = parseFrenchDateArray(["25/12/2023", "01/01/2024"]);
 * console.log(dates); // [Date, Date]
 * ```
 */
export function parseFrenchDateArray(dateStrings: string[]): Date[] {
  if (!Array.isArray(dateStrings)) {
    throw new Error('Input must be an array of date strings');
  }

  return dateStrings.map((dateString, index) => {
    try {
      return parseFrenchDate(dateString);
    } catch (error) {
      throw new Error(`Invalid date at index ${index}: ${error.message}`);
    }
  });
}

/**
 * Formate un objet Date en string DD/MM/YYYY
 * 
 * @param date - Objet Date à formater
 * @returns Date au format DD/MM/YYYY
 * 
 * @example
 * ```typescript
 * const dateString = formatToFrenchDate(new Date(2023, 11, 25));
 * console.log(dateString); // "25/12/2023"
 * ```
 */
export function formatToFrenchDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Input must be a valid Date object');
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si une string correspond au format DD/MM/YYYY
 * 
 * @param dateString - String à vérifier
 * @returns true si le format est valide, false sinon
 * 
 * @example
 * ```typescript
 * console.log(isValidFrenchDateFormat("25/12/2023")); // true
 * console.log(isValidFrenchDateFormat("2023-12-25")); // false
 * ```
 */
export function isValidFrenchDateFormat(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const frenchDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return frenchDateRegex.test(dateString);
}
