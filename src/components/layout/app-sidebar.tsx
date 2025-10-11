'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MobileSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Goal,
  AreaChart,
  Settings,
  PiggyBank,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { useUser, useAuth } from '@/firebase';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import React from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/budgets', label: 'Budgets', icon: Goal },
  { href: '/reports', label: 'Reports', icon: AreaChart },
];

const secondaryMenuItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminMenuItems = [
    { href: '/management', label: 'User Management', icon: Users },
    { href: '/status', label: 'Status', icon: ShieldCheck },
]

function UserProfile() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const userAvatar = placeholderImages.userAvatar;

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full">
        <div className='flex items-center gap-3'>
            <Avatar>
                <AvatarImage asChild>
                <Image
                    src={userAvatar.src}
                    width={userAvatar.width}
                    height={userAvatar.height}
                    alt="User avatar"
                    data-ai-hint={userAvatar.hint}
                />
                </AvatarImage>
                <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground truncate max-w-28">
                {user.email}
                </span>
            </div>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
        >
            <LogOut className="h-4 w-4" />
        </Button>
    </div>
  );
}


function SidebarContentItems() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            setIsAdmin(!!idTokenResult.claims.admin);
        });
    } else {
        setIsAdmin(false);
    }
  }, [user]);

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            BudgetWise
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
           {isAdmin && adminMenuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                        tooltip={item.label}
                        isActive={pathname.startsWith(item.href)}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
             </SidebarMenuItem>
          ))}
          {secondaryMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  tooltip={item.label}
                  isActive={pathname.startsWith(item.href)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="flex items-center gap-3 mt-4">
          <UserProfile />
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar() {
  return (
    <>
      <Sidebar className="border-r">
        <SidebarContentItems />
      </Sidebar>
      <MobileSidebar>
        <SidebarContentItems />
      </MobileSidebar>
    </>
  );
}
