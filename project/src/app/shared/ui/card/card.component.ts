import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || subtitle" class="mb-4">
        <h3 *ngIf="title" class="text-lg font-semibold text-ink mb-1">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
      </div>
      
      <ng-content></ng-content>
      
      <div *ngIf="hasFooter" class="mt-6 pt-4 border-t border-gray-100">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding: 'sm' | 'md' | 'lg' = 'md';
  @Input() shadow: 'none' | 'soft' | 'medium' | 'strong' = 'soft';
  @Input() hasFooter = false;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-2xl border border-gray-100';
    
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    const shadowClasses = {
      none: '',
      soft: 'shadow-soft',
      medium: 'shadow-medium',
      strong: 'shadow-strong'
    };

    return [
      baseClasses,
      paddingClasses[this.padding],
      shadowClasses[this.shadow]
    ].join(' ');
  }
}