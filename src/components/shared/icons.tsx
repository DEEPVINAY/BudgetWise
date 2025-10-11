import type { IconMap } from '@/lib/types';
import {
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Home,
  HeartPulse,
  Ticket,
  Plane,
  Briefcase,
  GraduationCap,
  Gift,
  MoreHorizontal,
  CircleDollarSign,
} from 'lucide-react';

export const categoryIcons: IconMap = {
  Groceries: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Housing: Home,
  Health: HeartPulse,
  Entertainment: Ticket,
  Travel: Plane,
  Work: Briefcase,
  Education: GraduationCap,
  Gifts: Gift,
  Income: CircleDollarSign,
  Other: MoreHorizontal,
};
