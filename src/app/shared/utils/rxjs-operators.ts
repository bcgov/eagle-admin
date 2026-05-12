import { Observable, defer, MonoTypeOperatorFunction } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingStateService } from 'src/app/services/loading-state.service';

export function withLoading<T>(
  loadingState: LoadingStateService,
  id: string,
  description?: string
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    defer(() => {
      loadingState.startLoading(id, description);
      return source.pipe(finalize(() => loadingState.stopLoading(id)));
    });
}
