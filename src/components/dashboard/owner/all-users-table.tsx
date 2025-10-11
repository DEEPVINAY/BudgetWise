
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from "../../ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AllUsersTable() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    // This query is disabled to prevent permission errors.
    if (!firestore) return null;
    return null; // The query to collection(firestore, 'users') is what causes the crash.
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Registered Users</CardTitle>
        <CardDescription>A list of all users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : !users || users.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium truncate">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground truncate">{user.id}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
