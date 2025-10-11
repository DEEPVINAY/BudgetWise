import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Transaction = {
  id: string;
  userId: string;
  date: Timestamp;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
};

export type BudgetWithSpent = Budget & {
  spent: number;
};

export type IconMap = {
  [key: string]: LucideIcon;
};

export type User = {
  id: string;
  email: string | null;
}
