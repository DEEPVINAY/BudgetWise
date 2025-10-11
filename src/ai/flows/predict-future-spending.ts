'use server';

/**
 * @fileOverview AI flow for predicting future spending based on historical data.
 *
 * - predictFutureSpending - Predicts future spending based on historical data.
 * - PredictFutureSpendingInput - The input type for the predictFutureSpending function.
 * - PredictFutureSpendingOutput - The return type for the predictFutureSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictFutureSpendingInputSchema = z.object({
  historicalSpendingData: z.string().describe('Historical spending data in JSON format, including categories and amounts over time.'),
  predictionHorizon: z.string().describe('The prediction horizon (e.g., next month, next quarter).'),
});
export type PredictFutureSpendingInput = z.infer<typeof PredictFutureSpendingInputSchema>;

const PredictFutureSpendingOutputSchema = z.object({
  predictedSpending: z.string().describe('Predicted spending for each category for the specified horizon in JSON format.'),
  confidenceLevel: z.string().describe('The confidence level of the prediction (e.g., high, medium, low).'),
  explanation: z.string().describe('Explanation of the factors influencing the prediction.'),
});
export type PredictFutureSpendingOutput = z.infer<typeof PredictFutureSpendingOutputSchema>;

export async function predictFutureSpending(input: PredictFutureSpendingInput): Promise<PredictFutureSpendingOutput> {
  return predictFutureSpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFutureSpendingPrompt',
  input: {schema: PredictFutureSpendingInputSchema},
  output: {schema: PredictFutureSpendingOutputSchema},
  prompt: `You are a financial advisor. Analyze the historical spending data and predict future spending.

Historical Spending Data: {{{historicalSpendingData}}}
Prediction Horizon: {{{predictionHorizon}}}

Provide the predicted spending for each category, the confidence level, and an explanation of the factors influencing the prediction.

Make sure to return the predicted spending in JSON format.

Output should conform to the following schema:
${JSON.stringify(PredictFutureSpendingOutputSchema.shape, null, 2)}`,
});

const predictFutureSpendingFlow = ai.defineFlow(
  {
    name: 'predictFutureSpendingFlow',
    inputSchema: PredictFutureSpendingInputSchema,
    outputSchema: PredictFutureSpendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
