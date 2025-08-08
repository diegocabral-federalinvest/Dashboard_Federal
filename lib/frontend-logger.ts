"use client";

import logger from './logger';

/**
 * Frontend logging utilities for error tracking, performance monitoring,
 * and user action logging.
 */
class FrontendLogger {
  private initialized = false;

  /**
   * Initialize the frontend logger by setting up global error handlers
   * and performance monitoring
   */
  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    this.initialized = true;

    // Set up global error handler
    this.setupErrorHandling();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Log initialization
    logger.info('Frontend logger initialized', {
      context: 'frontend-logger',
      tags: ['init']
    });
  }

  /**
   * Set up global error handlers to catch unhandled errors and promise rejections
   */
  private setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      logger.error(`Unhandled error: ${event.message}`, {
        context: 'error-handler',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      logger.error(`Unhandled promise rejection`, {
        context: 'error-handler',
        data: {
          message: error?.message || String(error),
          stack: error?.stack,
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Set up performance monitoring using the Performance API
   */
  private setupPerformanceMonitoring() {
    if (!window.PerformanceObserver) return;

    // Log page load performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logger.debug('Page load performance', {
            context: 'performance',
            tags: ['page-load'],
            data: {
              url: window.location.href,
              // Time from navigation start to DOM content loaded
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
              // Time from navigation start to load event
              loadTime: navigation.loadEventEnd - navigation.startTime,
              // Time spent rendering the page
              renderTime: navigation.domComplete - navigation.domInteractive,
              // Network latency
              networkLatency: navigation.responseEnd - navigation.requestStart,
              // Time to first byte
              ttfb: navigation.responseStart - navigation.requestStart,
            }
          });
        }
      }, 0);
    });

    // Observer for long tasks (potential UI jank)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Only log long tasks over 200ms to reduce noise
          if (entry.duration > 200) {
            logger.warn('Long task detected', {
              context: 'performance',
              tags: ['long-task'],
              data: {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
                url: window.location.href
              }
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Some browsers may not support this observation
    }

    // Observer for resource loading performance - optimized to reduce noise
    try {
      let resourceWarningCount = 0;
      const maxWarningsPerSession = 5; // Limit warnings per session
      
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceTiming = entry as PerformanceResourceTiming;
          
          // Only log critical slow resources (>5s) and limit to prevent spam
          if (entry.duration > 5000 && resourceWarningCount < maxWarningsPerSession) {
            resourceWarningCount++;
            
            // Identify the type of resource for better debugging
            const resourceType = resourceTiming.initiatorType || 'unknown';
            const resourceSize = resourceTiming.transferSize || 0;
            
            logger.warn('Critical slow resource loading', {
              context: 'performance',
              tags: ['resource', resourceType],
              data: {
                name: entry.name,
                duration: Math.round(entry.duration),
                initiatorType: resourceType,
                size: resourceSize,
                url: window.location.href,
                sessionWarningCount: resourceWarningCount
              }
            });
          }
          
          // Log summary stats for all resources every 50 resources (less noise)
          if (performance.getEntriesByType('resource').length % 50 === 0) {
            const allResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const slowResources = allResources.filter(r => r.duration > 2000);
            
            if (slowResources.length > 0) {
              logger.debug('Resource loading summary', {
                context: 'performance',
                tags: ['resource-summary'],
                data: {
                  totalResources: allResources.length,
                  slowResources: slowResources.length,
                  slowestResource: Math.max(...slowResources.map(r => r.duration)),
                  averageLoadTime: allResources.reduce((sum, r) => sum + r.duration, 0) / allResources.length,
                  url: window.location.href
                }
              });
            }
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Some browsers may not support this observation
    }
  }

  /**
   * Log a page view event
   */
  logPageView(path: string) {
    logger.info(`Page view: ${path}`, {
      context: 'navigation',
      tags: ['page-view'],
      data: {
        path,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log a user action event
   */
  logUserAction(action: string, details: Record<string, any> = {}) {
    logger.info(`User action: ${action}`, {
      context: 'interaction',
      tags: ['user-action', action],
      data: {
        action,
        path: window.location.pathname,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log an API request error
   */
  logApiError(endpoint: string, error: any, details: Record<string, any> = {}) {
    logger.error(`API error: ${endpoint}`, {
      context: 'api',
      tags: ['api-error'],
      data: {
        endpoint,
        error: error instanceof Error ? 
          { message: error.message, stack: error.stack } : 
          String(error),
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log feature usage
   */
  logFeatureUsage(feature: string, details: Record<string, any> = {}) {
    logger.info(`Feature used: ${feature}`, {
      context: 'usage',
      tags: ['feature', feature],
      data: {
        feature,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Create singleton instance
const frontendLogger = new FrontendLogger();

export default frontendLogger; 