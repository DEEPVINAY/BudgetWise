'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import { predictFutureSpending, PredictFutureSpendingOutput } from '@/ai/flows/predict-future-spending';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SpendingPrediction() {
  const [prediction, setPrediction] = useState<PredictFutureSpendingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        title: 'Insufficient Data',
        description: 'You need at least a few transactions to generate a meaningful forecast.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      // Simplify data for the AI to process
      const historicalData = JSON.stringify(
        transactions.map(t => ({
          category: t.category,
          amount: t.amount,
          type: t.type,
          date: t.date.toDate().toISOString().split('T')[0]
        }))
      );

      const result = await predictFutureSpending({
        historicalSpendingData: historicalData,
        predictionHorizon: 'next month',
      });
      
      setPrediction(result);
    } catch (e: any) {
      setError(e.message || 'Could not generate spending prediction.');
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'An error occurred while generating your forecast.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Safely parse the predicted spending JSON string from the AI output
  const getParsedSpending = () => {
    if (!prediction?.predictedSpending) return null;
    try {
      return JSON.parse(prediction.predictedSpending);
    } catch (e) {
      return null;
    }
  };

  const parsedSpending = getParsedSpending();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full flex flex-col border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-accent" />
          AI Spending Forecast
        </CardTitle>
        <CardDescription>Intelligent estimates for next month based on your history.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground animate-pulse">Analyzing your financial patterns...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : prediction && parsedSpending ? (
          <div className="w-full text-left space-y-4">
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Forecasted Expenses</p>
              <ul className="space-y-2">
                {Object.entries(parsedSpending).map(([category, amount]) => (
                  <li key={category} className="flex justify-between items-center bg-muted/40 p-3 rounded-lg">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(amount as number)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence Level</span>
                 <Badge variant={prediction.confidenceLevel === 'high' ? 'default' : 'secondary'}>
                    {prediction.confidenceLevel}
                 </Badge>
              </div>
              <p className="text-sm text-foreground italic leading-relaxed">
                "{prediction.explanation}"
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-6">
            <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit">
              <Wand2 className="h-10 w-10 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
              Our AI advisor can help you prepare for the month ahead by spotting trends in your spending.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={handlePrediction} 
          disabled={isLoading} 
          className="w-full shadow-lg transition-transform active:scale-[0.98]"
          variant={prediction ? "outline" : "default"}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {prediction ? 'Update Forecast' : 'Generate Forecast'}
        </Button>
      </CardFooter>
    </Card>
  );
}
