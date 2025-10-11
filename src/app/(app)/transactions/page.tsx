'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { EditTransactionSheet } from '@/components/transactions/edit-transaction-sheet';

export default function TransactionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const isIncome = (type: string) => type === 'income';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            A list of your recent transactions.
          </CardDescription>
        </div>
        <AddTransactionSheet />
      </CardHeader>
      <CardContent>
         {isLoading ? (
          <div className="space-y-4">
             {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                   <div className="hidden sm:block">
                     <Skeleton className="h-6 w-20" />
                   </div>
                   <div className="hidden md:block">
                     <Skeleton className="h-4 w-24" />
                   </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions recorded yet.</p>
            <p className="text-sm">Click "Add Transaction" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => {
                const Icon =
                  categoryIcons[transaction.category] || categoryIcons['Other'];
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.merchant}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {transaction.date.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        isIncome(transaction.type) ? 'text-green-500' : ''
                      }`}
                    >
                      {isIncome(transaction.type) ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                        <EditTransactionSheet transaction={transaction as any} />
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
