'use client';

import { KpiCards } from '@/components/dashboard/kpi-cards';
import { SpendingOverviewChart } from '@/components/dashboard/spending-overview-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetGoals } from '@/components/dashboard/budget-goals';
import { SpendingPrediction } from '@/components/dashboard/spending-prediction';
import { useUser } from '@/firebase';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { OwnerKpiCards } from '@/components/dashboard/owner/owner-kpi-cards';
import { AllUserTransactions } from '@/components/dashboard/owner/all-user-transactions';
import { AllUsersTable } from '@/components/dashboard/owner/all-users-table';


export default function DashboardPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(idTokenResult => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);
        setIsLoading(false);
      })
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return (
       <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, Owner. Here is the platform-wide overview.
          </p>
        </div>
        
        <OwnerKpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AllUserTransactions />
          </div>
          <div className="lg:col-span-1">
            <AllUsersTable />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome Back, {user?.email ? user.email.split('@')[0] : 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here is your financial overview for this month.
        </p>
      </div>

      <KpiCards />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <BudgetGoals />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <SpendingPrediction />
        </div>
      </div>
    </div>
  );
}
