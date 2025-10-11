'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { categoryIcons } from '@/components/shared/icons';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Skeleton } from "../../ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AllUserTransactions() {
  const firestore = useFirestore();
  const { user } = useUser();

  // The collectionGroup query was causing permission errors.
  // This is a placeholder that shows the admin's own transactions instead.
  const allTransactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`), orderBy('date', 'desc'), limit(10));
  }, [firestore, user]);

  const { data: recentTransactions, isLoading } = useCollection<Transaction & { userId: string }>(allTransactionsQuery);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Your Recent Transactions</CardTitle>
        <CardDescription>The platform-wide transaction view is disabled. Showing your activity instead.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
          </div>
        ) : !recentTransactions || recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No transactions found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category] || categoryIcons['Other'];
                const isIncome = transaction.type === 'income';
                return (
                  <TableRow key={transaction.id}>
                     <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{transaction.merchant}</div>
                          <div className="text-xs text-muted-foreground hidden md:block">
                            <Badge variant="outline">{transaction.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${isIncome ? 'text-green-500' : ''}`}>
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
