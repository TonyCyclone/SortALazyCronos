import { RoutineEasyTable, ScheduledBlocksTable } from '../../types';
import { calculateDuration } from '../schedule/timeUtils';

export function isRoutineApplicableToDay(routine: RoutineEasyTable, dayOfWeek: number): boolean {
  if (!routine.is_active) return false;

  switch (routine.recurrence_pattern) {
    case 'daily':
      return true;
    case 'weekdays':
    case '5x2':
      // Segunda (1) a Sexta (5)
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'custom':
      try {
        const days: number[] = JSON.parse(routine.recurrence_days || '[]');
        return days.includes(dayOfWeek);
      } catch {
        return false;
      }
    default:
      return true;
  }
}

export function generateRoutineBlocksForDate(
  routines: RoutineEasyTable[],
  date: string,
  dayOfWeek: number
): Omit<ScheduledBlocksTable, 'created_at'>[] {
  const applicable = routines.filter((r) => isRoutineApplicableToDay(r, dayOfWeek));

  return applicable.map((routine) => {
    const duration = calculateDuration(routine.start_time_planned, routine.end_time_planned);

    return {
      id: crypto.randomUUID(),
      date,
      activity_type: 'routine_easy',
      activity_id: routine.id,
      title: routine.name,
      color: routine.color,
      start_time: routine.start_time_planned,
      end_time: routine.end_time_planned,
      duration_minutes: duration,
      actual_start_time: null,
      actual_end_time: null,
      status: 'planned',
      is_locked_free_time: 0,
    };
  });
}
