import { Period } from "@/features/finance/types";

/**
 * Returns a formatted title for the DRE based on the period
 */
export const getTitleByPeriod = (period: Period): string => {
  if (period.periodType === "monthly" && period.month) {
    return `Demonstração do Resultado do Exercício - ${period.month}/${period.year}`;
  } else if (period.periodType === "quarterly" && period.quarter) {
    return `Demonstração do Resultado do Exercício - ${period.quarter}º Trimestre/${period.year}`;
  } else {
    return `Demonstração do Resultado do Exercício - ${period.year}`;
  }
};

/**
 * Returns a formatted text description of the period
 */
export const periodText = (period: Period): string => {
  if (period.periodType === "monthly" && period.month) {
    return `mês ${period.month}/${period.year}`;
  } else if (period.periodType === "quarterly" && period.quarter) {
    return `${period.quarter}º trimestre de ${period.year}`;
  } else {
    return `ano ${period.year}`;
  }
}; 