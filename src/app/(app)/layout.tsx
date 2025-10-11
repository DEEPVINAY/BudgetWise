'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="flex items-center gap-4 p-4 sm:p-6 lg:p-8">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold text-foreground">
              BudgetWise
            </h1>
          </header>
          <div className="w-full max-w-7xl p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0 mx-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
