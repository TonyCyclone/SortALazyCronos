import { ScheduledBlocksTable, AllocationProposal } from '../../types';
import { timeToMinutes, minutesToTime } from './timeUtils';

export interface TimeGap {
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
}

export function findFreeGapsInDay(blocks: ScheduledBlocksTable[]): TimeGap[] {
  // Ordena os blocos por horário de início
  const sorted = [...blocks]
    .map((b) => ({
      ...b,
      startM: timeToMinutes(b.start_time),
      endM: timeToMinutes(b.end_time),
    }))
    .sort((a, b) => a.startM - b.startM);

  const gaps: TimeGap[] = [];
  let currentMinute = 0; // 00:00

  for (const block of sorted) {
    if (block.startM > currentMinute) {
      gaps.push({
        start: minutesToTime(currentMinute),
        end: minutesToTime(block.startM),
        startMinutes: currentMinute,
        endMinutes: block.startM,
        durationMinutes: block.startM - currentMinute,
      });
    }
    currentMinute = Math.max(currentMinute, block.endM);
  }

  // Gap final até as 24:00 (1440 min)
  if (currentMinute < 1440) {
    gaps.push({
      start: minutesToTime(currentMinute),
      end: minutesToTime(1440),
      startMinutes: currentMinute,
      endMinutes: 1440,
      durationMinutes: 1440 - currentMinute,
    });
  }

  return gaps.filter((g) => g.durationMinutes > 0);
}

export function analyzeFitForTargetSlot(
  activityDurationMinutes: number,
  targetSlot: TimeGap,
  defaultSliceMinutes?: number | null
): AllocationProposal {
  if (targetSlot.durationMinutes >= activityDurationMinutes) {
    return {
      fitType: 'direct',
      availableSlot: targetSlot,
      suggestedDuration: activityDurationMinutes,
    };
  }

  // Não cabe no espaço livre total:
  // 1. Proposta de fragmentação (metade do espaço livre ou fatia padrão)
  const fragmentSuggestion = defaultSliceMinutes && defaultSliceMinutes <= targetSlot.durationMinutes
    ? defaultSliceMinutes
    : Math.floor(targetSlot.durationMinutes / 2) || targetSlot.durationMinutes;

  return {
    fitType: 'fragment',
    availableSlot: targetSlot,
    suggestedDuration: fragmentSuggestion,
  };
}
