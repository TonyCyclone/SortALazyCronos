export const INITIAL_SCHEMA_SQL = `
-- Tabela de Atividades Rotineiras Fáceis (Horário fixo recorrente)
CREATE TABLE IF NOT EXISTS routine_easy_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  start_time_planned TEXT NOT NULL,
  end_time_planned TEXT NOT NULL,
  recurrence_pattern TEXT NOT NULL,
  recurrence_days TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Tabela de Atividades Rotineiras Sem Horário Fixo
CREATE TABLE IF NOT EXISTS routine_flexible_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  periodicity TEXT NOT NULL,
  is_divisible INTEGER NOT NULL DEFAULT 1,
  default_slice_minutes INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Tabela de Atividades com Prazo Fixo
CREATE TABLE IF NOT EXISTS deadline_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  deadline_date TEXT NOT NULL,
  deadline_time TEXT,
  deadline_origin TEXT NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  default_slice_minutes INTEGER,
  is_divisible INTEGER NOT NULL DEFAULT 1,
  alert_advance_days INTEGER NOT NULL DEFAULT 2,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Tabela de Atividades Sem Prazo
CREATE TABLE IF NOT EXISTS no_deadline_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  default_slice_minutes INTEGER,
  is_divisible INTEGER NOT NULL DEFAULT 1,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Tabela de Dias do Cronograma
CREATE TABLE IF NOT EXISTS days_schedule (
  date TEXT PRIMARY KEY,
  is_locked INTEGER NOT NULL DEFAULT 0,
  locked_at TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending'
);

-- Tabela de Blocos Agendados na Linha do Tempo
CREATE TABLE IF NOT EXISTS scheduled_blocks (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_id TEXT,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  actual_start_time TEXT,
  actual_end_time TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  is_locked_free_time INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Tabela de Extrato do Banco de Horas Livres
CREATE TABLE IF NOT EXISTS free_hours_bank_ledger (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  change_minutes INTEGER NOT NULL,
  balance_after_minutes INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_block_id TEXT
);

-- Tabela de Configurações do App
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
