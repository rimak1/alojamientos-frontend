import { Component, OnInit } from '@angular/core';
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
  selector: 'app-login',
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
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-ink">Iniciar Sesión</h1>
          <p class="text-gray-600 mt-2">Bienvenido de vuelta</p>
        </div>

        <app-card>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <app-input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              formControlName="email"
              [errorMessage]="getFieldError('email')"
              required
            ></app-input>

            <app-input
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              formControlName="password"
              [errorMessage]="getFieldError('password')"
              required
            ></app-input>

            <app-button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              [disabled]="loginForm.invalid"
              [loading]="loading"
            >
              Iniciar Sesión
            </app-button>
          </form>

          <div class="mt-6 text-center space-y-4">
            <a
              routerLink="/auth/forgot"
              class="text-sm text-primary hover:text-primary-600 transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>

            <div class="text-sm text-gray-600">
              ¿No tienes cuenta?
              <a
                routerLink="/auth/register"
                class="text-primary hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Regístrate aquí
              </a>
            </div>
          </div>

          <!-- Demo accounts -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-xs text-gray-500 text-center mb-3">Cuentas de demo:</p>
            <div class="grid grid-cols-2 gap-2">
              <app-button variant="ghost" size="sm" (clicked)="fillDemoUser()">
                Usuario Demo
              </app-button>
              <app-button variant="ghost" size="sm" (clicked)="fillDemoHost()">
                Anfitrión Demo
              </app-button>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.showSuccess('¡Bienvenido de vuelta!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showError('Email o contraseña incorrectos');
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName === 'email' ? 'Email' : 'Contraseña'} es obligatorio`;
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['minlength']) return 'Contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  fillDemoUser(): void {
    this.loginForm.patchValue({
      email: 'usuario@demo.com',
      password: 'Usuario123'
    });
  }

  fillDemoHost(): void {
    this.loginForm.patchValue({
      email: 'anfitrion@demo.com',
      password: 'Anfitrion123'
    });
  }

  private emailValidator(control: any) {
    if (control.value && !isValidEmail(control.value)) {
      return { email: true };
    }
    return null;
  }
}