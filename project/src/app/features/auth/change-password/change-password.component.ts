import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { isValidPassword } from '../../../core/utils/validation.utils';
import type { ChangePasswordRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-ink">Cambiar Contraseña</h1>
            <p class="text-gray-600 mt-2">Actualiza tu contraseña de acceso</p>
          </div>

          <app-card>
            <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <app-input
                label="Contraseña actual"
                type="password"
                placeholder="Tu contraseña actual"
                formControlName="passwordActual"
                [errorMessage]="getFieldError('passwordActual')"
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

              <div class="flex space-x-4">
                <app-button
                  type="submit"
                  variant="primary"
                  [disabled]="changePasswordForm.invalid"
                  [loading]="loading"
                  fullWidth
                >
                  Cambiar contraseña
                </app-button>
                
                <app-button
                  type="button"
                  variant="ghost"
                  (clicked)="router.navigate(['/perfil'])"
                >
                  Cancelar
                </app-button>
              </div>
            </form>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    public router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      nuevaPassword: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
 onSubmit(): void {
  if (this.changePasswordForm.valid && !this.loading) {
    this.loading = true;

    const form = this.changePasswordForm.value;

    const payload: ChangePasswordRequest = {
      currentPassword: form.passwordActual,
      newPassword: form.nuevaPassword,
      confirmPassword: form.confirmPassword
    };

    const user = this.authService.getCurrentUser();

    const request$ =
      user?.rol === 'ANFITRION'
        ? this.authService.changeMyHostPassword(payload)
        : this.authService.changeMyGuestPassword(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('¡Contraseña cambiada exitosamente!');
        this.router.navigate(['/perfil']);
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
        this.toastService.showError('Error al cambiar la contraseña. Verifica tus datos.');
      }
    });
  }
}


  getFieldError(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['password']) return 'Contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      passwordActual: 'Contraseña actual',
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