import { create } from 'zustand';
import { DayTimeline, ScheduledBlocksTable } from '../types';
import { scheduleRepository } from '../database/repositories/scheduleRepository';
import { routineEasyRepository } from '../database/repositories/routineEasyRepository';
import { bankRepository } from '../database/repositories/bankRepository';
import { settingsRepository } from '../database/repositories/settingsRepository';
import { generateRoutineBlocksForDate } from '../core/routine/recurrenceMatcher';
import { get7DaysStartingFrom, calculateDuration } from '../core/schedule/timeUtils';
import { findFreeGapsInDay } from '../core/schedule/conflictDetector';

interface ScheduleState {
  currentStartDate: Date;
  daysTimeline: DayTimeline[];
  isLoading: boolean;
  theme: 'dark' | 'light';
  freeTimeLabel: string;
  bankBalanceMinutes: number;

  loadSchedule: (startDate?: Date) => Promise<void>;
  nextWeek: () => Promise<void>;
  prevWeek: () => Promise<void>;
  goToToday: () => Promise<void>;

  lockDay: (date: string) => Promise<void>;
  unlockDay: (date: string) => Promise<void>;

  addBlock: (block: Omit<ScheduledBlocksTable, 'id' | 'created_at'>) => Promise<ScheduledBlocksTable>;
  updateBlock: (id: string, data: Partial<ScheduledBlocksTable>) => Promise<void>;
  deleteBlock: (id: string, payWithBank?: boolean) => Promise<void>;
  
  addUnforeseen: (
    date: string,
    title: string,
    startTime: string,
    endTime: string,
    replacesBlockId?: string
  ) => Promise<void>;

  updateRoutinePractice: (blockId: string, actualStart: string, actualEnd: string) => Promise<void>;
  
  toggleTheme: () => Promise<void>;
  setFreeTimeLabel: (label: string) => Promise<void>;
  reloadBankBalance: () => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  currentStartDate: new Date(),
  daysTimeline: [],
  isLoading: false,
  theme: 'dark',
  freeTimeLabel: 'Tempo Livre',
  bankBalanceMinutes: 0,

  loadSchedule: async (startDate = get().currentStartDate) => {
    set({ isLoading: true, currentStartDate: startDate });

    try {
      // 1. Carrega configurações e saldo do banco
      const [savedTheme, savedLabel, bankBalance, activeRoutines] = await Promise.all([
        settingsRepository.get('theme', 'dark'),
        settingsRepository.get('free_time_custom_label', 'Tempo Livre'),
        bankRepository.getBalance(),
        routineEasyRepository.getActive(),
      ]);

      set({
        theme: (savedTheme as 'dark' | 'light') || 'dark',
        freeTimeLabel: savedLabel || 'Tempo Livre',
        bankBalanceMinutes: bankBalance,
      });

      // Aplica classe dark no HTML
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 2. Calcula os 7 dias
      const daysInfo = get7DaysStartingFrom(startDate);
      const startStr = daysInfo[0].dateStr;
      const endStr = daysInfo[daysInfo.length - 1].dateStr;

      // 3. Garante que cada dia existe no banco
      for (const info of daysInfo) {
        await scheduleRepository.ensureDay(info.dateStr);
      }

      const [daysRows, allBlocks] = await Promise.all([
        scheduleRepository.getDaysRange(startStr, endStr),
        scheduleRepository.getBlocksForRange(startStr, endStr),
      ]);

      const daysMap = new Map(daysRows.map((d) => [d.date, d]));
      const blocksByDate = new Map<string, ScheduledBlocksTable[]>();

      for (const b of allBlocks) {
        const list = blocksByDate.get(b.date) || [];
        list.push(b);
        blocksByDate.set(b.date, list);
      }

      // 4. Injeta automaticamente rotinas fáceis nos dias que ainda não têm blocos
      const timelines: DayTimeline[] = [];

      for (const info of daysInfo) {
        const dayRow = daysMap.get(info.dateStr);
        let blocks = blocksByDate.get(info.dateStr) || [];

        // Se o dia não tem nenhum bloco registrado e não foi trancado, injeta as rotinas fáceis aplicáveis
        if (blocks.length === 0 && !dayRow?.is_locked && activeRoutines.length > 0) {
          const autoRoutines = generateRoutineBlocksForDate(activeRoutines, info.dateStr, info.dayOfWeek);
          for (const autoBlock of autoRoutines) {
            const saved = await scheduleRepository.createBlock(autoBlock);
            blocks.push(saved);
          }
        }

        // Ordena blocos por horário de início
        blocks.sort((a, b) => a.start_time.localeCompare(b.start_time));

        timelines.push({
          date: info.dateStr,
          dayOfWeek: info.dayOfWeek,
          formattedDate: info.formattedDay,
          isToday: info.isToday,
          isLocked: dayRow ? dayRow.is_locked === 1 : false,
          lockedAt: dayRow ? dayRow.locked_at : null,
          reviewStatus: dayRow?.review_status || 'pending',
          blocks,
        });
      }

      set({ daysTimeline: timelines });
    } catch (err) {
      console.error('Erro ao carregar cronograma:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  nextWeek: async () => {
    const next = new Date(get().currentStartDate);
    next.setDate(next.getDate() + 7);
    await get().loadSchedule(next);
  },

  prevWeek: async () => {
    const prev = new Date(get().currentStartDate);
    prev.setDate(prev.getDate() - 7);
    await get().loadSchedule(prev);
  },

  goToToday: async () => {
    await get().loadSchedule(new Date());
  },

  lockDay: async (date: string) => {
    const day = get().daysTimeline.find((d) => d.date === date);
    if (!day) return;

    // 1. Encontra lacunas vazias e transforma em "Tempo Livre"
    const gaps = findFreeGapsInDay(day.blocks);
    const freeTimeLabel = get().freeTimeLabel;

    for (const gap of gaps) {
      await scheduleRepository.createBlock({
        date,
        activity_type: 'free_time',
        activity_id: null,
        title: freeTimeLabel,
        color: '#64748b',
        start_time: gap.start,
        end_time: gap.end,
        duration_minutes: gap.durationMinutes,
        actual_start_time: null,
        actual_end_time: null,
        status: 'planned',
        is_locked_free_time: 1,
      });
    }

    // 2. Tranca o dia
    await scheduleRepository.setDayLock(date, true);
    await get().loadSchedule();
  },

  unlockDay: async (date: string) => {
    // Ao destrancar, remove os blocos gerados de tempo livre
    const day = get().daysTimeline.find((d) => d.date === date);
    if (day) {
      for (const block of day.blocks) {
        if (block.is_locked_free_time === 1) {
          await scheduleRepository.deleteBlock(block.id);
        }
      }
    }

    await scheduleRepository.setDayLock(date, false);
    await get().loadSchedule();
  },

  addBlock: async (blockData) => {
    const created = await scheduleRepository.createBlock(blockData);
    await get().loadSchedule();
    return created;
  },

  updateBlock: async (id, data) => {
    await scheduleRepository.updateBlock(id, data);
    await get().loadSchedule();
  },

  deleteBlock: async (id: string, payWithBank = false) => {
    let blockToDelete: ScheduledBlocksTable | undefined;
    for (const d of get().daysTimeline) {
      const found = d.blocks.find((b) => b.id === id);
      if (found) {
        blockToDelete = found;
        break;
      }
    }

    if (blockToDelete && payWithBank) {
      // Debita minutos do banco de horas
      await bankRepository.addEntry(
        -blockToDelete.duration_minutes,
        `Remoção de atividade "${blockToDelete.title}" em dia trancado`,
        blockToDelete.id
      );
      await get().reloadBankBalance();
    }

    await scheduleRepository.deleteBlock(id);
    await get().loadSchedule();
  },

  addUnforeseen: async (date, title, startTime, endTime, replacesBlockId) => {
    const duration = calculateDuration(startTime, endTime);

    if (replacesBlockId) {
      // Verifica o bloco substituído
      const day = get().daysTimeline.find((d) => d.date === date);
      const replaced = day?.blocks.find((b) => b.id === replacesBlockId);

      if (replaced) {
        if (replaced.activity_type === 'free_time' || replaced.is_locked_free_time === 1) {
          // Se substitui tempo livre, o tempo livre vai para o banco como crédito!
          await bankRepository.addEntry(
            replaced.duration_minutes,
            `Tempo Livre convertido por imprevisto: "${title}"`,
            replaced.id
          );
          await get().reloadBankBalance();
        }
        await scheduleRepository.deleteBlock(replacesBlockId);
      }
    }

    await scheduleRepository.createBlock({
      date,
      activity_type: 'unforeseen',
      activity_id: null,
      title,
      color: '#f97316', // Laranja vibrante para imprevistos
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      actual_start_time: null,
      actual_end_time: null,
      status: 'planned',
      is_locked_free_time: 0,
    });

    await get().loadSchedule();
  },

  updateRoutinePractice: async (blockId, actualStart, actualEnd) => {
    await scheduleRepository.updateBlock(blockId, {
      actual_start_time: actualStart,
      actual_end_time: actualEnd,
    });
    await get().loadSchedule();
  },

  toggleTheme: async () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    await settingsRepository.set('theme', nextTheme);
    set({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setFreeTimeLabel: async (label: string) => {
    await settingsRepository.set('free_time_custom_label', label);
    set({ freeTimeLabel: label });
  },

  reloadBankBalance: async () => {
    const balance = await bankRepository.getBalance();
    set({ bankBalanceMinutes: balance });
  },
}));
