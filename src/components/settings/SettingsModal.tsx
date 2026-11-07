import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useScheduleStore } from '../../stores/useScheduleStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { freeTimeLabel, setFreeTimeLabel, theme, toggleTheme } = useScheduleStore();
  const [label, setLabel] = useState(freeTimeLabel);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      await setFreeTimeLabel(label.trim());
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações do SortALazyCronos">
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Nome da Atividade de Tempo Livre
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Tempo Livre, Lazer, Descanso, Tempo Sagrado"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Nome atribuído automaticamente aos blocos vazios quando você tranca um dia ou semana.
          </span>
        </div>

        <div className="p-3.5 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Tema Visual</div>
            <div className="text-xs text-muted-foreground">Alternar entre Modo Escuro e Modo Claro</div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-2"
          >
            {theme === 'dark' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>
        </div>

        <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-1 text-xs">
          <div className="font-semibold text-foreground">💾 Armazenamento e Privacidade</div>
          <div className="text-muted-foreground leading-relaxed">
            Todos os seus dados são gravados localmente em um banco SQLite integrado. Nada é enviado para servidores externos.
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
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            Salvar Preferências
          </button>
        </div>
      </form>
    </Modal>
  );
};
