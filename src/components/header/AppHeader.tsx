import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { evaluateBankState } from '../../core/bank/bankRules';
import { BankLedgerModal } from '../bank/BankLedgerModal';
import { SettingsModal } from '../settings/SettingsModal';

export const AppHeader: React.FC = () => {
  const {
    daysTimeline,
    nextWeek,
    prevWeek,
    goToToday,
    bankBalanceMinutes,
    theme,
    toggleTheme,
  } = useScheduleStore();

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const bankState = evaluateBankState(bankBalanceMinutes);

  const firstDay = daysTimeline[0]?.formattedDate || '';
  const lastDay = daysTimeline[daysTimeline.length - 1]?.formattedDate || '';

  return (
    <header className="h-16 px-6 bg-card border-b border-border flex items-center justify-between shadow-sm select-none">
      {/* Logotipo e Identificação */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary/20">
          ⏳
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            SortALazyCronos
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              MVP
            </span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Comprometimento & Gestão de Tempo</p>
        </div>
      </div>

      {/* Navegação Semanal */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={prevWeek}
          className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground text-xs font-semibold transition-colors"
          title="Semana anterior"
        >
          ‹ Anterior
        </button>

        <button
          type="button"
          onClick={goToToday}
          className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-bold transition-colors"
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={nextWeek}
          className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground text-xs font-semibold transition-colors"
          title="Próxima semana"
        >
          Próxima ›
        </button>

        <span className="text-xs font-semibold text-muted-foreground ml-2">
          {firstDay} — {lastDay}
        </span>
      </div>

      {/* Widget do Banco de Horas e Controles */}
      <div className="flex items-center gap-3">
        {/* Botão do Banco de Horas */}
        <button
          type="button"
          onClick={() => setIsBankModalOpen(true)}
          className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
            bankState.isNegative
              ? 'bg-danger/10 border-danger/40 text-danger hover:bg-danger/20 ring-1 ring-danger/30'
              : 'bg-success/10 border-success/40 text-success hover:bg-success/20'
          }`}
          title="Clique para ver o extrato do Banco de Horas"
        >
          <span>🏦 Banco:</span>
          <span>{bankState.formattedBalance}</span>
          {bankState.alertLevel !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
          )}
        </button>

        {/* Tema Escuro / Claro */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
          title="Alternar tema claro/escuro"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {/* Configurações */}
        <button
          type="button"
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors text-sm"
          title="Configurações"
        >
          ⚙️
        </button>
      </div>

      {/* Modais Globais */}
      <BankLedgerModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        currentBalanceMinutes={bankBalanceMinutes}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </header>
  );
};
