"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp, AlertCircle, Info, Bug, AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import logger from "@/lib/logger";

type LogEntry = {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  timestamp: string;
  source: 'frontend' | 'backend';
  context?: string;
  tags?: string[];
  data?: any;
};

// Create a safe UUID generator for environments where crypto might not be available
const safeRandomId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
};

// Event bus for logs
class LogEventBus {
  private static listeners: Array<(log: LogEntry) => void> = [];
  private static logs: LogEntry[] = [];
  private static maxLogs: number = 100;

  static addLog(log: LogEntry): void {
    try {
      // Add log to array, keeping only the last maxLogs
      this.logs = [...this.logs, log].slice(-this.maxLogs);
      
      // Notify all listeners
      this.listeners.forEach((listener) => listener(log));
    } catch (error) {
      console.error("Error adding log to LogEventBus:", error);
    }
  }

  static subscribe(callback: (log: LogEntry) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  static getLogs(): LogEntry[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    try {
      this.logs = [];
      // Notify all listeners with empty log to trigger re-render
      this.listeners.forEach((listener) => 
        listener({
          id: 'clear',
          level: 'info',
          message: 'Logs cleared',
          timestamp: new Date().toISOString(),
          source: 'frontend'
        })
      );
    } catch (error) {
      console.error("Error clearing logs in LogEventBus:", error);
    }
  }
}

// Create safer override methods for the logger
try {
  // Store original methods
  const originalDebug = logger.debug;
  const originalInfo = logger.info;
  const originalWarn = logger.warn;
  const originalError = logger.error;
  const originalCritical = logger.critical;

  // Override with safer versions
  logger.debug = (message, options) => {
    try {
      originalDebug(message, options);
      LogEventBus.addLog({
        id: safeRandomId(),
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        source: typeof options === 'object' ? options.source || 'frontend' : 'frontend',
        context: typeof options === 'object' ? options.context : options,
        tags: typeof options === 'object' ? options.tags : undefined,
        data: typeof options === 'object' ? options.data : undefined,
      });
    } catch (error) {
      console.error("Error in debug logger:", error);
    }
  };

  logger.info = (message, options) => {
    try {
      originalInfo(message, options);
      LogEventBus.addLog({
        id: safeRandomId(),
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        source: typeof options === 'object' ? options.source || 'frontend' : 'frontend',
        context: typeof options === 'object' ? options.context : options,
        tags: typeof options === 'object' ? options.tags : undefined,
        data: typeof options === 'object' ? options.data : undefined,
      });
    } catch (error) {
      console.error("Error in info logger:", error);
    }
  };

  logger.warn = (message, options) => {
    try {
      originalWarn(message, options);
      LogEventBus.addLog({
        id: safeRandomId(),
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        source: typeof options === 'object' ? options.source || 'frontend' : 'frontend',
        context: typeof options === 'object' ? options.context : options,
        tags: typeof options === 'object' ? options.tags : undefined,
        data: typeof options === 'object' ? options.data : undefined,
      });
    } catch (error) {
      console.error("Error in warn logger:", error);
    }
  };

  logger.error = (message, options) => {
    try {
      originalError(message, options);
      LogEventBus.addLog({
        id: safeRandomId(),
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        source: typeof options === 'object' ? options.source || 'frontend' : 'frontend',
        context: typeof options === 'object' ? options.context : options,
        tags: typeof options === 'object' ? options.tags : undefined,
        data: typeof options === 'object' ? options.data : undefined,
      });
    } catch (error) {
      console.error("Error in error logger:", error);
    }
  };

  logger.critical = (message, options) => {
    try {
      originalCritical(message, options);
      LogEventBus.addLog({
        id: safeRandomId(),
        level: 'critical',
        message,
        timestamp: new Date().toISOString(),
        source: typeof options === 'object' ? options.source || 'frontend' : 'frontend',
        context: typeof options === 'object' ? options.context : options,
        tags: typeof options === 'object' ? options.tags : undefined,
        data: typeof options === 'object' ? options.data : undefined,
      });
    } catch (error) {
      console.error("Error in critical logger:", error);
    }
  };
} catch (error) {
  console.error("Error overriding logger methods:", error);
}

// Utility function to format the timestamp
const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } catch (error) {
    return isoString;
  }
};

// Modificação no componente LogEntryComponent para estilo de terminal
const LogEntryComponent = ({ log }: { log: LogEntry }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Obter cor baseada no nível de log
  const getTextColor = () => {
    switch (log.level) {
      case 'debug':
        return 'text-blue-400';
      case 'info':
        return 'text-green-400';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-red-400';
      case 'critical':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  // Obter prefixo baseado no nível de log
  const getPrefix = () => {
    switch (log.level) {
      case 'debug':
        return '[DEBUG]';
      case 'info':
        return '[INFO]';
      case 'warn':
        return '[WARN]';
      case 'error':
        return '[ERROR]';
      case 'critical':
        return '[CRITICAL]';
      default:
        return '[LOG]';
    }
  };

  // Obter prefixo para a fonte do log
  const getSourcePrefix = () => {
    return log.source === 'frontend' ? '[FE]' : '[BE]';
  };

  return (
    <div className="py-1 border-b border-gray-700 font-mono text-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <span className={`${getTextColor()} font-bold whitespace-nowrap`}>
            {formatTimestamp(log.timestamp)} {getSourcePrefix()} {getPrefix()}
          </span>
          <span className="text-gray-300">{log.message}</span>
        </div>
        <div className="flex items-center ml-2">
          {(log.context || log.tags?.length || log.data) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 text-gray-400 hover:text-white" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-1 pl-10 text-xs w-1/2">
          {log.context && (
            <div className="mb-1 text-gray-400">
              <span className="text-gray-500">context:</span> {log.context}
            </div>
          )}
          
          {log.tags && log.tags.length > 0 && (
            <div className="mb-1 flex gap-1 flex-wrap text-gray-400">
              <span className="text-gray-500">tags:</span>
              {log.tags.map((tag, index) => (
                <span key={index} className="px-1 bg-gray-800 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {log.data && (
            <div className="mb-1">
              <span className="text-gray-500">data:</span>
              <pre className="mt-1 p-2 bg-gray-900 rounded-md overflow-x-auto text-xs text-gray-300">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main logger panel component
const LoggerPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Load initial logs
      setLogs(LogEventBus.getLogs());
      
      // Subscribe to new logs
      const unsubscribe = LogEventBus.subscribe((log) => {
        setLogs(LogEventBus.getLogs());
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error initializing logger panel: ${errorMessage}`);
      console.error("Error in LoggerPanel useEffect:", err);
    }
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'frontend' || filter === 'backend') return log.source === filter;
    return log.level === filter;
  });

  // Handle log panel height
  const panelHeight = isOpen ? 'h-[500px]' : 'h-10';

  if (error) {
    return (
      <div className="fixed bottom-0 right-0 z-50 p-2 bg-red-100 text-red-800 border border-red-300 rounded-t-lg shadow-md">
        {error}
      </div>
    );
  }

  return (
    <div 
      className={`fixed bottom-0 right-0 w-1/8 z-50 transition-all duration-300 ${panelHeight}`}
    >
      <Card className="shadow-xl border-t border-l border-r rounded-b-none bg-gray-900 border-gray-700">
        <CardHeader className="p-2 cursor-pointer bg-gray-800 border-b border-gray-700" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-200">
              <Bug className="h-4 w-4" />
              Terminal
              <Badge variant="outline" className="bg-gray-700 text-blue-400 border-gray-600">{logs.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {isOpen && (
                <>
                  <select
                    className="text-xs border rounded px-2 py-1 bg-gray-800 text-gray-300 border-gray-700"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs text-gray-300 border-gray-700 hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      LogEventBus.clearLogs();
                    }}
                  >
                    Limpar
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isOpen && (
          <CardContent className="p-1 h-[calc(100%-40px)] bg-gray-900">
            <ScrollArea className="h-full pr-4 font-mono">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <LogEntryComponent key={log.id} log={log} />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 font-mono italic">
                  Sem logs para exibir.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LoggerPanel;

// Export the LogEventBus for direct use in other components
export { LogEventBus }; 