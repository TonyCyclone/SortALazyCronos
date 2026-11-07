export interface BankStateInfo {
  balanceMinutes: number;
  formattedBalance: string;
  isNegative: boolean;
  alertLevel: 'none' | 'moderate_negative' | 'critical_negative';
  recoveryIncentiveText: string | null;
}

export function evaluateBankState(balanceMinutes: number): BankStateInfo {
  const isNegative = balanceMinutes < 0;
  const absMinutes = Math.abs(balanceMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const formattedBalance = `${isNegative ? '-' : '+'}${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();

  let alertLevel: 'none' | 'moderate_negative' | 'critical_negative' = 'none';
  let recoveryIncentiveText: string | null = null;

  if (balanceMinutes <= -600) {
    // Menos que -10 horas
    alertLevel = 'critical_negative';
    recoveryIncentiveText = 'Incentivo ativo: Conclua todas as tarefas de hoje para recuperar +1h no banco!';
  } else if (balanceMinutes <= -240) {
    // Menos que -4 horas
    alertLevel = 'moderate_negative';
    recoveryIncentiveText = 'Incentivo ativo: Conclua todas as tarefas de hoje para recuperar +30min no banco!';
  }

  return {
    balanceMinutes,
    formattedBalance,
    isNegative,
    alertLevel,
    recoveryIncentiveText,
  };
}

export function shouldShowExtraConfirmationForNegative(currentBalanceMinutes: number, deductionMinutes: number): boolean {
  const resultingBalance = currentBalanceMinutes - deductionMinutes;
  if (resultingBalance >= 0) return false;

  // Verifica se cruzou um múltiplo de 4h (240 min) no negativo
  const currentStep = Math.floor(Math.abs(Math.min(0, currentBalanceMinutes)) / 240);
  const nextStep = Math.floor(Math.abs(resultingBalance) / 240);

  return nextStep > currentStep;
}
