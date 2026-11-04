import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  requestId: string;
  userId?: string;
  method?: string;
  url?: string;
  ip?: string;
  startTime?: number;
  metadata?: Record<string, any>;
}

export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<RequestStore>();

  static run<R>(store: RequestStore, callback: () => R): R {
    return this.storage.run(store, callback);
  }

  static get(): RequestStore | undefined {
    return this.storage.getStore();
  }

  static getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  static setUserId(userId: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  static setMetadata(key: string, value: any): void {
    const store = this.storage.getStore();
    if (store) {
      store.metadata = store.metadata || {};
      store.metadata[key] = value;
    }
  }
}
