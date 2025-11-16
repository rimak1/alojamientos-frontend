import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
import type { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <header class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary-600 transition-colors duration-200">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              <span>Stayco</span>
            </a>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center space-x-6">
            <a routerLink="/buscar" routerLinkActive="text-primary" class="text-ink hover:text-primary transition-colors duration-200">
              Buscar
            </a>
            
            <div *ngIf="currentUser?.rol === 'ANFITRION'" class="relative group">
              <button class="text-ink hover:text-primary transition-colors duration-200 flex items-center space-x-1">
                <span>Anfitrión</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-medium border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a routerLink="/anfitrion/alojamientos" class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200">
                  Mis Alojamientos
                </a>
                <a routerLink="/anfitrion/reservas" class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200">
                  Reservas
                </a>
                <a routerLink="/anfitrion/metricas" class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200">
                  Métricas
                </a>
              </div>
            </div>
          </nav>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <div *ngIf="!currentUser; else userMenu">
              <div class="flex items-center space-x-2">
                <app-button variant="ghost" size="sm" (clicked)="router.navigate(['/auth/login'])">
                  Iniciar Sesión
                </app-button>
                <app-button variant="primary" size="sm" (clicked)="router.navigate(['/auth/register'])">
                  Registrarse
                </app-button>
              </div>
            </div>

            <ng-template #userMenu>
              <div class="relative group">
                <button class="flex items-center space-x-2 text-ink hover:text-primary transition-colors duration-200">
                  <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {{ currentUser?.nombre?.[0]?.toUpperCase() }}
                  </div>
                  <span class="hidden md:inline">{{ currentUser?.nombre }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <div class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-medium border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a routerLink="/perfil" class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200">
                    Mi Perfil
                  </a>

                  <!-- Redirige a reservas correctas según rol -->
                  <a
                    [routerLink]="currentUser?.rol === 'ANFITRION' ? '/anfitrion/reservas' : '/reservas'"
                    class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200"
                  >
                    Mis Reservas
                  </a>

                  <a routerLink="/auth/change-password" class="block px-4 py-2 text-sm text-ink hover:bg-accent hover:text-primary transition-colors duration-200">
                    Cambiar Contraseña
                  </a>
                  <hr class="my-2 border-gray-100">
                  <button 
                    (click)="logout()"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    // Render inmediato con lo que haya en storage
    this.currentUser = this.authService.getCurrentUser();
    // Y mantener sincronizado con futuros cambios
    this.subscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        // Si el backend falla, limpiamos sesión local igualmente
        this.authService.forceLocalLogout();
        this.router.navigate(['/']);
      }
    });
  }
}
