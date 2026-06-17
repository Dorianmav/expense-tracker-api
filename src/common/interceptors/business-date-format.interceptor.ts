import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { formatToFrenchDate } from '../../utils';

const BUSINESS_DATE_FIELDS = new Set([
  'date',
  'dueDate',
  'paidDate',
  'startDate',
  'endDate',
  'nextPaymentDate',
  'customPaymentDates',
]);

const TECHNICAL_DATE_FIELDS = new Set(['createdAt', 'updatedAt']);

@Injectable()
export class BusinessDateFormatInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data: unknown) => this.formatBusinessDates(data)));
  }

  private formatBusinessDates(value: unknown, key?: string, seen = new WeakSet<object>()): unknown {
    if (value instanceof Date) {
      return key && BUSINESS_DATE_FIELDS.has(key) ? formatToFrenchDate(value) : value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatBusinessDates(item, key, seen));
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    if (seen.has(value)) {
      return value;
    }
    seen.add(value);

    const plainValue = this.toPlainObject(value);
    const formattedEntries = Object.entries(plainValue).map(([entryKey, entryValue]) => {
      if (TECHNICAL_DATE_FIELDS.has(entryKey)) {
        return [entryKey, entryValue];
      }

      return [entryKey, this.formatBusinessDates(entryValue, entryKey, seen)];
    });

    return Object.fromEntries(formattedEntries);
  }

  private toPlainObject(value: object): Record<string, unknown> {
    const maybeSerializable = value as { toJSON?: () => unknown };

    if (typeof maybeSerializable.toJSON === 'function') {
      return maybeSerializable.toJSON() as Record<string, unknown>;
    }

    return value as Record<string, unknown>;
  }
}
