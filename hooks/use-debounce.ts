import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook para debounce de valores, com suporte a cancelamento e atualização dinâmica do delay.
 * @param value - Valor a ser debouncado
 * @param delay - Delay em milissegundos
 * @returns [valor debouncado, função para cancelar debounce]
 */
export function useDebounce<T>(value: T, delay: number): [T, () => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    cancel();
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, delay);

    return cancel;
  }, [value, delay, cancel]);

  return [debouncedValue, cancel];
}