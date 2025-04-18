/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export const storageContext = {
  run: (callback: () => void) => {
    const store = new Map<string, any>();
    asyncLocalStorage.run(store, callback);
  },
  set: (key: string, value: any) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  },
  get: (key: string) => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get(key) : undefined;
  },
};
