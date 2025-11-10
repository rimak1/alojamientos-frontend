import { Component, Input, Output, EventEmitter, forwardRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'url';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <label *ngIf="label" [for]="id" class="block text-sm font-medium text-ink">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="relative">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          [class]="inputClasses"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-invalid]="hasError"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        <div *ngIf="hasError" class="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>

      <div *ngIf="errorMessage" class="text-sm text-red-600">
        {{ errorMessage }}
      </div>

      <div *ngIf="hint && !hasError" class="text-sm text-gray-500">
        {{ hint }}
      </div>
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).slice(2, 11)}`;
  @Input() type: InputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() errorMessage?: string;

  //  Coerción booleana para evitar "Type 'string' is not assignable to type 'boolean'"
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) disabled = false;

  @Input() ariaLabel?: string;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();

  value = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get inputClasses(): string {
    const base = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';
    if (this.hasError) {
      return `${base} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500`;
    }
    return `${base} border-gray-300 text-ink placeholder-gray-400 focus:border-primary`;
    }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value ?? '';
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
