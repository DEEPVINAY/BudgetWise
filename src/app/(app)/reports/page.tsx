'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CategorySpendingChart } from '@/components/reports/category-spending-chart';
import { IncomeExpenseTrendChart } from '@/components/reports/income-expense-trend-chart';

export default function ReportsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You don't have any transactions to generate reports yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">An overview of your spending and income.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>How your expenses are distributed across categories this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategorySpendingChart transactions={transactions} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Income vs. Expense</CardTitle>
            <CardDescription>Your monthly income and expense trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseTrendChart transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
