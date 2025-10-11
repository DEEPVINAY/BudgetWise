'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ChartTooltipContent, ChartContainer, ChartLegendContent, ChartLegend } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { format, subMonths, startOfMonth } from 'date-fns';

interface IncomeExpenseTrendChartProps {
  transactions: Transaction[];
}

export function IncomeExpenseTrendChart({ transactions }: IncomeExpenseTrendChartProps) {
  const chartData = React.useMemo(() => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = format(subMonths(new Date(), i), 'MMM yyyy');
      monthlyData[month] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const month = format(t.date.toDate(), 'MMM yyyy');
      if (monthlyData[month]) {
        if (t.type === 'income') {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += t.amount;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, totals]) => ({
      month,
      ...totals,
    }));
  }, [transactions]);

  if (!transactions) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <p className="text-muted-foreground">Not enough data to display chart.</p>
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value as number)}
            tickLine={false}
            axisLine={false}
      
            fontSize={12}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
            content={<ChartTooltipContent formatter={(value, name) => `${name.charAt(0).toUpperCase() + name.slice(1)}: ${formatCurrency(value as number)}`}/>}
          />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
