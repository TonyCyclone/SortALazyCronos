import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end < start) {
    // Caso cruze a meia-noite (ex: 22:00 até 06:00 -> 8h = 480m)
    return 24 * 60 - start + end;
  }
  return end - start;
}

export function formatDurationHuman(minutes: number): string {
  const isNegative = minutes < 0;
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;

  const prefix = isNegative ? '-' : '';
  if (h === 0) return `${prefix}${m}min`;
  if (m === 0) return `${prefix}${h}h`;
  return `${prefix}${h}h ${m}m`;
}

export function get7DaysStartingFrom(startDate: Date = new Date()): { dateStr: string; dateObj: Date; formattedDay: string; isToday: boolean; dayOfWeek: number }[] {
  const today = startOfDay(new Date());
  const start = startOfDay(startDate);

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayName = format(d, 'EEE', { locale: ptBR });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', '');
    const formattedDay = `${format(d, 'dd/MM')} (${capitalizedDay})`;

    return {
      dateStr,
      dateObj: d,
      formattedDay,
      isToday: isSameDay(d, today),
      dayOfWeek: d.getDay(),
    };
  });
}

export function getTodayDateStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
