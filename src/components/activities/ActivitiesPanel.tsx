import React, { useState } from 'react';
import { useActivitiesStore } from '../../stores/useActivitiesStore';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { formatDurationHuman } from '../../core/schedule/timeUtils';
import { CreateRoutineEasyModal } from './modals/CreateRoutineEasyModal';
import { CreateRoutineFlexibleModal } from './modals/CreateRoutineFlexibleModal';
import { CreateDeadlineModal } from './modals/CreateDeadlineModal';
import { CreateNoDeadlineModal } from './modals/CreateNoDeadlineModal';
import { AllocationModal, AllocationTarget } from '../schedule/modals/AllocationModal';
import { ActivityType } from '../../types';

export const ActivitiesPanel: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    routineEasy,
    routineFlexible,
    deadlineActivities,
    noDeadlineActivities,
    deleteRoutineEasy,
    deleteRoutineFlexible,
    deleteDeadlineActivity,
    deleteNoDeadlineActivity,
  } = useActivitiesStore();

  const { daysTimeline } = useScheduleStore();

  // Modals state
  const [isRoutineEasyModalOpen, setIsRoutineEasyModalOpen] = useState(false);
  const [isRoutineFlexModalOpen, setIsRoutineFlexModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isNoDeadlineModalOpen, setIsNoDeadlineModalOpen] = useState(false);

  // Allocation target
  const [allocationTarget, setAllocationTarget] = useState<AllocationTarget | null>(null);

  const handleOpenAllocate = (
    activityId: string,
    activityType: ActivityType,
    title: string,
    color: string,
    totalDurationMinutes: number,
    defaultSliceMinutes: number | null
  ) => {
    // Default to first unlocked day or today
    const targetDay = daysTimeline.find((d) => !d.isLocked) || daysTimeline[0];
    if (!targetDay) return;

    setAllocationTarget({
      activityId,
      activityType,
      title,
      color,
      totalDurationMinutes,
      defaultSliceMinutes,
      date: targetDay.date,
    });
  };

  return (
    <div className="bg-card text-card-foreground border-t border-border shadow-lg flex flex-col h-72">
      {/* Abas e botão de criação */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-muted/20">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('routine_easy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'routine_easy'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>⏰</span>
            <span>1. Rotineiras Fáceis ({routineEasy.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('routine_flexible')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'routine_flexible'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>🔄</span>
            <span>2. Rotineiras Sem Horário ({routineFlexible.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deadline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'deadline'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>🎯</span>
            <span>3. Com Prazo Fixo ({deadlineActivities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('no_deadline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'no_deadline'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>📋</span>
            <span>4. Sem Prazo ({noDeadlineActivities.length})</span>
          </button>
        </div>

        <div>
          {activeTab === 'routine_easy' && (
            <button
              type="button"
              onClick={() => setIsRoutineEasyModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>+</span> Nova Rotina Fácil
            </button>
          )}
          {activeTab === 'routine_flexible' && (
            <button
              type="button"
              onClick={() => setIsRoutineFlexModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>+</span> Nova Rotina Sem Horário
            </button>
          )}
          {activeTab === 'deadline' && (
            <button
              type="button"
              onClick={() => setIsDeadlineModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>+</span> Nova Atividade com Prazo
            </button>
          )}
          {activeTab === 'no_deadline' && (
            <button
              type="button"
              onClick={() => setIsNoDeadlineModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>+</span> Nova Atividade Sem Prazo
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo das abas com grid de cards */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Aba 1: Rotineiras Fáceis */}
        {activeTab === 'routine_easy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {routineEasy.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Nenhuma rotina fácil cadastrada. Cadastre hábitos diários ou de trabalho com horário fixo (ex: Dormir, Trabalho 08h-12h).
              </div>
            ) : (
              routineEasy.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border flex flex-col justify-between gap-2 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {item.start_time_planned} às {item.end_time_planned} ({item.recurrence_pattern})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                    <span className="text-success font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" /> Auto na agenda
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteRoutineEasy(item.id)}
                      className="text-muted-foreground hover:text-danger p-1 rounded"
                      title="Excluir rotina"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Aba 2: Rotineiras Sem Horário Fixo */}
        {activeTab === 'routine_flexible' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {routineFlexible.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Nenhuma rotina flexível cadastrada. Adicione tarefas periódicas como leitura diária ou limpeza semanal.
              </div>
            ) : (
              routineFlexible.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border flex flex-col justify-between gap-2 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {formatDurationHuman(item.estimated_duration_minutes)} • {item.periodicity}
                        {item.is_divisible ? ` (fatia ${item.default_slice_minutes || 30}m)` : ' (indivisível)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAllocate(
                          item.id,
                          'routine_flexible',
                          item.name,
                          item.color,
                          item.estimated_duration_minutes,
                          item.default_slice_minutes
                        )
                      }
                      className="px-2.5 py-1 bg-primary text-white rounded text-[11px] font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      + Alocar no Dia
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRoutineFlexible(item.id)}
                      className="text-muted-foreground hover:text-danger text-[11px] p-1 rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Aba 3: Com Prazo Fixo */}
        {activeTab === 'deadline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {deadlineActivities.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Nenhuma atividade com prazo cadastrada. Adicione tarefas importantes com limite de entrega.
              </div>
            ) : (
              deadlineActivities.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all hover:shadow-sm ${
                    item.deadline_origin === 'external'
                      ? 'bg-danger/5 border-danger/30'
                      : 'bg-warning/5 border-warning/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Prazo: {item.deadline_date} {item.deadline_time || ''} • {formatDurationHuman(item.estimated_duration_minutes)}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.deadline_origin === 'external'
                              ? 'bg-danger/20 text-danger'
                              : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {item.deadline_origin === 'external' ? '🔴 Pressão Externa' : '🟠 Vontade Própria'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAllocate(
                          item.id,
                          'deadline',
                          item.name,
                          item.color,
                          item.estimated_duration_minutes,
                          item.default_slice_minutes
                        )
                      }
                      className="px-2.5 py-1 bg-primary text-white rounded text-[11px] font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      + Alocar no Dia
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDeadlineActivity(item.id)}
                      className="text-muted-foreground hover:text-danger text-[11px] p-1 rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Aba 4: Sem Prazo */}
        {activeTab === 'no_deadline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {noDeadlineActivities.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Nenhuma atividade sem prazo cadastrada. Adicione projetos pessoais e tarefas pendentes sem data fixa.
              </div>
            ) : (
              noDeadlineActivities.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border flex flex-col justify-between gap-2 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Duração: {formatDurationHuman(item.estimated_duration_minutes)}
                        {item.is_divisible ? ` (fatia ${item.default_slice_minutes || 45}m)` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAllocate(
                          item.id,
                          'no_deadline',
                          item.name,
                          item.color,
                          item.estimated_duration_minutes,
                          item.default_slice_minutes
                        )
                      }
                      className="px-2.5 py-1 bg-primary text-white rounded text-[11px] font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      + Alocar no Dia
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNoDeadlineActivity(item.id)}
                      className="text-muted-foreground hover:text-danger text-[11px] p-1 rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals de Criação */}
      <CreateRoutineEasyModal
        isOpen={isRoutineEasyModalOpen}
        onClose={() => setIsRoutineEasyModalOpen(false)}
      />
      <CreateRoutineFlexibleModal
        isOpen={isRoutineFlexModalOpen}
        onClose={() => setIsRoutineFlexModalOpen(false)}
      />
      <CreateDeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
      />
      <CreateNoDeadlineModal
        isOpen={isNoDeadlineModalOpen}
        onClose={() => setIsNoDeadlineModalOpen(false)}
      />

      {/* Modal de Alocação com Fatiamento */}
      <AllocationModal
        isOpen={!!allocationTarget}
        onClose={() => setAllocationTarget(null)}
        target={allocationTarget}
      />
    </div>
  );
};
