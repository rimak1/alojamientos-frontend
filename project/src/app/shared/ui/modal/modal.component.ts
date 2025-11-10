import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" (click)="onBackdropClick($event)">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"></div>
      
      <!-- Modal -->
      <div 
        class="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-strong transform transition-all duration-300"
        [class.scale-95]="!isOpen"
        [class.scale-100]="isOpen"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div *ngIf="title || showCloseButton" class="flex items-center justify-between p-6 pb-4">
          <h2 *ngIf="title" class="text-lg font-semibold text-ink">{{ title }}</h2>
          <button 
            *ngIf="showCloseButton"
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            (click)="close()"
            aria-label="Cerrar modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="hasFooter" class="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() showCloseButton = true;
  @Input() hasFooter = false;
  @Input() closeOnBackdrop = true;
  
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen) {
      this.preventBodyScroll();
    }
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  close(): void {
    this.isOpen = false;
    this.restoreBodyScroll();
    this.closed.emit();
  }

  onBackdropClick(event: Event): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  private preventBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = '';
  }
}