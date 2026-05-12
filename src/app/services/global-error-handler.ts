import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggingService);

  handleError(error: Error | any): void {
    const message = error?.message || error?.toString() || 'Unknown error';
    this.logger.error(`Unhandled Error: ${message}`, 'GlobalErrorHandler', error);
  }
}
