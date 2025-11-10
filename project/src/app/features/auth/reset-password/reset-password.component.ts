import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { isValidPassword } from '../../../core/utils/validation.utils';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <div class="min-h-screen bg-base flex items-center justify-center py-12 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-ink">Restablecer Contraseña</h1>
          <p class="text-gray-600 mt-2">Ingresa el código que recibiste por email</p>
        </div>

        <app-card>
          <!-- Countdown timer -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
            <p class="text-sm text-blue-800">
              Código válido por: <span class="font-mono font-semibold">{{ formatTime(timeRemaining) }}</span>
            </p>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <app-input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              formControlName="email"
              [errorMessage]="getFieldError('email')"
              required
            ></app-input>

            <app-input
              label="Código de verificación"
              type="text"
              placeholder="123456"
              formControlName="codigo"
              [errorMessage]="getFieldError('codigo')"
              hint="Revisa tu email (incluyendo spam)"
              required
            ></app-input>

            <app-input
              label="Nueva contraseña"
              type="password"
              placeholder="Nueva contraseña segura"
              formControlName="nuevaPassword"
              [errorMessage]="getFieldError('nuevaPassword')"
              hint="Debe contener al menos una mayúscula y un número"
              required
            ></app-input>

            <app-input
              label="Confirmar nueva contraseña"
              type="password"
              placeholder="Confirma tu nueva contraseña"
              formControlName="confirmPassword"
              [errorMessage]="getFieldError('confirmPassword')"
              required
            ></app-input>

            <app-button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              [disabled]="resetForm.invalid || timeRemaining <= 0"
              [loading]="loading"
            >
              {{ timeRemaining > 0 ? 'Restablecer contraseña' : 'Código expirado' }}
            </app-button>
          </form>

          <div class="mt-6 text-center space-y-4">
            <app-button variant="ghost" size="sm" (clicked)="resendCode()" [disabled]="timeRemaining > 0">
              Reenviar código
            </app-button>

            <div>
              <a
                routerLink="/auth/forgot"
                class="text-sm text-primary hover:text-primary-600 transition-colors duration-200"
              >
                ← Solicitar nuevo código
              </a>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  timeRemaining = 15 * 60; // 15 minutes in seconds
  private timer?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required]],
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      nuevaPassword: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Pre-fill email from query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resetForm.patchValue({ email: params['email'] });
      }
    });

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onSubmit(): void {
    if (this.resetForm.valid && !this.loading && this.timeRemaining > 0) {
      this.loading = true;
      
      const { confirmPassword, ...resetData } = this.resetForm.value;
      
      this.authService.resetPassword(resetData).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.showSuccess('¡Contraseña restablecida exitosamente!');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showError('Código inválido o expirado');
        }
      });
    }
  }

  resendCode(): void {
    const email = this.resetForm.get('email')?.value;
    if (email) {
      this.authService.forgotPassword({ email }).subscribe({
        next: () => {
          this.toastService.showSuccess('Código reenviado');
          this.timeRemaining = 15 * 60;
          this.startCountdown();
        },
        error: () => {
          this.toastService.showError('Error al reenviar código');
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['pattern'] && fieldName === 'codigo') return 'Código debe tener 6 dígitos';
      if (field.errors['password']) return 'Contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private startCountdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = window.setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      codigo: 'Código',
      nuevaPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  private passwordValidator(control: any) {
    if (control.value && !isValidPassword(control.value)) {
      return { password: true };
    }
    return null;
  }

  private passwordMatchValidator(group: any) {
    const password = group.get('nuevaPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }
}