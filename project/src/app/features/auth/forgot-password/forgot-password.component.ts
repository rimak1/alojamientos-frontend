import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { isValidEmail } from '../../../core/utils/validation.utils';

@Component({
  selector: 'app-forgot-password',
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 002 2M9 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 002 2M3 21v-4a8 8 0 018-8 8 8 0 018 8v4"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-ink">Recuperar Contraseña</h1>
          <p class="text-gray-600 mt-2">Te enviaremos un código para restablecer tu contraseña</p>
        </div>

        <app-card>
          <div *ngIf="!emailSent; else successMessage">
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <app-input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                formControlName="email"
                [errorMessage]="getFieldError('email')"
                required
              ></app-input>

              <app-button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                [disabled]="forgotForm.invalid"
                [loading]="loading"
              >
                Enviar código
              </app-button>
            </form>
          </div>

          <ng-template #successMessage>
            <div class="text-center space-y-4">
              <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-ink mb-2">Código enviado</h3>
                <p class="text-gray-600 text-sm">
                  Hemos enviado un código de verificación a <strong>{{ forgotForm.get('email')?.value }}</strong>
                </p>
              </div>
              <app-button variant="primary" (clicked)="goToReset()" fullWidth>
                Continuar con el código
              </app-button>
            </div>
          </ng-template>

          <div class="mt-6 text-center">
            <a
              routerLink="/auth/login"
              class="text-sm text-primary hover:text-primary-600 transition-colors duration-200"
            >
              ← Volver al inicio de sesión
            </a>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid && !this.loading) {
      this.loading = true;
      
      this.authService.forgotPassword(this.forgotForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.emailSent = true;
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showError('Error al enviar el código');
        }
      });
    }
  }

  goToReset(): void {
    this.router.navigate(['/auth/reset'], { 
      queryParams: { email: this.forgotForm.get('email')?.value } 
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Email es obligatorio';
      if (field.errors['email']) return 'Email no válido';
    }
    return '';
  }

  private emailValidator(control: any) {
    if (control.value && !isValidEmail(control.value)) {
      return { email: true };
    }
    return null;
  }
}