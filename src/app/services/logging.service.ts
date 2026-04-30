import { Injectable } from '@angular/core';

export enum LogLevel {
  ALL = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

@Injectable({ providedIn: 'root' })
export class LoggingService {

  private get minLevel(): LogLevel {
    const configService = (window as any).__configService;
    if (configService?.config) {
      const config = configService.config();
      if (config?.LOG_LEVEL !== undefined) return config.LOG_LEVEL;
      if (config?.logLevel !== undefined) return config.logLevel;
    }
    const envLogLevel = (window as any).__env?.logLevel;
    if (typeof envLogLevel === 'number') return envLogLevel;
    return LogLevel.ALL;
  }

  private log(level: LogLevel, emoji: string, message: string, source?: string, data?: any): void {
    if (level < this.minLevel) return;
    const ts = new Date().toLocaleTimeString();
    const prefix = source ? `[${source}]` : '';
    const args: any[] = [`${emoji} ${ts} ${prefix}`, message];
    if (data !== undefined) args.push(data);
    switch (level) {
      case LogLevel.ERROR: console.error(...args); break;
      case LogLevel.WARN:  console.warn(...args);  break;
      case LogLevel.INFO:  console.info(...args);  break;
      default:             console.log(...args);   break;
    }
  }

  error(message: string, source?: string, data?: any): void { this.log(LogLevel.ERROR, '🔴', message, source, data); }
  warn(message: string, source?: string, data?: any): void  { this.log(LogLevel.WARN,  '🟡', message, source, data); }
  info(message: string, source?: string, data?: any): void  { this.log(LogLevel.INFO,  '🔵', message, source, data); }
  debug(message: string, source?: string, data?: any): void { this.log(LogLevel.DEBUG, '🟢', message, source, data); }

  logHttpRequest(method: string, url: string): void {
    this.debug(`HTTP ${method} ${url}`, 'HttpClient');
  }

  logHttpResponse(method: string, url: string, status: number, duration?: number): void {
    const msg = duration !== undefined
      ? `HTTP ${method} ${url} ${status} (${duration}ms)`
      : `HTTP ${method} ${url} ${status}`;
    if (status >= 400) { this.error(msg, 'HttpClient'); } else { this.debug(msg, 'HttpClient'); }
  }

  logHttpError(method: string, url: string, error: any): void {
    const status = error.status || 'Unknown';
    const message = error.message || error.statusText || 'HTTP Error';
    this.error(`HTTP ${method} ${url} ${status}: ${message}`, 'HttpClient', error);
  }
}
