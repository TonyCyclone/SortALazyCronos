import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { ScheduledBlocksTable } from '../../../types';
import { formatDurationHuman } from '../../../core/schedule/timeUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  blocks: ScheduledBlocksTable[];
}

export const UnforeseenModal: React.FC<Props> = ({ isOpen, onClose, date, blocks }) => {
  const { addUnforeseen } = useScheduleStore();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [replacesBlockId, setReplacesBlockId] = useState<string>('');

  const selectedReplacedBlock = blocks.find((b) => b.id === replacesBlockId);
  const isReplacingFreeTime = selectedReplacedBlock?.activity_type === 'free_time' || selectedReplacedBlock?.is_locked_free_time === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addUnforeseen(
      date,
      title.trim(),
      startTime,
      endTime,
      replacesBlockId || undefined
    );

    setTitle('');
    setReplacesBlockId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Imprevisto em Dia Trancado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning leading-relaxed">
          ⚡ <strong>Mecânica de Imprevisto:</strong> Você está inserindo uma atividade de emergência em um dia já trancado.
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Descrição do Imprevisto
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião de emergência, Consulta médica, Conserto do carro"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-warning text-sm"
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
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-warning text-sm font-mono"
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
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-warning text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Substituir um Bloco Existente? (Opcional)
          </label>
          <select
            value={replacesBlockId}
            onChange={(e) => setReplacesBlockId(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-warning text-sm"
          >
            <option value="">Nenhum (alocar no horário acima)</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.start_time} - {b.end_time}: {b.title} ({formatDurationHuman(b.duration_minutes)})
              </option>
            ))}
          </select>
        </div>

        {selectedReplacedBlock && (
          <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-1">
            {isReplacingFreeTime ? (
              <div className="text-success flex items-center gap-1.5 font-medium">
                <span>🎁</span>
                <span>
                  Você está substituindo um bloco de <strong>Tempo Livre ({formatDurationHuman(selectedReplacedBlock.duration_minutes)})</strong>. Essas horas serão <strong>creditadas no seu Banco de Horas Livres</strong>!
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <span>🔄</span>
                <span>
                  A atividade &quot;{selectedReplacedBlock.title}&quot; voltará para sua aba original <strong>sem nenhum custo</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-warning hover:bg-warning/90 rounded-lg shadow-sm"
          >
            Registrar Imprevisto
          </button>
        </div>
      </form>
    </Modal>
  );
};
