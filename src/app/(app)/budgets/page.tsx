'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { upsertBudget, defaultCategories } from '@/lib/data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { categoryIcons } from '@/components/shared/icons';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const budgetSchema = z.object({
  category: z.string().min(1, { message: 'Category is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number' }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/budgets`);
  }, [firestore, user]);

  const { data: budgets, isLoading } = useCollection<Budget>(budgetsQuery);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      amount: 0,
    },
  });

  const onSubmit = (data: BudgetFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to manage budgets.',
      });
      return;
    }

    try {
      upsertBudget(firestore, user.uid, data);
      toast({
        title: 'Budget Saved',
        description: `${data.category} budget set to ${formatCurrency(data.amount)}.`,
      });
      setEditingCategory(null);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save budget. Please try again.',
      });
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingCategory(budget.category);
    form.reset({
      category: budget.category,
      amount: budget.amount,
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset({ category: '', amount: 0 });
  };
  
  const currentBudgets = budgets?.map(b => b.category) || [];
  const availableCategories = defaultCategories.filter(c => !currentBudgets.includes(c));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Set New Budget</CardTitle>
          <CardDescription>
            {editingCategory
              ? `Editing budget for ${editingCategory}`
              : 'Add a new budget for a category.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!editingCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {editingCategory && (
                           <SelectItem value={editingCategory}>{editingCategory}</SelectItem>
                        )}
                        {availableCategories.map(category => {
                          const Icon = categoryIcons[category] || categoryIcons['Other'];
                          return (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{category}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end gap-2">
                <Button type="submit" className="w-full">
                  {editingCategory ? 'Save Changes' : 'Set Budget'}
                </Button>
                {editingCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>
            Here is a list of your current budget allocations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !budgets || budgets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't set any budgets yet.</p>
            </div>
          ) : (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map(budget => {
                const Icon = categoryIcons[budget.category] || categoryIcons['Other'];
                return (
                  <Card key={budget.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        {budget.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-2xl font-bold">{formatCurrency(budget.amount)}</p>
                      <p className="text-xs text-muted-foreground">Monthly Limit</p>
                    </CardContent>
                    <div className="p-4 pt-0">
                       <Button variant="outline" size="sm" onClick={() => handleEdit(budget)} className="w-full">Edit</Button>
                    </div>
                  </Card>
                )
              })}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
