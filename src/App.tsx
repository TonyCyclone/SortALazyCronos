import React, { useEffect, useState } from 'react';
import { AppHeader } from './components/header/AppHeader';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { ActivitiesPanel } from './components/activities/ActivitiesPanel';
import { useScheduleStore } from './stores/useScheduleStore';
import { useActivitiesStore } from './stores/useActivitiesStore';

export const App: React.FC = () => {
  const { loadSchedule, isLoading: scheduleLoading } = useScheduleStore();
  const { loadAllActivities } = useActivitiesStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializa banco SQLite e carrega dados
    const init = async () => {
      try {
        await Promise.all([loadSchedule(), loadAllActivities()]);
      } catch (err: any) {
        console.error('Erro na inicialização da aplicação:', err);
        setInitError(err?.message || 'Falha ao inicializar o banco de dados local.');
      }
    };

    init();
  }, [loadSchedule, loadAllActivities]);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="max-w-md w-full p-6 bg-card border border-danger/30 rounded-2xl shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-foreground">Erro ao carregar o aplicativo</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {initError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Barra de Topo */}
      <AppHeader />

      {/* Grid Principal dos 7 Dias */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {scheduleLoading && (
          <div className="absolute inset-0 z-40 bg-background/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl shadow-lg text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span>Carregando cronograma...</span>
            </div>
          </div>
        )}
        <ScheduleGrid />
      </main>

      {/* Painel Inferior de Atividades */}
      <ActivitiesPanel />
    </div>
  );
};

export default App;
