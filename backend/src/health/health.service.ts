import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface LivenessStatus {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

export interface ReadinessStatus {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  checkLiveness(): LivenessStatus {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<ReadinessStatus> {
    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('DataSource is not initialized');
      }

      // Quick ping without leaking details
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
        message: 'Database connection is unavailable',
      });
    }
  }
}
