import {
  collection,
  addDoc,
  doc,
  updateDoc,
  Timestamp,
  Firestore,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { Budget, Transaction, User } from './types';

export const addTransaction = (
  db: Firestore,
  userId: string,
  transaction: Omit<Transaction, 'id' | 'date' | 'userId'> & { date: Date }
) => {
  if (!userId) {
    return Promise.reject(new Error('User is not authenticated.'));
  }

  const transactionsCollection = collection(
    db,
    `users/${userId}/transactions`
  );
  const newTransaction = {
    ...transaction,
    userId,
    date: Timestamp.fromDate(transaction.date),
  };

  addDoc(transactionsCollection, newTransaction).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: transactionsCollection.path,
      operation: 'create',
      requestResourceData: newTransaction,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const updateTransaction = (
  db: Firestore,
  userId: string,
  transactionId: string,
  transaction: Omit<Transaction, 'id' | 'date' | 'userId'> & { date: Date }
) => {
  if (!userId) {
    return Promise.reject(new Error('User is not authenticated.'));
  }

  const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`);
  const updatedTransaction = {
    ...transaction,
    userId,
    date: Timestamp.fromDate(transaction.date),
  };

  updateDoc(transactionRef, updatedTransaction).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: transactionRef.path,
      operation: 'update',
      requestResourceData: updatedTransaction,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const upsertBudget = (
  db: Firestore,
  userId: string,
  budget: Omit<Budget, 'id'>
) => {
  if (!userId) {
    return Promise.reject(new Error('User is not authenticated.'));
  }

  const budgetRef = doc(db, `users/${userId}/budgets/${budget.category}`);
  
  setDoc(budgetRef, budget, { merge: true }).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: budgetRef.path,
      operation: 'write',
      requestResourceData: budget,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
};

export const defaultCategories: string[] = [
  'Groceries',
  'Shopping',
  'Transport',
  'Entertainment',
  'Housing',
  'Health',
  'Work',
  'Education',
  'Gifts',
  'Other',
];

export const addUserProfile = (db: Firestore, user: User) => {
  const userRef = doc(db, `users/${user.id}`);
  setDoc(userRef, { email: user.email }, { merge: true }).catch((serverError) => {
     const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'write',
      requestResourceData: { email: user.email },
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
