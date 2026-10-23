import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Every persisted store saves to AsyncStorage (localStorage on web) under a namespaced key. */
export const storageKey = (name: string) => `wellbeing:${name}`;

export const deviceStorage = createJSONStorage(() => AsyncStorage);

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
