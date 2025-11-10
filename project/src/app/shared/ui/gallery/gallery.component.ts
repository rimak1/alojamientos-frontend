import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ImagenListing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" *ngIf="images.length > 0">
      <!-- Main image -->
      <div class="aspect-video w-full overflow-hidden rounded-2xl bg-gray-200">
        <img
          [src]="currentImage.url"
          [alt]="alt || 'Imagen ' + (currentIndex + 1)"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <!-- Navigation arrows -->
      <button
        *ngIf="images.length > 1"
        type="button"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        (click)="previousImage()"
        [disabled]="currentIndex === 0"
        aria-label="Imagen anterior"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <button
        *ngIf="images.length > 1"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        (click)="nextImage()"
        [disabled]="currentIndex === images.length - 1"
        aria-label="Imagen siguiente"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      <!-- Indicators -->
      <div *ngIf="images.length > 1 && showIndicators" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        <button
          *ngFor="let image of images; let i = index"
          type="button"
          [class]="getIndicatorClasses(i)"
          (click)="goToImage(i)"
          [attr.aria-label]="'Ir a imagen ' + (i + 1)"
        ></button>
      </div>

      <!-- Counter -->
      <div *ngIf="images.length > 1 && showCounter" class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  `
})
export class GalleryComponent {
  @Input() images: ImagenListing[] = [];
  @Input() alt?: string;
  @Input() showIndicators = true;
  @Input() showCounter = false;

  currentIndex = 0;

  get currentImage(): ImagenListing {
    return this.images[this.currentIndex] || this.images[0];
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }

  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
    }
  }

  getIndicatorClasses(index: number): string {
    const baseClasses = 'w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary';
    return index === this.currentIndex 
      ? `${baseClasses} bg-white` 
      : `${baseClasses} bg-white bg-opacity-50 hover:bg-opacity-75`;
  }
}