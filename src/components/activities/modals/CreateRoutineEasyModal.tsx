import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useActivitiesStore } from '../../../stores/useActivitiesStore';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { RecurrencePattern } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Esmeralda
  '#8b5cf6', // Roxo
  '#f59e0b', // Âmbar
  '#ef4444', // Vermelho
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#64748b', // Slate
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' },
];

export const CreateRoutineEasyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createRoutineEasy } = useActivitiesStore();
  const { loadSchedule } = useScheduleStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('5x2');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (dayId: number) => {
    if (customDays.includes(dayId)) {
      setCustomDays(customDays.filter((d) => d !== dayId));
    } else {
      setCustomDays([...customDays, dayId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createRoutineEasy({
      name: name.trim(),
      color,
      start_time_planned: startTime,
      end_time_planned: endTime,
      recurrence_pattern: recurrencePattern,
      recurrence_days: JSON.stringify(customDays),
      is_active: 1,
    });

    // Recarrega o cronograma para que a rotina apareça automaticamente nos dias aplicáveis
    await loadSchedule();

    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Atividade Rotineira Fácil">
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
            placeholder="Ex: Trabalho (Turno Manhã), Dormir, Academia"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Horário Início
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Horário Fim
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Padrão de Recorrência
          </label>
          <select
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="5x2">Escala 5x2 (Segunda a Sexta)</option>
            <option value="daily">Todos os Dias (Diário)</option>
            <option value="custom">Dias Específicos da Semana</option>
          </select>
        </div>

        {recurrencePattern === 'custom' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Selecione os Dias
            </label>
            <div className="flex gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = customDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Cor de Identificação
          </label>
          <div className="flex gap-2 items-center">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-foreground' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
              title="Cor customizada"
            />
          </div>
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
            Salvar Rotina Fácil
          </button>
        </div>
      </form>
    </Modal>
  );
};
