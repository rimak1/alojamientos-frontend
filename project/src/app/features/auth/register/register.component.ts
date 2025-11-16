import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { isValidEmail, isValidPassword, isValidPhone, isValidAge } from '../../../core/utils/validation.utils';

@Component({
  selector: 'app-register',
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
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-ink">Crear Cuenta</h1>
          <p class="text-gray-600 mt-2">Únete a nuestra comunidad</p>
        </div>

        <app-card>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <app-input
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre completo"
              formControlName="nombre"
              [errorMessage]="getFieldError('nombre')"
              required
            ></app-input>

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
              placeholder="Mínimo 8 caracteres"
              formControlName="password"
              [errorMessage]="getFieldError('password')"
              hint="Debe contener al menos una mayúscula y un número"
              required
            ></app-input>

            <app-input
              label="Teléfono"
              type="tel"
              placeholder="+57 321 456 7890"
              formControlName="telefono"
              [errorMessage]="getFieldError('telefono')"
              required
            ></app-input>

            <app-input
              label="Fecha de nacimiento"
              type="date"
              formControlName="fechaNacimiento"
              [errorMessage]="getFieldError('fechaNacimiento')"
              required
            ></app-input>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-ink">
                Tipo de cuenta <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  [class]="getRoleButtonClasses('USUARIO')"
                  (click)="selectRole('USUARIO')"
                >
                  <div class="text-center">
                    <svg class="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-sm font-medium">Usuario</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  [class]="getRoleButtonClasses('ANFITRION')"
                  (click)="selectRole('ANFITRION')"
                >
                  <div class="text-center">
                    <svg class="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span class="text-sm font-medium">Anfitrión</span>
                  </div>
                </button>
              </div>
            </div>

            <app-button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              [disabled]="registerForm.invalid"
              [loading]="loading"
            >
              Crear Cuenta
            </app-button>
          </form>

          <div class="mt-6 text-center">
            <div class="text-sm text-gray-600">
              ¿Ya tienes cuenta?
              <a
                routerLink="/auth/login"
                class="text-primary hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Inicia sesión aquí
              </a>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required, this.passwordValidator]],
      telefono: ['', [Validators.required, this.phoneValidator]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],
      rol: ['USUARIO', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.registerForm.value;

    const register$ = formData.rol === 'ANFITRION'
      ? this.authService.registerHost({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        rol: formData.rol,
        fechaNacimiento: formData.fechaNacimiento
      })
      : this.authService.registerGuest({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        rol: formData.rol,
        fechaNacimiento: formData.fechaNacimiento
      });

    register$.subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('¡Cuenta creada exitosamente!');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
        this.toastService.showError('Error al crear la cuenta');
      }
    });
  }



  selectRole(role: 'USUARIO' | 'ANFITRION'): void {
    this.registerForm.patchValue({ rol: role });
  }

  getRoleButtonClasses(role: 'USUARIO' | 'ANFITRION'): string {
    const isSelected = this.registerForm.get('rol')?.value === role;
    const baseClasses = 'p-4 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary';

    return isSelected
      ? `${baseClasses} border-primary bg-primary bg-opacity-10 text-primary`
      : `${baseClasses} border-gray-300 text-gray-600 hover:border-primary hover:text-primary`;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['password']) return 'Contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      if (field.errors['phone']) return 'Teléfono no válido';
      if (field.errors['age']) return 'Debes ser mayor de edad';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      email: 'Email',
      password: 'Contraseña',
      telefono: 'Teléfono',
      fechaNacimiento: 'Fecha de nacimiento'
    };
    return labels[fieldName] || fieldName;
  }

  private emailValidator(control: any) {
    if (control.value && !isValidEmail(control.value)) {
      return { email: true };
    }
    return null;
  }

  private passwordValidator(control: any) {
    if (control.value && !isValidPassword(control.value)) {
      return { password: true };
    }
    return null;
  }

  private phoneValidator(control: any) {
    if (control.value && !isValidPhone(control.value)) {
      return { phone: true };
    }
    return null;
  }

  private ageValidator(control: any) {
    if (control.value && !isValidAge(control.value)) {
      return { age: true };
    }
    return null;
  }
}