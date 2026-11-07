import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { ScheduledBlocksTable } from '../../types';
import { formatDurationHuman, calculateDuration } from '../../core/schedule/timeUtils';
import { RoutinePracticeModal } from './modals/RoutinePracticeModal';
import { LockedDayRemovalModal } from './modals/LockedDayRemovalModal';
import { UnforeseenModal } from './modals/UnforeseenModal';

export const ScheduleGrid: React.FC = () => {
  const {
    daysTimeline,
    lockDay,
    unlockDay,
    deleteBlock,
    updateBlock,
    bankBalanceMinutes,
  } = useScheduleStore();

  // Modals state
  const [selectedPracticeBlock, setSelectedPracticeBlock] = useState<ScheduledBlocksTable | null>(null);
  const [lockedRemovalBlock, setLockedRemovalBlock] = useState<ScheduledBlocksTable | null>(null);
  const [unforeseenDate, setUnforeseenDate] = useState<{ date: string; blocks: ScheduledBlocksTable[] } | null>(null);

  const handleDeleteClick = (block: ScheduledBlocksTable, isDayLocked: boolean) => {
    if (isDayLocked) {
      // Se o dia está trancado e não for tempo livre, exige pagamento do banco de horas
      if (block.is_locked_free_time === 1 || block.activity_type === 'free_time') {
        deleteBlock(block.id, false);
      } else {
        setLockedRemovalBlock(block);
      }
    } else {
      deleteBlock(block.id, false);
    }
  };

  const handleToggleComplete = async (block: ScheduledBlocksTable) => {
    const nextStatus = block.status === 'completed' ? 'planned' : 'completed';
    await updateBlock(block.id, { status: nextStatus });
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 bg-background">
      <div className="min-w-[1050px] grid grid-cols-7 gap-3 h-full">
        {daysTimeline.map((day) => {
          return (
            <div
              key={day.date}
              className={`flex flex-col rounded-2xl border transition-all ${
                day.isLocked
                  ? 'bg-card/70 border-primary/30 shadow-sm'
                  : 'bg-card border-border'
              } ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {/* Cabeçalho do Dia */}
              <div
                className={`p-3 rounded-t-2xl border-b flex flex-col gap-2 ${
                  day.isLocked ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-foreground">{day.formattedDate}</span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-primary text-white uppercase tracking-wider">
                        Hoje
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      day.isLocked
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.isLocked ? '🔒 Trancado' : '🔓 Aberto'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {day.isLocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setUnforeseenDate({ date: day.date, blocks: day.blocks })}
                        className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30 transition-colors flex items-center justify-center gap-1"
                        title="Inserir imprevisto neste dia trancado"
                      >
                        <span>⚡</span> + Imprevisto
                      </button>
                      <button
                        type="button"
                        onClick={() => unlockDay(day.date)}
                        className="py-1 px-2 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Destrancar dia"
                      >
                        Destrancar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => lockDay(day.date)}
                      className="w-full py-1 px-2 rounded-lg text-[11px] font-bold bg-primary text-white hover:bg-primary/90 shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <span>🔒</span> Trancar Dia
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Blocos na Linha do Tempo */}
              <div className="p-2.5 flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-28rem)] min-h-[380px]">
                {day.blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-xs text-muted-foreground/60 border-2 border-dashed border-border/50 rounded-xl">
                    <span>Nenhuma atividade alocada</span>
                    <span className="text-[10px] mt-1">Arraste ou aloque atividades das abas abaixo</span>
                  </div>
                ) : (
                  day.blocks.map((block) => {
                    const isCompleted = block.status === 'completed';
                    const isFreeTime = block.is_locked_free_time === 1 || block.activity_type === 'free_time';
                    const isUnforeseen = block.activity_type === 'unforeseen';
                    const isRoutine = block.activity_type === 'routine_easy';

                    // Avaliação de divergência para rotinas fáceis
                    let divergenceClass = '';
                    let practiceDiff = 0;
                    if (isRoutine && block.actual_start_time && block.actual_end_time) {
                      const plannedDur = calculateDuration(block.start_time, block.end_time);
                      const actualDur = calculateDuration(block.actual_start_time, block.actual_end_time);
                      practiceDiff = actualDur - plannedDur;
                      if (practiceDiff > 0) divergenceClass = 'routine-exceeds';
                      else if (practiceDiff < 0) divergenceClass = 'routine-underrun';
                    }

                    return (
                      <div
                        key={block.id}
                        className={`p-2.5 rounded-xl border text-xs relative transition-all group ${
                          isFreeTime
                            ? 'bg-muted/20 border-dashed border-border text-muted-foreground'
                            : isUnforeseen
                            ? 'bg-warning/10 border-warning/40 shadow-sm'
                            : isCompleted
                            ? 'bg-muted/40 border-border opacity-70 line-through'
                            : 'bg-card hover:bg-muted/20 border-border shadow-sm'
                        } ${divergenceClass}`}
                        style={{
                          borderLeftColor: !isFreeTime ? block.color : undefined,
                          borderLeftWidth: !isFreeTime ? '4px' : undefined,
                        }}
                      >
                        {/* Header do Bloco: Horário e Ações */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">
                            {block.start_time} - {block.end_time} ({formatDurationHuman(block.duration_minutes)})
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isFreeTime && (
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(block)}
                                className={`p-1 rounded text-[10px] ${
                                  isCompleted ? 'text-success font-bold' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title={isCompleted ? 'Marcar como não concluído' : 'Marcar como concluído'}
                              >
                                {isCompleted ? '✓' : '○'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(block, day.isLocked)}
                              className="p-1 rounded text-muted-foreground hover:text-danger text-[11px]"
                              title={day.isLocked ? 'Remover (pago com banco de horas)' : 'Remover'}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Título do Bloco */}
                        <div className="font-bold text-foreground text-xs leading-snug flex items-center gap-1.5">
                          {isUnforeseen && <span>⚡</span>}
                          {isFreeTime && <span>☕</span>}
                          <span className="truncate">{block.title}</span>
                        </div>

                        {/* Se for rotina fácil: detalhes de prática real vs planejada */}
                        {isRoutine && (
                          <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
                            {block.actual_start_time && block.actual_end_time ? (
                              <div className="font-mono text-muted-foreground">
                                Real: <span className="font-bold text-foreground">{block.actual_start_time}-{block.actual_end_time}</span>
                                {practiceDiff !== 0 && (
                                  <span className={`ml-1 font-bold ${practiceDiff > 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                                    ({practiceDiff > 0 ? `+${practiceDiff}m` : `${practiceDiff}m`})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/80 italic">Planejado</span>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedPracticeBlock(block)}
                              className="text-primary hover:underline font-semibold text-[10px]"
                            >
                              {block.actual_start_time ? 'Editar Prática' : 'Registrar Prática'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modais de Ações do Cronograma */}
      <RoutinePracticeModal
        isOpen={!!selectedPracticeBlock}
        onClose={() => setSelectedPracticeBlock(null)}
        block={selectedPracticeBlock}
      />

      <LockedDayRemovalModal
        isOpen={!!lockedRemovalBlock}
        onClose={() => setLockedRemovalBlock(null)}
        onConfirm={() => {
          if (lockedRemovalBlock) {
            deleteBlock(lockedRemovalBlock.id, true);
          }
        }}
        block={lockedRemovalBlock}
        currentBankBalanceMinutes={bankBalanceMinutes}
      />

      {unforeseenDate && (
        <UnforeseenModal
          isOpen={!!unforeseenDate}
          onClose={() => setUnforeseenDate(null)}
          date={unforeseenDate.date}
          blocks={unforeseenDate.blocks}
        />
      )}
    </div>
  );
};
