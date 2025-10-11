
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Wallet, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import type { Transaction, User } from '@/lib/types';
import { Skeleton } from "../../ui/skeleton";
import { useUser } from "@/firebase";

export function OwnerKpiCards() {
  const firestore = useFirestore();
  const { user } = useUser();

  // The collectionGroup query was causing permission errors.
  // This is a placeholder showing the admin's own data.
  const allTransactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [firestore, user]);

  const usersQuery = useMemoFirebase(() => {
    // This query is disabled to prevent permission errors.
    if (!firestore) return null;
    return null; // The query to collection(firestore, 'users') is what causes the crash.
  }, [firestore]);


  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(allTransactionsQuery);

  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const totalUsers = users?.length ?? 0;
  const totalTransactions = transactions?.length ?? 0;

  const kpiData = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Your Transactions",
      value: totalTransactions,
      icon: ArrowRightLeft,
      color: "text-accent",
    },
    {
      title: "Your Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Your Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-500",
    },
  ];

  const isLoading = isLoadingTransactions || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
