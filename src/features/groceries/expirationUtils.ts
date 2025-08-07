import { GroceryItemModel } from '@models';

export interface ExpirationLabel {
  label: string;
  color: string;
}

export function getExpirationLabel(item: GroceryItemModel): ExpirationLabel | undefined {
  const expiration = item.expirationDate;
  if (!expiration || !(expiration instanceof Date)) return undefined;

  const now = new Date();
  const diffDays = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: Lang.groceries.expired, color: 'var(--color-expired)' };
  }
  if (diffDays <= 3) {
    return { label: Lang.groceries.expiringSoon, color: 'var(--color-danger)' };
  }
  if (diffDays <= 7) {
    return { label: Lang.groceries.thisWeek, color: 'var(--color-warning)' };
  }
  if (diffDays <= 30) {
    return { label: Lang.groceries.thisMonth, color: 'var(--color-info)' };
  }
  return { label: Lang.groceries.valid, color: 'var(--color-success)' };
}
