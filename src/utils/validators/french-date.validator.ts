import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { isValidFrenchDateFormat } from '../date.utils';

/**
 * Validateur personnalisé pour les dates au format français DD/MM/YYYY
 * Utilise les utilitaires de date centralisés pour la validation
 */
export function IsFrenchDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isFrenchDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // Vérifier que c'est une string
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // Vérifier le format DD/MM/YYYY
                    if (!isValidFrenchDateFormat(value)) {
                        return false;
                    }

                    // Vérifier que la date est valide (pas de 31/02/2024 par exemple)
                    try {
                        const [day, month, year] = value.split('/').map(part => parseInt(part, 10));

                        // Validation des valeurs
                        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
                            return false;
                        }

                        // Créer la date pour vérifier qu'elle existe
                        const date = new Date(year, month - 1, day);
                        return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
                    } catch {
                        return false;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid date in DD/MM/YYYY format (e.g., 15/01/2024)`;
                },
            },
        });
    };
}

/**
 * Validateur personnalisé pour les tableaux de dates au format français DD/MM/YYYY
 * Valide chaque élément du tableau individuellement
 */
export function IsFrenchDateArray(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isFrenchDateArray',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // Vérifier que c'est un tableau
                    if (!Array.isArray(value)) {
                        return false;
                    }

                    // Valider chaque date du tableau
                    return value.every(dateString => {
                        if (typeof dateString !== 'string') {
                            return false;
                        }

                        if (!isValidFrenchDateFormat(dateString)) {
                            return false;
                        }

                        try {
                            const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));

                            if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
                                return false;
                            }

                            const date = new Date(year, month - 1, day);
                            return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
                        } catch {
                            return false;
                        }
                    });
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be an array of valid dates in DD/MM/YYYY format (e.g., ["15/01/2024", "15/02/2024"])`;
                },
            },
        });
    };
}