import logger from './logger';

type ApiLoggerOptions = {
  source?: 'frontend' | 'backend';
  context?: string;
  tags?: string[];
  data?: Record<string, any>;
};

/**
 * API Logger utility for consistent logging patterns across API routes
 */
export class ApiLogger {
  private requestId: string;
  private baseContext: string;
  private baseTags: string[];

  /**
   * Create a new API logger instance for a request
   * @param endpoint The API endpoint path or name
   * @param requestId Optional request ID (will generate UUID if not provided)
   */
  constructor(endpoint: string, requestId?: string) {
    this.requestId = requestId || crypto.randomUUID();
    this.baseContext = `api:${endpoint}`;
    this.baseTags = ['api'];
  }

  /**
   * Get the request ID
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Log a request start event
   */
  logRequest(method: string, url: string, options?: ApiLoggerOptions) {
    logger.info(`API Request: ${method} ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'request', method.toLowerCase(), ...this.baseTags],
      data: {
        requestId: this.requestId,
        url,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log authentication failure
   */
  logUnauthorized(options?: ApiLoggerOptions) {
    logger.warn(`Unauthorized access attempt to ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'auth', 'unauthorized', ...this.baseTags],
      data: {
        requestId: this.requestId,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log query parameters
   */
  logQueryParams(params: Record<string, any>, options?: ApiLoggerOptions) {
    logger.debug(`Query parameters for ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'query', 'parameters', ...this.baseTags],
      data: {
        requestId: this.requestId,
        params,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log database query
   */
  logQuery(queryType: string, options?: ApiLoggerOptions) {
    logger.debug(`Executing ${queryType} query for ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'query', queryType, ...this.baseTags],
      data: {
        requestId: this.requestId,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log successful operation
   */
  logSuccess(message: string, options?: ApiLoggerOptions) {
    logger.info(message, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'success', ...this.baseTags],
      data: {
        requestId: this.requestId,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log validation error
   */
  logValidationError(validationErrors: any, options?: ApiLoggerOptions) {
    logger.warn(`Validation error in ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'error', 'validation', ...this.baseTags],
      data: {
        requestId: this.requestId,
        validationErrors,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log error
   */
  logError(error: unknown, options?: ApiLoggerOptions) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    logger.error(`Error in ${this.baseContext}`, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'error', ...this.baseTags],
      data: {
        requestId: this.requestId,
        error: errorMessage,
        stack,
        ...(options?.data || {})
      }
    });
  }

  /**
   * Log debug information
   */
  logDebug(message: string, options?: ApiLoggerOptions) {
    logger.debug(message, {
      source: options?.source || 'backend',
      context: options?.context || this.baseContext,
      tags: [...(options?.tags || []), 'debug', ...this.baseTags],
      data: {
        requestId: this.requestId,
        ...(options?.data || {})
      }
    });
  }
}

export default ApiLogger; 