import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service.js';
import { DataSource } from 'typeorm';

describe('HealthService', () => {
  it('should return liveness status', () => {
    const mockDataSource = {} as DataSource;
    const service = new HealthService(mockDataSource);
    const live = service.checkLiveness();

    expect(live.status).toBe('ok');
    expect(live.uptime).toBeGreaterThanOrEqual(0);
    expect(live.timestamp).toBeDefined();
  });

  it('should return readiness status when database responds', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as DataSource;

    const service = new HealthService(mockDataSource);
    const ready = await service.checkReadiness();

    expect(ready.status).toBe('ok');
    expect(ready.database).toBe('connected');
    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should throw ServiceUnavailableException when database query fails', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: vi.fn().mockRejectedValue(new Error('Connection refused')),
    } as unknown as DataSource;

    const service = new HealthService(mockDataSource);
    await expect(service.checkReadiness()).rejects.toThrow();
  });
});
