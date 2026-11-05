type PersistedStore = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

/**
 * Waits until a persisted store has loaded from the device. A notification tap can start the app in the
 * background, and saving before the journal has loaded would overwrite it.
 */
export function whenHydrated(store: PersistedStore): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
