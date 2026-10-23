import { useCallback, useSyncExternalStore } from 'react';

type PersistedStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

/** True once every given persisted store has loaded its saved state from the device. */
export function useHydrated(...stores: PersistedStore[]): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const unsubs = stores.map((store) => store.persist.onFinishHydration(onChange));
      return () => unsubs.forEach((unsub) => unsub());
    },
    // The store list is fixed for the lifetime of a component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const snapshot = () => stores.every((store) => store.persist.hasHydrated());
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
