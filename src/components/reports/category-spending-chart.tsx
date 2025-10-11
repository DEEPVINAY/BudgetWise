'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { categoryIcons } from '../shared/icons';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface CategorySpendingChartProps {
  transactions: Transaction[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
];

export function CategorySpendingChart({ transactions }: CategorySpendingChartProps) {
  const chartData = React.useMemo(() => {
    const spendingByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(spendingByCategory)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalSpent = React.useMemo(() => chartData.reduce((sum, item) => sum + item.total, 0), [chartData]);


  if (!transactions) {
    return <Skeleton className="h-80 w-full" />
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <p className="text-muted-foreground">No expense data to display.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
        <ChartContainer config={{}} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Pie data={chartData} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
         <div className="w-full mt-4 space-y-2">
            {chartData.map((item, index) => {
                 const Icon = categoryIcons[item.category] || categoryIcons['Other'];
                 const percentage = (item.total / totalSpent) * 100;
                 return (
                    <div key={item.category} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                           <div style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length]}}></div>
                           <Icon className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <span className="text-sm font-semibold">{formatCurrency(item.total)}</span>
                            <Badge variant="secondary" className="text-xs">{percentage.toFixed(0)}%</Badge>
                        </div>
                    </div>
                 )
            })}
        </div>
    </div>
  );
}
