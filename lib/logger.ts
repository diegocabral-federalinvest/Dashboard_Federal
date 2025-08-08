// Advanced logging system for Federal Invest
// This provides structured logging with levels, colors, and formatters for both frontend and backend

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogOptions {
  context?: string;
  action?: string;
  tags?: string[];
  timestamp?: boolean;
  source?: 'frontend' | 'backend';
  data?: any;
  error?: Error;
  stack?: string;
}

const DEFAULT_OPTIONS: LogOptions = {
  context: 'app',
  timestamp: true,
  source: 'frontend',
  action: 'app',
  tags: [],
};

// Color codes for different log levels
const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  critical: '\x1b[35m', // Magenta
  reset: '\x1b[0m',  // Reset
  gray: '\x1b[90m',  // Gray
  bold: '\x1b[1m',   // Bold
  action: '\x1b[34m', // Blue
};

// Browser console CSS
const BROWSER_STYLES = {
  debug: 'color: #0ea5e9; font-weight: bold',
  info: 'color: #10b981; font-weight: bold',
  warn: 'color: #f59e0b; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  critical: 'color: #8b5cf6; font-weight: bold',
  timestamp: 'color: #6b7280',
  context: 'color: #3b82f6; font-weight: bold',
  tags: 'color: #8b5cf6; font-style: italic',
  source: 'color: #f97316; font-weight: bold',
  action: 'color: #3b82f6; font-weight: bold',
};

// Icons for different log levels in browser
const ICONS = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  critical: '🚨', 
  action: '🔄',
};

// Determine if we're in a browser or Node.js environment
const isBrowser = typeof window !== 'undefined';

/**
 * Format timestamp for logs
 */
const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString();
};

/**
 * Format data for console output
 */
const formatData = (data: any): string => {
  if (!data) return '';
  
  try {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  } catch (error) {
    return '[Unserializable data]';
  }
};

/**
 * Log to browser console with styles
 */
const logToBrowser = (
  level: LogLevel,
  message: string,
  options: LogOptions,
  data?: any
) => {
  const timestamp = options.timestamp ? formatTimestamp() : null;
  const icon = ICONS[level];
  const context = options.context ? `[${options.context}]` : '';
  const action = options.action ? `[${options.action}]` : '';
  const tags = options.tags && options.tags.length ? `tags: ${options.tags.join(', ')}` : '';
  const source = options.source?.toUpperCase();

  // Create formatted message for browser console
  console.group(`${icon} %c${level.toUpperCase()}%c ${message}`, BROWSER_STYLES[level], '');
  
  if (timestamp) {
    console.log(`%cTimestamp:%c ${timestamp}`, BROWSER_STYLES.timestamp, '');
  }
  
  if (context) {
    console.log(`%cContext:%c ${context}`, BROWSER_STYLES.context, '');
  }
  
  if (action) {
    console.log(`%cAction:%c ${action}`, BROWSER_STYLES.action, '');
  }
  
  if (source) {
    console.log(`%cSource:%c ${source}`, BROWSER_STYLES.source, '');
  }
  
  if (tags) {
    console.log(`%cTags:%c ${tags}`, BROWSER_STYLES.tags, '');
  }
  
  if (data) {
    console.log('Data:', data);
  }
  
  console.groupEnd();
};

/**
 * Log to Node.js console with colors
 */
const logToNode = (
  level: LogLevel,
  message: string,
  options: LogOptions,
  data?: any
) => {
  const timestamp = options.timestamp ? `${COLORS.gray}[${formatTimestamp()}]${COLORS.reset} ` : '';
  const context = options.context ? `${COLORS.bold}[${options.context}]${COLORS.reset} ` : '';
  const action = options.action ? `${COLORS.bold}[${options.action}]${COLORS.reset} ` : '';
  const tags = options.tags && options.tags.length ? `${COLORS.gray}[${options.tags.join(', ')}]${COLORS.reset} ` : '';
  const source = options.source ? `${COLORS.gray}[${options.source.toUpperCase()}]${COLORS.reset} ` : '';
  const levelColor = COLORS[level];
  
  const formattedData = data ? `\n${formatData(data)}` : '';
  
  // Print to terminal with colors
  console.log(
    `${timestamp}${source}${context}${action}${tags}${levelColor}${level.toUpperCase()}${COLORS.reset}: ${message}${formattedData}`
  );
};

/**
 * Main logger function that handles both browser and Node.js environments
 */
const log = (
  level: LogLevel,
  message: string,
  optionsOrContext?: LogOptions | string
) => {
  const options: LogOptions = 
    typeof optionsOrContext === 'string' 
      ? { ...DEFAULT_OPTIONS, context: optionsOrContext }
      : { ...DEFAULT_OPTIONS, ...optionsOrContext };

  if (isBrowser) {
    logToBrowser(level, message, options, options.data);
  } else {
    logToNode(level, message, options, options.data);
  }
};

// Helper functions for different log levels
const debug = (message: string, options?: LogOptions | string) => 
  log('debug', message, options);

const info = (message: string, options?: LogOptions | string) => 
  log('info', message, options);

const warn = (message: string, options?: LogOptions | string) => 
  log('warn', message, options);

const error = (message: string, options?: LogOptions | string) => 
  log('error', message, options);

const critical = (message: string, options?: LogOptions | string) => 
  log('critical', message, options);

// Create a shared logger instance that can be imported throughout the app
const logger = {
  debug,
  info,
  warn,
  error,
  critical,
  log
};

export default logger; 