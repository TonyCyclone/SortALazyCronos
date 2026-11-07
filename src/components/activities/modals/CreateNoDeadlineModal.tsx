import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useActivitiesStore } from '../../../stores/useActivitiesStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#8b5cf6', // Roxo
  '#f59e0b', // Âmbar
  '#06b6d4', // Ciano
  '#ec4899', // Rosa
];

export const CreateNoDeadlineModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createNoDeadlineActivity } = useActivitiesStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [isDivisible, setIsDivisible] = useState(true);
  const [defaultSliceMinutes, setDefaultSliceMinutes] = useState<number>(45);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createNoDeadlineActivity({
      name: name.trim(),
      color,
      estimated_duration_minutes: durationMinutes,
      default_slice_minutes: isDivisible ? defaultSliceMinutes : null,
      is_divisible: isDivisible ? 1 : 0,
      is_completed: 0,
    });

    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Atividade Sem Prazo">
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
            placeholder="Ex: Organizar fotos antigas, Aprender Rust, Pintar o quarto"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Duração Total Estimada (minutos)
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
            Salvar Atividade
          </button>
        </div>
      </form>
    </Modal>
  );
};
