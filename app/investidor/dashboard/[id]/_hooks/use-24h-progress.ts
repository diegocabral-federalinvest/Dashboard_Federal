"use client";

import { useState, useEffect } from "react";

interface Use24HProgressReturn {
  currentHour: number;
  currentMinute: number;
  currentSecond: number;
  progressPercentage: number;
  timeElapsed: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  formattedTime: string;
  isBusinessHours: boolean;
}

export function use24HProgress(): Use24HProgressReturn {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Atualizar a cada segundo para máxima precisão
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentSecond = currentTime.getSeconds();

  // Calcular progresso total do dia (0-100%)
  const totalSecondsInDay = 24 * 60 * 60;
  const currentTotalSeconds = (currentHour * 60 * 60) + (currentMinute * 60) + currentSecond;
  const progressPercentage = (currentTotalSeconds / totalSecondsInDay) * 100;

  // Formatação do tempo
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Verificar se está em horário comercial (9h-18h)
  const isBusinessHours = currentHour >= 9 && currentHour < 18;

  return {
    currentHour,
    currentMinute,
    currentSecond,
    progressPercentage,
    timeElapsed: {
      hours: currentHour,
      minutes: currentMinute,
      seconds: currentSecond,
      totalSeconds: currentTotalSeconds,
    },
    formattedTime,
    isBusinessHours,
  };
} 