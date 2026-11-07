import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { ScheduledBlocksTable } from '../../../types';
import { calculateDuration, formatDurationHuman } from '../../../core/schedule/timeUtils';
import { useScheduleStore } from '../../../stores/useScheduleStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  block: ScheduledBlocksTable | null;
}

export const RoutinePracticeModal: React.FC<Props> = ({ isOpen, onClose, block }) => {
  const { updateRoutinePractice } = useScheduleStore();

  const [actualStart, setActualStart] = useState(block?.actual_start_time || block?.start_time || '08:00');
  const [actualEnd, setActualEnd] = useState(block?.actual_end_time || block?.end_time || '12:00');

  if (!block) return null;

  const plannedDuration = calculateDuration(block.start_time, block.end_time);
  const actualDuration = calculateDuration(actualStart, actualEnd);
  const diffMinutes = actualDuration - plannedDuration;

  const handleSave = async () => {
    await updateRoutinePractice(block.id, actualStart, actualEnd);
    onClose();
  };

  const handleReset = async () => {
    await updateRoutinePractice(block.id, block.start_time, block.end_time);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registro de Prática: ${block.title}`}>
      <div className="space-y-5">
        <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between text-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Horário Planejado</div>
            <div className="font-bold text-foreground">
              {block.start_time} às {block.end_time} ({formatDurationHuman(plannedDuration)})
            </div>
          </div>
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: block.color }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Prática Real (Início)
            </label>
            <input
              type="time"
              value={actualStart}
              onChange={(e) => setActualStart(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Prática Real (Fim)
            </label>
            <input
              type="time"
              value={actualEnd}
              onChange={(e) => setActualEnd(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
          </div>
        </div>

        {/* Efeito visual da divergência */}
        <div className="p-3.5 rounded-lg border text-sm transition-all flex items-center gap-3">
          {diffMinutes > 0 ? (
            <div className="flex items-center gap-2 text-danger">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              <span>
                <strong>Excedeu o planejado em +{formatDurationHuman(diffMinutes)}</strong> (efeito translúcido vermelho na timeline)
              </span>
            </div>
          ) : diffMinutes < 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
              <span>
                <strong>Não preencheu o planejado ({formatDurationHuman(diffMinutes)})</strong> (efeito acinzentado na timeline)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>Prática idêntica ao planejado! Perfeito.</span>
            </div>
          )}
        </div>

        <div className="pt-3 flex justify-between gap-2 border-t border-border">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Restaurar Planejado
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
            >
              Salvar Registro Real
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
