'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  collection,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import type { Budget, Transaction, User as AppUser, BudgetWithSpent } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { categoryIcons } from '@/components/shared/icons';
import { useMemo, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

function UserTransactions({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const transactionsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(
      collection(firestore, `users/${userId}/transactions`),
      orderBy('date', 'desc'),
    );
  }, [firestore, userId]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          Recent financial activity for this user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No transactions recorded.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const Icon =
                  categoryIcons[transaction.category] || categoryIcons['Other'];
                const isIncome = transaction.type === 'income';
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="font-medium">{transaction.merchant}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.date.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        isIncome ? 'text-green-500' : ''
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function UserBudgets({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const transactionsQuery = useMemoFirebase(() => {
        if (!userId) return null;
        return collection(firestore, `users/${userId}/transactions`);
    }, [firestore, userId]);

    const budgetsQuery = useMemoFirebase(() => {
        if (!userId) return null;
        return collection(firestore, `users/${userId}/budgets`);
    }, [firestore, userId]);

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

    if (isLoading) {
        return <Loader2 className="h-6 w-6 animate-spin" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>This user's monthly spending goals.</CardDescription>
            </CardHeader>
            <CardContent>
                {!budgetsWithSpending || budgetsWithSpending.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground">No budgets set.</p>
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

export default function UserDetailPage() {
  const { userId } = useParams() as { userId: string };
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdminCheck, setIsLoadingAdminCheck] = useState(true);

  useEffect(() => {
    if (adminUser) {
      adminUser.getIdTokenResult().then((idTokenResult) => {
        setIsAdmin(!!idTokenResult.claims.admin);
        setIsLoadingAdminCheck(false);
      });
    } else if (adminUser === null) {
      setIsLoadingAdminCheck(false);
    }
  }, [adminUser]);

  const userDocRef = useMemoFirebase(() => {
    if (!userId || !isAdmin) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId, isAdmin]);

  const { data: user, isLoading: isLoadingUser } = useDoc<AppUser>(userDocRef);

  if (isLoadingAdminCheck || isLoadingUser) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

   if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="text-muted-foreground">
          The requested user does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.email}</CardTitle>
              <CardDescription>User ID: {user.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserTransactions userId={userId} />
        <UserBudgets userId={userId} />
      </div>

    </div>
  );
}
