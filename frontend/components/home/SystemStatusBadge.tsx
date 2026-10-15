'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

interface HealthState {
  isChecking: boolean;
  isOnline: boolean;
  database: string;
  uptime?: number;
  error?: string;
}

export function SystemStatusBadge() {
  const [status, setStatus] = useState<HealthState>({
    isChecking: true,
    isOnline: false,
    database: 'unknown',
  });

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const readyRes = await apiClient.getReadyStatus();
        if (isMounted) {
          setStatus({
            isChecking: false,
            isOnline: true,
            database: readyRes.data.database,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus({
            isChecking: false,
            isOnline: false,
            database: 'disconnected',
            error: err instanceof Error ? err.message : 'Server unreachable',
          });
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (status.isChecking) {
    return (
      <Badge variant="neutral" className="gap-1.5">
        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
        Checking API status...
      </Badge>
    );
  }

  if (status.isOnline) {
    return (
      <Badge variant="success" className="gap-1.5 py-1 px-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        Backend API & PostgreSQL Ready
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="gap-1.5 py-1 px-3">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Backend Offline (Port 3001)
    </Badge>
  );
}
