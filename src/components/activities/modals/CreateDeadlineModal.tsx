import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useActivitiesStore } from '../../../stores/useActivitiesStore';
import { DeadlineOrigin } from '../../../types';
import { format, addDays } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDeadlineModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createDeadlineActivity } = useActivitiesStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#ef4444');
  const [deadlineDate, setDeadlineDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [deadlineOrigin, setDeadlineOrigin] = useState<DeadlineOrigin>('external');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [isDivisible, setIsDivisible] = useState(true);
  const [defaultSliceMinutes, setDefaultSliceMinutes] = useState<number>(60);
  const [alertAdvanceDays, setAlertAdvanceDays] = useState(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createDeadlineActivity({
      name: name.trim(),
      color,
      deadline_date: deadlineDate,
      deadline_time: deadlineTime || null,
      deadline_origin: deadlineOrigin,
      estimated_duration_minutes: durationMinutes,
      default_slice_minutes: isDivisible ? defaultSliceMinutes : null,
      is_divisible: isDivisible ? 1 : 0,
      alert_advance_days: alertAdvanceDays,
      is_completed: 0,
    });

    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Atividade com Prazo Fixo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Nome da Atividade
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Entregar relatório trimestral, Pagar IPVA"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Origem do Prazo (Define a cor do alerta)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDeadlineOrigin('external');
                setColor('#ef4444');
              }}
              className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                deadlineOrigin === 'external'
                  ? 'border-danger bg-danger/10 text-danger ring-1 ring-danger'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-danger mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-foreground">Necessidade Externa</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Alerta Vermelho (pressão externa inadiável)
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeadlineOrigin('self_imposed');
                setColor('#f97316');
              }}
              className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                deadlineOrigin === 'self_imposed'
                  ? 'border-warning bg-warning/10 text-warning ring-1 ring-warning'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-warning mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-foreground">Vontade Própria</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Alerta Laranja (meta pessoal autodefinida)
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Data Limite
            </label>
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Hora Limite
            </label>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Duração Total Estimada (min)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Alerta de Antecedência (dias)
            </label>
            <input
              type="number"
              min="0"
              value={alertAdvanceDays}
              onChange={(e) => setAlertAdvanceDays(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Divisível em blocos menores?</span>
            <input
              type="checkbox"
              checked={isDivisible}
              onChange={(e) => setIsDivisible(e.target.checked)}
              className="w-4 h-4 text-primary rounded cursor-pointer"
            />
          </div>

          {isDivisible && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Fatia Padrão ao Arrastar (minutos)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={defaultSliceMinutes}
                onChange={(e) => setDefaultSliceMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            Salvar Atividade com Prazo
          </button>
        </div>
      </form>
    </Modal>
  );
};
