interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutos
    blockDurationMs: number = 15 * 60 * 1000 // 15 minutos de bloqueio
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  /**
   * Verifica se um IP pode fazer uma tentativa de login
   */
  canAttempt(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      return { allowed: true };
    }

    // Se passou do tempo de reset, limpar entrada
    if (now > entry.resetTime) {
      this.attempts.delete(identifier);
      return { allowed: true };
    }

    // Se excedeu o limite, bloquear
    if (entry.count >= this.maxAttempts) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Registra uma tentativa de login (falhada)
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Primeira tentativa ou tempo expirado
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        lastAttempt: now
      });
    } else {
      // Incrementar tentativa existente
      entry.count++;
      entry.lastAttempt = now;
      
      // Se excedeu o limite, estender o bloqueio
      if (entry.count >= this.maxAttempts) {
        entry.resetTime = now + this.blockDurationMs;
      }
    }
  }

  /**
   * Remove tentativas para um identificador (após login bem-sucedido)
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Limpa entradas expiradas (manutenção)
   */
  cleanup(): void {
    const now = Date.now();
    this.attempts.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    });
  }

  /**
   * Obtém estatísticas de um identificador
   */
  getStats(identifier: string) {
    const entry = this.attempts.get(identifier);
    if (!entry) {
      return { attempts: 0, blocked: false, resetTime: null };
    }

    const now = Date.now();
    const isBlocked = entry.count >= this.maxAttempts && now < entry.resetTime;
    
    return {
      attempts: entry.count,
      blocked: isBlocked,
      resetTime: entry.resetTime,
      retryAfter: isBlocked ? Math.ceil((entry.resetTime - now) / 1000) : 0
    };
  }
}

// Instância global do rate limiter para login
export const loginRateLimiter = new RateLimiter(
  5,  // máximo 5 tentativas
  15 * 60 * 1000,  // janela de 15 minutos
  30 * 60 * 1000   // bloqueio de 30 minutos após exceder limite
);

// Utilitário para obter identificador único baseado no IP e user agent
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Criar hash simples baseado no IP e user agent
  return `${ip}-${userAgent.slice(0, 50)}`;
}

// Cleanup automático a cada 30 minutos
setInterval(() => {
  loginRateLimiter.cleanup();
}, 30 * 60 * 1000);

export default RateLimiter; 