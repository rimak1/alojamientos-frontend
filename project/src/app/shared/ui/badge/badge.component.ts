import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get badgeClasses(): string {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      secondary: 'bg-secondary bg-opacity-20 text-secondary'
    };

    return [
      baseClasses,
      sizeClasses[this.size],
      variantClasses[this.variant]
    ].join(' ');
  }
}