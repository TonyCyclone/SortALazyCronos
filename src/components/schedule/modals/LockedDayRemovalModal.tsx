import React from 'react';
import { Modal } from '../../ui/Modal';
import { ScheduledBlocksTable } from '../../../types';
import { formatDurationHuman } from '../../../core/schedule/timeUtils';
import { shouldShowExtraConfirmationForNegative } from '../../../core/bank/bankRules';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  block: ScheduledBlocksTable | null;
  currentBankBalanceMinutes: number;
}

export const LockedDayRemovalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  block,
  currentBankBalanceMinutes,
}) => {
  if (!block) return null;

  const costMinutes = block.duration_minutes;
  const resultingBalance = currentBankBalanceMinutes - costMinutes;
  const requiresExtraWarning = shouldShowExtraConfirmationForNegative(currentBankBalanceMinutes, costMinutes);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprometimento: Dia Trancado">
      <div className="space-y-4">
        <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-lg text-xs text-danger leading-relaxed">
          🔒 <strong>Este dia já foi planejado e trancado!</strong><br />
          Para remover esta atividade (&quot;{block.title}&quot;), é necessário pagar o compromisso utilizando horas do seu <strong>Banco de Horas Livres</strong>.
        </div>

        <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Saldo Atual do Banco:</span>
            <span className={`font-mono font-bold ${currentBankBalanceMinutes >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatDurationHuman(currentBankBalanceMinutes)}
            </span>
          </div>

          <div className="flex justify-between items-center text-danger">
            <span>Custo da Remoção:</span>
            <span className="font-mono font-bold">-{formatDurationHuman(costMinutes)}</span>
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-center">
            <span className="font-semibold text-foreground">Saldo Resultante:</span>
            <span className={`font-mono font-bold text-base ${resultingBalance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatDurationHuman(resultingBalance)}
            </span>
          </div>
        </div>

        {requiresExtraWarning && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning leading-relaxed">
            ⚠️ <strong>Aviso de Saldo Negativo:</strong> Seu saldo ultrapassará mais uma faixa negativa de 4 horas. Você precisará de dias com 100% de conclusão para recuperar seu banco.
          </div>
        )}

        <div className="pt-3 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Manter Atividade
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger/90 rounded-lg shadow-sm"
          >
            Pagar com Banco e Remover
          </button>
        </div>
      </div>
    </Modal>
  );
};
