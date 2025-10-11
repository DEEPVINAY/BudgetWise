'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { categoryIcons } from '../shared/icons';
import { defaultCategories, updateTransaction } from '@/lib/data';
import { useUser, useFirestore } from '@/firebase';
import type { Transaction } from '@/lib/types';

const transactionSchema = z.object({
  merchant: z.string().min(1, { message: 'Merchant is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  date: z.date(),
  category: z.string().min(1, { message: 'Category is required' }),
  type: z.enum(['income', 'expense']),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface EditTransactionSheetProps {
    transaction: Transaction & { id: string; date: { toDate: () => Date } };
}

export function EditTransactionSheet({ transaction }: EditTransactionSheetProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
        ...transaction,
        date: transaction.date.toDate(),
    },
  });

  const onSubmit = (data: TransactionFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to edit a transaction.',
      });
      return;
    }
    
    try {
      updateTransaction(firestore, user.uid, transaction.id, data);
      toast({
        title: 'Transaction Updated',
        description: `Your transaction has been successfully updated.`,
      });
      setOpen(false);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update transaction. Please try again.',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>
            Update the details for your transaction.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow space-y-4 overflow-auto p-1">
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Amazon, Starbucks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {defaultCategories.map((category) => {
                        const Icon = categoryIcons[category] ?? categoryIcons['Other'];
                        return (
                          <SelectItem key={category} value={category}>
                           <div className="flex items-center gap-2">
                             <Icon className="h-4 w-4" />
                             <span>{category}</span>
                           </div>
                          </SelectItem>
                        );
                      })}
                       <SelectItem value="Income">
                           <div className="flex items-center gap-2">
                             <categoryIcons.Income className="h-4 w-4" />
                             <span>Income</span>
                           </div>
                        </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="expense" id="expense" />
                        </FormControl>
                        <FormLabel htmlFor="expense" className="font-normal">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="income" id="income" />
                        </FormControl>
                        <FormLabel htmlFor="income" className="font-normal">Income</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter>
          <Button onClick={form.handleSubmit(onSubmit)} type="submit" className="w-full">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
