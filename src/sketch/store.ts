import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, newId, storageKey } from '@/storage/persist';

import type { Sketch } from './model';

type SketchStore = {
  sketches: Sketch[];
  /** The first-launch sketch screen is shown only until this is true. */
  onboarded: boolean;
  save: (input: Omit<Sketch, 'id' | 'createdAt' | 'syncedAt'>) => Sketch;
  remove: (id: string) => void;
  merge: (sketches: Sketch[]) => void;
  finishOnboarding: () => void;
  markSynced: (ids: string[], at: number) => void;
};

export const useSketchStore = create<SketchStore>()(
  persist(
    (set) => ({
      sketches: [],
      onboarded: false,
      save: (input) => {
        const sketch: Sketch = { ...input, id: newId(), createdAt: Date.now() };
        set((state) => ({ sketches: [sketch, ...state.sketches].slice(0, 100) }));
        return sketch;
      },
      remove: (id) => set((state) => ({ sketches: state.sketches.filter((s) => s.id !== id) })),
      merge: (incoming) =>
        set((state) => {
          const known = new Set(state.sketches.map((s) => s.id));
          const added = incoming.filter((s) => !known.has(s.id));
          return { sketches: [...state.sketches, ...added].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100) };
        }),
      finishOnboarding: () => set({ onboarded: true }),
      markSynced: (ids, at) => {
        const done = new Set(ids);
        set((state) => ({ sketches: state.sketches.map((s) => (done.has(s.id) ? { ...s, syncedAt: at } : s)) }));
      },
    }),
    { name: storageKey('sketches'), storage: deviceStorage, version: 1 },
  ),
);
