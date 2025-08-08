import { Next } from 'hono';
import { Context } from 'hono';
import logger from './logger';

// Get a unique request ID - useful for tracing requests through the system
const getRequestId = () => {
  return crypto.randomUUID();
};

// Middleware to log API requests and responses
export const apiLoggerMiddleware = async (c: Context, next: Next) => {
  // Generate request ID
  const requestId = getRequestId();
  
  // Get request details
  const method = c.req.method;
  const url = c.req.url;
  const path = new URL(url).pathname;
  const startTime = Date.now();
  
  // Log the request
  logger.info(`API Request: ${method} ${path}`, {
    source: 'backend',
    context: 'api',
    tags: ['request', method.toLowerCase()],
    data: {
      requestId,
      method,
      url,
      headers: Object.fromEntries(
        // Remove sensitive headers like authorization
        Array.from(c.req.raw.headers.entries()).filter(
          ([key]) => !['authorization', 'cookie'].includes(key.toLowerCase())
        )
      )
    }
  });

  try {
    // Handle the request
    await next();

    // Calculate duration
    const duration = Date.now() - startTime;
    const status = c.res.status;
    
    // Clone the response to get the body
    const originalResponse = c.res.clone();
    let responseBody = '';
    
    try {
      // Only try to read JSON responses
      const contentType = c.res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseText = await originalResponse.text();
        if (responseText) {
          // Try to parse as JSON, but don't fail if it's not valid JSON
          try {
            responseBody = JSON.parse(responseText);
          } catch (e) {
            responseBody = responseText.length > 500 
              ? responseText.substring(0, 497) + '...' 
              : responseText;
          }
        }
      }
    } catch (error) {
      // Ignore errors reading response body
      responseBody = '[Could not read response body]';
    }

    // Log the response
    const logLevel = status >= 400 ? 'error' : 'info';
    logger[logLevel](`API Response: ${method} ${path} - ${status} (${duration}ms)`, {
      source: 'backend',
      context: 'api',
      tags: ['response', method.toLowerCase(), `status-${status}`],
      data: {
        requestId,
        status,
        duration,
        headers: Object.fromEntries(Array.from(c.res.headers.entries())),
        body: responseBody
      }
    });

  } catch (error) {
    // Log errors
    const duration = Date.now() - startTime;
    
    logger.error(`API Error: ${method} ${path} (${duration}ms)`, {
      source: 'backend',
      context: 'api',
      tags: ['error', method.toLowerCase()],
      data: {
        requestId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        duration
      }
    });
    
    // Continue throwing the error to be handled by error handlers
    throw error;
  }
};

export default apiLoggerMiddleware;