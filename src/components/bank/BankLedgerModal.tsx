import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FreeHoursBankLedgerTable } from '../../types';
import { bankRepository } from '../../database/repositories/bankRepository';
import { evaluateBankState } from '../../core/bank/bankRules';
import { formatDurationHuman } from '../../core/schedule/timeUtils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalanceMinutes: number;
}

export const BankLedgerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentBalanceMinutes,
}) => {
  const [ledger, setLedger] = useState<FreeHoursBankLedgerTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bankState = evaluateBankState(currentBalanceMinutes);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      bankRepository.getLedger(40)
        .then(setLedger)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Banco de Horas Livres" maxWidth="lg">
      <div className="space-y-5">
        {/* Card do Saldo Atual */}
        <div
          className={`p-5 rounded-xl border text-center transition-all ${
            bankState.isNegative
              ? 'bg-danger/10 border-danger/30 text-danger'
              : 'bg-success/10 border-success/30 text-success'
          }`}
        >
          <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Saldo Atual de Comprometimento
          </div>
          <div className="text-4xl font-extrabold font-mono">
            {bankState.formattedBalance}
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">
            {bankState.isNegative
              ? 'Saldo negativo: Você deve horas de foco ao seu cronograma.'
              : 'Saldo positivo: Horas de lazer acumuladas com folga.'}
          </div>
        </div>

        {/* Notificação de Incentivo Ativo */}
        {bankState.recoveryIncentiveText && (
          <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary flex items-center gap-2.5">
            <span className="text-base">🚀</span>
            <span className="font-semibold">{bankState.recoveryIncentiveText}</span>
          </div>
        )}

        {/* Extrato de Transações */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Extrato de Movimentações Recentes
          </h4>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-muted-foreground">Carregando histórico...</div>
          ) : ledger.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-lg border border-border">
              Nenhuma movimentação registrada ainda.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {ledger.map((entry) => {
                const isPositive = entry.change_minutes > 0;
                let formattedDate = entry.timestamp;
                try {
                  formattedDate = format(parseISO(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
                } catch {
                  // Fallback
                }

                return (
                  <div
                    key={entry.id}
                    className="p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">{entry.reason}</div>
                      <div className="text-[11px] text-muted-foreground">{formattedDate}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          isPositive ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatDurationHuman(entry.change_minutes)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Saldo: {formatDurationHuman(entry.balance_after_minutes)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
