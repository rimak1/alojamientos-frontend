import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1" [attr.aria-label]="'Calificación: ' + rating + ' de 5 estrellas'">
      <button
        *ngFor="let star of stars; let i = index"
        type="button"
        [class]="getStarClasses(i + 1)"
        [disabled]="readonly"
        (click)="selectRating(i + 1)"
        (mouseenter)="!readonly && setHoverRating(i + 1)"
        (mouseleave)="!readonly && setHoverRating(0)"
        [attr.aria-label]="'Dar ' + (i + 1) + ' estrella' + (i === 0 ? '' : 's')"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      </button>

      <span *ngIf="showValue" class="ml-2 text-sm text-gray-600">
        {{ rating.toFixed(1) }}
      </span>
    </div>
  `
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() showValue = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating = 0;
  stars = Array(5).fill(0);

  get displayRating(): number {
    return this.readonly ? this.rating : (this.hoverRating || this.rating);
  }

  getStarClasses(starNumber: number): string {
    const isActive = starNumber <= this.displayRating;
    const baseClasses = this.readonly 
      ? 'cursor-default' 
      : 'cursor-pointer hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50';
    
    const colorClasses = isActive 
      ? 'text-yellow-400' 
      : 'text-gray-300';
    
    return `${baseClasses} ${colorClasses}`;
  }

  selectRating(rating: number): void {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  setHoverRating(rating: number): void {
    if (!this.readonly) {
      this.hoverRating = rating;
    }
  }
}