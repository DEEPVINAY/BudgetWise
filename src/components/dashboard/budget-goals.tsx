'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { categoryIcons } from '@/components/shared/icons';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction, Budget, BudgetWithSpent } from '@/lib/types';
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";

export function BudgetGoals() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
  }, [firestore, user]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/budgets`);
  }, [firestore, user]);

  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<Budget>(budgetsQuery);

  const budgetsWithSpending: BudgetWithSpent[] = useMemo(() => {
    if (!budgets) return [];
    return budgets.map(budget => {
      const spent = (transactions ?? [])
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, spent };
    });
  }, [transactions, budgets]);

  const isLoading = isLoadingTransactions || isLoadingBudgets;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Budget Goals</CardTitle>
        <CardDescription>Your monthly spending goals.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : budgetsWithSpending.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No budgets set yet.
          </div>
        ) : (
          <div className="space-y-6">
            {budgetsWithSpending.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100;
              const Icon = categoryIcons[budget.category] || categoryIcons['Other'];
              return (
                <div key={budget.category}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{budget.category}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
