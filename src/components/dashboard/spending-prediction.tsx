'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { predictFutureSpending, PredictFutureSpendingOutput } from '@/ai/flows/predict-future-spending';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';

export function SpendingPrediction() {
  const [prediction, setPrediction] = useState<PredictFutureSpendingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
  }, [firestore, user]);

  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  const handlePrediction = async () => {
    if (!transactions || transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Not Enough Data',
        description: 'You need some transactions to generate a forecast.',
      });
      return;
    }

    setIsLoading(true);
    setPrediction(null);
    try {
      const historicalData = JSON.stringify(
        transactions.map(t => ({...t, date: t.date.toDate()}))
      );
      const result = await predictFutureSpending({
        historicalSpendingData: historicalData,
        predictionHorizon: 'next month',
      });
      setPrediction(result);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'Could not generate spending prediction. Please try again later.',
      });
    }
    setIsLoading(false);
  };
  
  const parsedSpending = prediction ? JSON.parse(prediction.predictedSpending) : null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Spending Forecast</CardTitle>
        <CardDescription>Predict your spending for next month.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Forecasting your expenses...</p>
          </div>
        ) : prediction && parsedSpending ? (
          <div className="w-full text-left space-y-4">
            <div>
              <p className="font-semibold text-lg mb-2">Predicted Spending:</p>
              <ul className="space-y-2">
                {Object.entries(parsedSpending).map(([category, amount]) => (
                  <li key={category} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(amount as number)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm">Confidence: <Badge variant={prediction.confidenceLevel === 'high' ? 'default' : 'secondary'}>{prediction.confidenceLevel}</Badge></p>
              <p className="text-xs text-muted-foreground mt-2">{prediction.explanation}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Wand2 className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Use AI to get an estimate of your spending for the upcoming month based on your history.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePrediction} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {prediction ? 'Regenerate Forecast' : 'Generate Forecast'}
        </Button>
      </CardFooter>
    </Card>
  );
}
