import { Component, Input, Output, EventEmitter, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick()"
      [attr.aria-label]="ariaLabel"
    >
      <span *ngIf="loading" class="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      <span [class.opacity-70]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  //  Coerción booleana para evitar "Type 'string' is not assignable to type 'boolean'"
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Input() ariaLabel?: string;
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl'
    } as const; 

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-opacity-90 shadow-soft hover:shadow-medium',
      secondary: 'bg-secondary text-white hover:bg-opacity-90 shadow-soft hover:shadow-medium',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'text-ink hover:bg-accent hover:text-ink',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft hover:shadow-medium'
    } as const;

    const widthClass = this.fullWidth ? 'w-full' : '';

    return [
      baseClasses,
      sizeClasses[this.size],
      variantClasses[this.variant],
      widthClass
    ].filter(Boolean).join(' ');
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
