import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { ToastMessage } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  /** Mostrar toast genérico (atajo) */
  show(message: string, type: ToastMessage['type'] = 'info', duration = 4000): void {
    this.addToast(type, message, duration);
  }

  /** Mostrar toast de éxito */
  showSuccess(message: string, duration = 4000): void {
    this.addToast('success', message, duration);
  }

  /** Mostrar toast de error */
  showError(message: string, duration = 6000): void {
    this.addToast('error', message, duration);
  }

  /** Mostrar toast informativo */
  showInfo(message: string, duration = 4000): void {
    this.addToast('info', message, duration);
  }

  /** Mostrar toast de advertencia */
  showWarning(message: string, duration = 5000): void {
    this.addToast('warning', message, duration);
  }

  /** Eliminar un toast por id */
  removeToast(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  /** Limpiar todos los toasts */
  clearAll(): void {
    this.toastsSubject.next([]);
  }

  /** Agregar nuevo toast */
  private addToast(type: ToastMessage['type'], message: string, duration: number): void {
    const toast: ToastMessage = {
      id: this.genId(),
      type,
      message,
      duration
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    // Auto-remove después de 'duration' ms
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast.id), duration);
    }
  }

  /** Genera un id único */
  private genId(): string {
    return (globalThis.crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2)));
  }
}
