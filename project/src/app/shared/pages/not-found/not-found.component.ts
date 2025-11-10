import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-base flex items-center justify-center">
      <div class="text-center">
        <div class="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        
        <h1 class="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-ink mb-4">Página no encontrada</h2>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div class="space-x-4">
          <app-button variant="primary" routerLink="/">
            Volver al inicio
          </app-button>
          <app-button variant="outline" (clicked)="goBack()">
            Volver atrás
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}