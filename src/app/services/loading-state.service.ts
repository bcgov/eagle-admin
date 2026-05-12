import { Injectable, signal, computed } from '@angular/core';

export interface LoadingOperation {
  id: string;
  description?: string;
  startTime: number;
}

@Injectable({ providedIn: 'root' })
export class LoadingStateService {
  private operations = signal<Map<string, LoadingOperation>>(new Map());

  public readonly isLoading = computed(() => this.operations().size > 0);

  startLoading(id: string, description?: string): void {
    const current = new Map(this.operations());
    current.set(id, { id, description, startTime: Date.now() });
    this.operations.set(current);
  }

  stopLoading(id: string): void {
    const current = new Map(this.operations());
    current.delete(id);
    this.operations.set(current);
  }

  isOperationLoading(id: string): boolean {
    return this.operations().has(id);
  }

  getOperationState(id: string) {
    return computed(() => this.operations().has(id));
  }
}
