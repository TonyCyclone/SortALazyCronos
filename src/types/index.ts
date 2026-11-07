// Tipos centrais do domínio e schema do banco de dados

export type ActivityType =
  | 'routine_easy'
  | 'routine_flexible'
  | 'deadline'
  | 'no_deadline'
  | 'free_time'
  | 'unforeseen';

export type RecurrencePattern = 'daily' | 'weekdays' | '5x2' | 'custom';
export type Periodicity = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type DeadlineOrigin = 'external' | 'self_imposed'; // 'external' = vermelho, 'self_imposed' = laranja

export type BlockStatus =
  | 'planned'
  | 'completed'
  | 'completed_created_new'
  | 'uncompleted_rescheduled'
  | 'uncompleted_lost'
  | 'paid_with_bank';

// Entidades de Banco de Dados (compatíveis com Kysely)

export interface RoutineEasyTable {
  id: string;
  name: string;
  color: string;
  start_time_planned: string; // "HH:MM"
  end_time_planned: string;   // "HH:MM"
  recurrence_pattern: RecurrencePattern;
  recurrence_days: string;    // JSON array: "[0,1,2,3,4,5,6]" onde 0=domingo
  is_active: number;          // 0 ou 1
  created_at: string;
}

export interface RoutineFlexibleTable {
  id: string;
  name: string;
  color: string;
  estimated_duration_minutes: number;
  periodicity: Periodicity;
  is_divisible: number;        // 0 ou 1
  default_slice_minutes: number | null;
  is_active: number;
  created_at: string;
}

export interface DeadlineActivityTable {
  id: string;
  name: string;
  color: string;
  deadline_date: string;       // "YYYY-MM-DD"
  deadline_time: string | null;// "HH:MM"
  deadline_origin: DeadlineOrigin;
  estimated_duration_minutes: number;
  default_slice_minutes: number | null;
  is_divisible: number;
  alert_advance_days: number;
  is_completed: number;
  created_at: string;
}

export interface NoDeadlineActivityTable {
  id: string;
  name: string;
  color: string;
  estimated_duration_minutes: number;
  default_slice_minutes: number | null;
  is_divisible: number;
  is_completed: number;
  created_at: string;
}

export interface DaysScheduleTable {
  date: string;                // "YYYY-MM-DD" PRIMARY KEY
  is_locked: number;          // 0 ou 1
  locked_at: string | null;
  review_status: string;      // 'pending' | 'reviewed'
}

export interface ScheduledBlocksTable {
  id: string;
  date: string;               // "YYYY-MM-DD"
  activity_type: ActivityType;
  activity_id: string | null;
  title: string;
  color: string;
  start_time: string;         // "HH:MM"
  end_time: string;           // "HH:MM"
  duration_minutes: number;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: BlockStatus;
  is_locked_free_time: number;
  created_at: string;
}

export interface FreeHoursBankLedgerTable {
  id: string;
  timestamp: string;
  change_minutes: number;     // positivo ou negativo
  balance_after_minutes: number;
  reason: string;
  related_block_id: string | null;
}

export interface AppSettingsTable {
  key: string;
  value: string;
}

// Database Schema completo para o Kysely
export interface Database {
  routine_easy_activities: RoutineEasyTable;
  routine_flexible_activities: RoutineFlexibleTable;
  deadline_activities: DeadlineActivityTable;
  no_deadline_activities: NoDeadlineActivityTable;
  days_schedule: DaysScheduleTable;
  scheduled_blocks: ScheduledBlocksTable;
  free_hours_bank_ledger: FreeHoursBankLedgerTable;
  app_settings: AppSettingsTable;
}

// Tipos de UI / DTOs auxiliares
export interface DayTimeline {
  date: string;               // "YYYY-MM-DD"
  dayOfWeek: number;          // 0 = Domingo ... 6 = Sábado
  formattedDate: string;      // "13/08 (Qui)"
  isToday: boolean;
  isLocked: boolean;
  lockedAt: string | null;
  reviewStatus: string;
  blocks: ScheduledBlocksTable[];
}

export interface AllocationProposal {
  fitType: 'direct' | 'shrink' | 'fragment' | 'reorganize';
  availableSlot: { start: string; end: string; durationMinutes: number } | null;
  suggestedDuration: number;
}
