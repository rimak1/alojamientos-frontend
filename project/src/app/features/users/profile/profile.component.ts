import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { isValidPhone } from '../../../core/utils/validation.utils';
import type { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Profile header -->
          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-primary">
              <img 
                *ngIf="currentUser?.fotoUrl; else initials" 
                [src]="currentUser?.fotoUrl || ''" 
                [alt]="currentUser?.nombre || 'Usuario'"
                class="w-full h-full object-cover"
              />
              <ng-template #initials>
                <div class="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {{ currentUser?.nombre?.[0]?.toUpperCase() || '?' }}
                </div>
              </ng-template>
            </div>
            <h1 class="text-3xl font-bold text-ink">Mi Perfil</h1>
            <p class="text-gray-600 mt-2">Gestiona tu información personal</p>
          </div>

          <!-- User info card -->
          <app-card title="Información personal">
            <div *ngIf="!editMode; else editForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <p class="text-ink">{{ currentUser?.nombre }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p class="text-ink">{{ currentUser?.email }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <p class="text-ink">{{ currentUser?.telefono }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <app-badge [variant]="currentUser?.rol === 'ANFITRION' ? 'secondary' : 'default'">
                    {{ currentUser?.rol === 'ANFITRION' ? 'Anfitrión' : 'Usuario' }}
                  </app-badge>
                </div>

                <div class="md:col-span-2" *ngIf="currentUser?.descripcion">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <p class="text-ink">{{ currentUser?.descripcion }}</p>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <app-button variant="outline" (clicked)="enableEdit()">
                  Editar perfil
                </app-button>
                <app-button variant="ghost" routerLink="/auth/change-password">
                  Cambiar contraseña
                </app-button>
              </div>
            </div>

            <ng-template #editForm>
              <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <app-input
                    label="Nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    formControlName="nombre"
                    [errorMessage]="getFieldError('nombre')"
                    required
                  ></app-input>

                  <app-input
                    label="Teléfono"
                    type="tel"
                    placeholder="+34 600 000 000"
                    formControlName="telefono"
                    [errorMessage]="getFieldError('telefono')"
                    required
                  ></app-input>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-ink mb-2">Descripción</label>
                    <textarea
                      formControlName="descripcion"
                      placeholder="Cuéntanos sobre ti..."
                      rows="4"
                      class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duración-200"
                    ></textarea>
                  </div>
                </div>

                <div class="flex justify-end space-x-4">
                  <app-button type="button" variant="ghost" (clicked)="cancelEdit()">
                    Cancelar
                  </app-button>
                  <app-button
                    type="submit"
                    variant="primary"
                    [disabled]="profileForm.invalid"
                    [loading]="loading"
                  >
                    Guardar cambios
                  </app-button>
                </div>
              </form>
            </ng-template>
          </app-card>

          <!-- Quick actions -->
          <app-card title="Acciones">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <app-button variant="outline" routerLink="/reservas" fullWidth>
                Mis reservas
              </app-button>
              
              <app-button 
                *ngIf="currentUser?.rol === 'ANFITRION'" 
                variant="secondary" 
                routerLink="/anfitrión/alojamientos" 
                fullWidth
              >
                Mis alojamientos
              </app-button>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  editMode = false;
  loading = false;

  // Validator como propiedad (mantiene 'this' y tipado correcto)
  private phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (value && !isValidPhone(value)) {
      return { phone: true };
    }
    return null;
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, this.phoneValidator]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          nombre: user.nombre,
          telefono: user.telefono,
          descripcion: user.descripcion || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Error al cargar el perfil');
        this.loading = false;
      }
    });
  }


  enableEdit(): void {
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadProfile();
  }

  onSave(): void {
    if (this.profileForm.invalid || this.loading) {
      this.profileForm.markAllAsTouched();
      this.toastService.showWarning('Revisa los campos del formulario');
      return;
    }

    this.loading = true;
    const form = this.profileForm.value;

    this.authService.updateProfile({
      nombre: form.nombre,
      telefono: form.telefono
    }).subscribe({
      next: (user) => {
        this.loading = false;
        this.editMode = false;
        this.currentUser = user;
        this.toastService.showSuccess('Perfil actualizado exitosamente');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.toastService.showError('No se pudo actualizar el perfil');
      }
    });
  }


  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && (field.touched || field.dirty)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['phone']) return 'Teléfono no válido';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      nombre: 'Nombre',
      telefono: 'Teléfono',
      descripcion: 'Descripción'
    };
    return labels[fieldName] ?? fieldName;
  }
}
