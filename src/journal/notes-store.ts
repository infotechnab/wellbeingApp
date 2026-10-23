import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EmotionId } from '@/content';
import { deviceStorage, newId, storageKey } from '@/storage/persist';

export type JournalNote = {
  id: string;
  activityId: string;
  emotionId: EmotionId;
  text: string;
  createdAt: number;
  syncedAt?: number;
};

type NotesStore = {
  notes: JournalNote[];
  add: (note: Omit<JournalNote, 'id' | 'createdAt' | 'syncedAt'>) => void;
  remove: (id: string) => void;
  markSynced: (ids: string[], at: number) => void;
};

/** Short notes written during activities, such as "Next Step Write". */
export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      add: (note) => set((state) => ({ notes: [{ ...note, id: newId(), createdAt: Date.now() }, ...state.notes].slice(0, 500) })),
      remove: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      markSynced: (ids, at) => {
        const done = new Set(ids);
        set((state) => ({ notes: state.notes.map((n) => (done.has(n.id) ? { ...n, syncedAt: at } : n)) }));
      },
    }),
    { name: storageKey('notes'), storage: deviceStorage, version: 1 },
  ),
);
