import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { ActivityType } from '../../../types';
import { minutesToTime, timeToMinutes, formatDurationHuman } from '../../../core/schedule/timeUtils';
import { TimeGap } from '../../../core/schedule/conflictDetector';

export interface AllocationTarget {
  activityId: string;
  activityType: ActivityType;
  title: string;
  color: string;
  totalDurationMinutes: number;
  defaultSliceMinutes: number | null;
  date: string;
  targetSlot?: TimeGap | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  target: AllocationTarget | null;
}

export const AllocationModal: React.FC<Props> = ({ isOpen, onClose, target }) => {
  const { addBlock } = useScheduleStore();

  const [allocationMode, setAllocationMode] = useState<'fit' | 'shrink' | 'fragment'>('fragment');
  const [sliceMinutes, setSliceMinutes] = useState<number>(target?.defaultSliceMinutes || 45);
  const [customStartTime, setCustomStartTime] = useState<string>(target?.targetSlot?.start || '14:00');

  if (!target) return null;

  const slotDuration = target.targetSlot ? target.targetSlot.durationMinutes : 120;
  const isBiggerThanSlot = target.totalDurationMinutes > slotDuration;

  const handleConfirm = async () => {
    let finalDuration = target.totalDurationMinutes;

    if (allocationMode === 'shrink') {
      finalDuration = slotDuration;
    } else if (allocationMode === 'fragment') {
      finalDuration = Math.min(sliceMinutes, target.totalDurationMinutes);
    }

    const startM = timeToMinutes(customStartTime);
    const endM = startM + finalDuration;
    const endTime = minutesToTime(endM);

    await addBlock({
      date: target.date,
      activity_type: target.activityType,
      activity_id: target.activityId,
      title: target.title,
      color: target.color,
      start_time: customStartTime,
      end_time: endTime,
      duration_minutes: finalDuration,
      actual_start_time: null,
      actual_end_time: null,
      status: 'planned',
      is_locked_free_time: 0,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alocar no Cronograma: ${target.title}`}>
      <div className="space-y-4">
        <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between text-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Duração da Atividade</div>
            <div className="font-bold text-foreground">{formatDurationHuman(target.totalDurationMinutes)}</div>
          </div>
          {target.targetSlot && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Espaço Disponível</div>
              <div className="font-bold text-foreground">
                {target.targetSlot.start} às {target.targetSlot.end} ({formatDurationHuman(slotDuration)})
              </div>
            </div>
          )}
        </div>

        {isBiggerThanSlot && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning leading-relaxed">
            ⚠️ A duração total ({formatDurationHuman(target.totalDurationMinutes)}) excede o tempo livre deste intervalo ({formatDurationHuman(slotDuration)}). Escolha como deseja alocar:
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Opções de Alocação
          </label>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setAllocationMode('fragment')}
              className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                allocationMode === 'fragment'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-muted/20 hover:bg-muted/40'
              }`}
            >
              <input type="radio" checked={allocationMode === 'fragment'} readOnly className="mt-1" />
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">Fragmentar em Fatia Menor</div>
                <div className="text-xs text-muted-foreground">
                  Aloca apenas uma parte ({formatDurationHuman(sliceMinutes)}) e mantém o restante na sua aba para outros dias.
                </div>
                {allocationMode === 'fragment' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tamanho da fatia:</span>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      max={target.totalDurationMinutes}
                      value={sliceMinutes}
                      onChange={(e) => setSliceMinutes(parseInt(e.target.value, 10) || 15)}
                      className="w-20 px-2 py-1 bg-card border border-border rounded text-xs text-foreground font-mono"
                    />
                    <span className="text-xs text-muted-foreground">minutos</span>
                  </div>
                )}
              </div>
            </button>

            {isBiggerThanSlot && (
              <button
                type="button"
                onClick={() => setAllocationMode('shrink')}
                className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  allocationMode === 'shrink'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <input type="radio" checked={allocationMode === 'shrink'} readOnly className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-foreground">Reduzir Automaticamente</div>
                  <div className="text-xs text-muted-foreground">
                    Ajusta a duração para caber exatamente no espaço ({formatDurationHuman(slotDuration)}).
                  </div>
                </div>
              </button>
            )}

            {!isBiggerThanSlot && (
              <button
                type="button"
                onClick={() => setAllocationMode('fit')}
                className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  allocationMode === 'fit'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <input type="radio" checked={allocationMode === 'fit'} readOnly className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-foreground">Alocar Duração Completa</div>
                  <div className="text-xs text-muted-foreground">
                    Encaixa os {formatDurationHuman(target.totalDurationMinutes)} completos neste dia.
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Horário de Início
            </label>
            <input
              type="time"
              value={customStartTime}
              onChange={(e) => setCustomStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Data de Destino
            </label>
            <input
              type="text"
              readOnly
              value={target.date}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-muted-foreground text-sm font-mono"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            Confirmar Alocação
          </button>
        </div>
      </div>
    </Modal>
  );
};
