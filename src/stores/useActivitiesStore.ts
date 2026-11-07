import { create } from 'zustand';
import {
  RoutineEasyTable,
  RoutineFlexibleTable,
  DeadlineActivityTable,
  NoDeadlineActivityTable,
} from '../types';
import { routineEasyRepository } from '../database/repositories/routineEasyRepository';
import { routineFlexibleRepository } from '../database/repositories/routineFlexibleRepository';
import { deadlineRepository } from '../database/repositories/deadlineRepository';
import { noDeadlineRepository } from '../database/repositories/noDeadlineRepository';

interface ActivitiesState {
  routineEasy: RoutineEasyTable[];
  routineFlexible: RoutineFlexibleTable[];
  deadlineActivities: DeadlineActivityTable[];
  noDeadlineActivities: NoDeadlineActivityTable[];
  isLoading: boolean;
  activeTab: 'routine_easy' | 'routine_flexible' | 'deadline' | 'no_deadline';

  setActiveTab: (tab: 'routine_easy' | 'routine_flexible' | 'deadline' | 'no_deadline') => void;
  loadAllActivities: () => Promise<void>;

  // Routine Easy
  createRoutineEasy: (data: Omit<RoutineEasyTable, 'id' | 'created_at'>) => Promise<RoutineEasyTable>;
  updateRoutineEasy: (id: string, data: Partial<RoutineEasyTable>) => Promise<void>;
  deleteRoutineEasy: (id: string) => Promise<void>;

  // Routine Flexible
  createRoutineFlexible: (data: Omit<RoutineFlexibleTable, 'id' | 'created_at'>) => Promise<RoutineFlexibleTable>;
  updateRoutineFlexible: (id: string, data: Partial<RoutineFlexibleTable>) => Promise<void>;
  deleteRoutineFlexible: (id: string) => Promise<void>;

  // Deadline
  createDeadlineActivity: (data: Omit<DeadlineActivityTable, 'id' | 'created_at'>) => Promise<DeadlineActivityTable>;
  updateDeadlineActivity: (id: string, data: Partial<DeadlineActivityTable>) => Promise<void>;
  deleteDeadlineActivity: (id: string) => Promise<void>;

  // No Deadline
  createNoDeadlineActivity: (data: Omit<NoDeadlineActivityTable, 'id' | 'created_at'>) => Promise<NoDeadlineActivityTable>;
  updateNoDeadlineActivity: (id: string, data: Partial<NoDeadlineActivityTable>) => Promise<void>;
  deleteNoDeadlineActivity: (id: string) => Promise<void>;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  routineEasy: [],
  routineFlexible: [],
  deadlineActivities: [],
  noDeadlineActivities: [],
  isLoading: false,
  activeTab: 'routine_easy',

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadAllActivities: async () => {
    set({ isLoading: true });
    try {
      const [re, rf, da, nda] = await Promise.all([
        routineEasyRepository.getAll(),
        routineFlexibleRepository.getAll(),
        deadlineRepository.getAll(),
        noDeadlineRepository.getAll(),
      ]);
      set({
        routineEasy: re,
        routineFlexible: rf,
        deadlineActivities: da,
        noDeadlineActivities: nda,
      });
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Routine Easy
  createRoutineEasy: async (data) => {
    const newRecord = await routineEasyRepository.create({
      ...data,
      id: crypto.randomUUID(),
    });
    set({ routineEasy: [...get().routineEasy, newRecord] });
    return newRecord;
  },
  updateRoutineEasy: async (id, data) => {
    await routineEasyRepository.update(id, data);
    set({
      routineEasy: get().routineEasy.map((r) => (r.id === id ? { ...r, ...data } : r)),
    });
  },
  deleteRoutineEasy: async (id) => {
    await routineEasyRepository.delete(id);
    set({ routineEasy: get().routineEasy.filter((r) => r.id !== id) });
  },

  // Routine Flexible
  createRoutineFlexible: async (data) => {
    const newRecord = await routineFlexibleRepository.create({
      ...data,
      id: crypto.randomUUID(),
    });
    set({ routineFlexible: [...get().routineFlexible, newRecord] });
    return newRecord;
  },
  updateRoutineFlexible: async (id, data) => {
    await routineFlexibleRepository.update(id, data);
    set({
      routineFlexible: get().routineFlexible.map((r) => (r.id === id ? { ...r, ...data } : r)),
    });
  },
  deleteRoutineFlexible: async (id) => {
    await routineFlexibleRepository.delete(id);
    set({ routineFlexible: get().routineFlexible.filter((r) => r.id !== id) });
  },

  // Deadline
  createDeadlineActivity: async (data) => {
    const newRecord = await deadlineRepository.create({
      ...data,
      id: crypto.randomUUID(),
    });
    set({ deadlineActivities: [...get().deadlineActivities, newRecord] });
    return newRecord;
  },
  updateDeadlineActivity: async (id, data) => {
    await deadlineRepository.update(id, data);
    set({
      deadlineActivities: get().deadlineActivities.map((r) => (r.id === id ? { ...r, ...data } : r)),
    });
  },
  deleteDeadlineActivity: async (id) => {
    await deadlineRepository.delete(id);
    set({ deadlineActivities: get().deadlineActivities.filter((r) => r.id !== id) });
  },

  // No Deadline
  createNoDeadlineActivity: async (data) => {
    const newRecord = await noDeadlineRepository.create({
      ...data,
      id: crypto.randomUUID(),
    });
    set({ noDeadlineActivities: [...get().noDeadlineActivities, newRecord] });
    return newRecord;
  },
  updateNoDeadlineActivity: async (id, data) => {
    await noDeadlineRepository.update(id, data);
    set({
      noDeadlineActivities: get().noDeadlineActivities.map((r) => (r.id === id ? { ...r, ...data } : r)),
    });
  },
  deleteNoDeadlineActivity: async (id) => {
    await noDeadlineRepository.delete(id);
    set({ noDeadlineActivities: get().noDeadlineActivities.filter((r) => r.id !== id) });
  },
}));
