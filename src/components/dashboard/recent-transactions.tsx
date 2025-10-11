'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { categoryIcons } from '@/components/shared/icons';
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Skeleton } from "../ui/skeleton";

export function RecentTransactions() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`), orderBy('date', 'desc'), limit(5));
  }, [firestore, user]);

  const { data: recentTransactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities.</CardDescription>
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
          <p className="text-center text-muted-foreground">No transactions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
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
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{transaction.merchant}</div>
                          <div className="text-xs text-muted-foreground hidden md:block">{transaction.date.toDate().toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
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
       <CardFooter className="justify-end">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">View All</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
