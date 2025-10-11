'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function SpendingOverviewChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
  }, [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const spendingByCategory = (transactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as { [key: string]: number });

  const chartData = Object.entries(spendingByCategory).map(([category, total]) => ({
    category,
    total,
  }));

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : chartData.length === 0 ? (
           <div className="h-80 w-full flex items-center justify-center">
             <p className="text-muted-foreground">Not enough data to display chart.</p>
           </div>
        ) : (
          <ChartContainer config={{}} className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  />
                  <YAxis
                  tickFormatter={(value) => formatCurrency(value as number)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  />
                  <Tooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)}/>}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
