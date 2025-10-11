'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Server, Database, Mail } from 'lucide-react';

const services = [
  { name: 'Web Application', status: 'Operational', icon: ShieldCheck },
  { name: 'API Services', status: 'Operational', icon: Server },
  { name: 'Database', status: 'Operational', icon: Database },
  { name: 'Authentication Services', status: 'Operational', icon: Mail },
];

export default function StatusPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-muted-foreground">
          Current status of our application services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Status</CardTitle>
          <CardDescription>
            All systems are currently operational.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <Badge
                    variant={
                      service.status === 'Operational' ? 'default' : 'destructive'
                    }
                    className="bg-green-500 text-green-50"
                  >
                    {service.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident History</CardTitle>
          <CardDescription>
            There have been no incidents in the past 90 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>No recent incidents to display.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
