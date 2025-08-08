"use client";

import { useState, useEffect } from "react";
import { use24HProgress } from "./use-24h-progress";

interface UseRealtimeReturnsProps {
  totalBalance: number;
  dailyReturnRate: number; // Taxa diária em %
}

interface UseRealtimeReturnsReturn {
  currentReturn: number;
  accumulatedReturn: number;
  secondlyReturn: number;
  minutelyReturn: number;
  hourlyReturn: number;
  projectedDailyReturn: number;
  projectedBalance: number;
  returnVelocity: number; // Retorno por segundo
  isGrowing: boolean;
}

export function useRealtimeReturns({
  totalBalance,
  dailyReturnRate,
}: UseRealtimeReturnsProps): UseRealtimeReturnsReturn {
  const [accumulatedReturn, setAccumulatedReturn] = useState(0);
  const { timeElapsed, progressPercentage } = use24HProgress();

  // Calcular retornos com alta precisão
  const dailyReturnAmount = totalBalance * (dailyReturnRate / 100);
  const secondlyReturn = dailyReturnAmount / (24 * 60 * 60); // Retorno por segundo
  const minutelyReturn = secondlyReturn * 60;
  const hourlyReturn = minutelyReturn * 60;

  // Retorno atual baseado no tempo decorrido
  const currentReturn = dailyReturnAmount * (progressPercentage / 100);
  
  // Velocidade de crescimento
  const returnVelocity = secondlyReturn;

  useEffect(() => {
    const updateAccumulated = () => {
      setAccumulatedReturn(currentReturn);
    };

    // Atualizar a cada 100ms para suavidade visual
    const interval = setInterval(updateAccumulated, 100);

    return () => clearInterval(interval);
  }, [currentReturn]);

  // Projeção do retorno diário completo
  const projectedDailyReturn = dailyReturnAmount;
  const projectedBalance = totalBalance + accumulatedReturn;

  return {
    currentReturn,
    accumulatedReturn,
    secondlyReturn,
    minutelyReturn,
    hourlyReturn,
    projectedDailyReturn,
    projectedBalance,
    returnVelocity,
    isGrowing: dailyReturnRate > 0,
  };
} 