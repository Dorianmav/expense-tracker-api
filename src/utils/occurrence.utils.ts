import { BadRequestException } from '@nestjs/common';
import { SubscriptionFrequency } from '../models/subscription.model';

const MAX_GENERATED_OCCURRENCES = 240;

export function clampDayOfMonth(year: number, month: number, dayOfMonth: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dayOfMonth, lastDay));
}

export function addMonthsClamped(date: Date, months: number, dayOfMonth: number): Date {
  const next = new Date(date);
  return clampDayOfMonth(next.getFullYear(), next.getMonth() + months, dayOfMonth);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function resolveSubscriptionAnchor(
  startDate: Date,
  frequency: SubscriptionFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
): Date {
  if (frequency === SubscriptionFrequency.WEEKLY || frequency === SubscriptionFrequency.BIWEEKLY) {
    const targetDay = dayOfWeek ?? startDate.getDay();
    if (targetDay < 0 || targetDay > 6) {
      throw new BadRequestException('dayOfWeek doit etre compris entre 0 et 6');
    }

    const delta = (targetDay - startDate.getDay() + 7) % 7;
    return addDays(startDate, delta);
  }

  const targetDay = dayOfMonth ?? startDate.getDate();
  if (targetDay < 1 || targetDay > 31) {
    throw new BadRequestException('dayOfMonth doit etre compris entre 1 et 31');
  }

  let anchor = clampDayOfMonth(startDate.getFullYear(), startDate.getMonth(), targetDay);
  if (anchor < startDate) {
    anchor = addMonthsClamped(anchor, 1, targetDay);
  }

  return anchor;
}

export function nextSubscriptionDate(
  currentDate: Date,
  frequency: SubscriptionFrequency,
  dayOfMonth?: number | null,
): Date {
  switch (frequency) {
    case SubscriptionFrequency.WEEKLY:
      return addDays(currentDate, 7);
    case SubscriptionFrequency.BIWEEKLY:
      return addDays(currentDate, 14);
    case SubscriptionFrequency.MONTHLY:
      return addMonthsClamped(currentDate, 1, dayOfMonth ?? currentDate.getDate());
    case SubscriptionFrequency.QUARTERLY:
      return addMonthsClamped(currentDate, 3, dayOfMonth ?? currentDate.getDate());
    case SubscriptionFrequency.YEARLY:
      return addMonthsClamped(currentDate, 12, dayOfMonth ?? currentDate.getDate());
    default:
      throw new BadRequestException('Frequence abonnement non supportee');
  }
}

export function generateSubscriptionDueDates(
  startDate: Date,
  endDate: Date,
  frequency: SubscriptionFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
): Date[] {
  const dates: Date[] = [];
  let currentDate = resolveSubscriptionAnchor(startDate, frequency, dayOfMonth, dayOfWeek);

  while (currentDate <= endDate && dates.length < MAX_GENERATED_OCCURRENCES) {
    dates.push(new Date(currentDate));
    currentDate = nextSubscriptionDate(currentDate, frequency, dayOfMonth);
  }

  return dates;
}

export function generateInstallmentDueDates(
  startDate: Date,
  numberOfPayments: number,
  customPaymentDates?: Date[] | null,
): Date[] {
  if (customPaymentDates?.length) {
    return customPaymentDates.slice(0, numberOfPayments);
  }

  const dates: Date[] = [];
  const dayOfMonth = startDate.getDate();

  for (let i = 0; i < numberOfPayments; i++) {
    dates.push(addMonthsClamped(startDate, i, dayOfMonth));
  }

  return dates;
}

export function assertProjectionRange(startDate: Date, endDate: Date): void {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new BadRequestException('Les dates de projection sont invalides');
  }

  if (startDate > endDate) {
    throw new BadRequestException('startDate doit etre avant endDate');
  }

  const maxEndDate = addMonthsClamped(startDate, 24, startDate.getDate());
  if (endDate > maxEndDate) {
    throw new BadRequestException('La projection est limitee a 24 mois');
  }
}
