import { Component, inject } from '@angular/core';
import { NgStyle } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [
    NgbToastModule,
    NgStyle,
  ],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 11000">
      @for (toast of toastService.toasts(); track toast.id) {
        <ngb-toast
          [animation]="false"
          [autohide]="toast.duration !== 0"
          [delay]="toast.duration || 3000"
          (hidden)="remove(toast.id)"
          [ngStyle]="getToastStyle(toast.type)">
          <div class="d-flex align-items-center">
            <div class="toast-body flex-grow-1" [ngStyle]="getTextStyle(toast.type)">
              {{ toast.message }}
            </div>
            <button type="button"
              class="btn-close me-2"
              [ngStyle]="getTextStyle(toast.type)"
              aria-label="Close"
              (click)="remove(toast.id)">
            </button>
          </div>
        </ngb-toast>
      }
    </div>
  `,
  styles: [``],
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);

  private static readonly TOAST_STYLES: Record<string, Record<string, string>> = {
    'success': { 'background-color': '#2e8540', 'border-color': '#2e8540' },
    'error':   { 'background-color': '#d8292f', 'border-color': '#d8292f' },
    'warning': { 'background-color': '#fcba19', 'border-color': '#e6a817' },
    'info':    { 'background-color': '#269abc', 'border-color': '#269abc' },
  };
  private static readonly TEXT_WHITE = { 'color': '#fff' };
  private static readonly TEXT_BLACK = { 'color': '#000' };

  remove(id: number) {
    this.toastService.remove(id);
  }

  getToastStyle(type: string): Record<string, string> {
    return ToastContainerComponent.TOAST_STYLES[type] ?? ToastContainerComponent.TOAST_STYLES['info'];
  }

  getTextStyle(type: string): Record<string, string> {
    return type === 'warning' ? ToastContainerComponent.TEXT_BLACK : ToastContainerComponent.TEXT_WHITE;
  }
}
