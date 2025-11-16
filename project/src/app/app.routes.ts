import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'buscar',
    loadComponent: () => import('./features/listings/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'alojamientos/:id',
    loadComponent: () => import('./features/listings/detail/listing-detail.component').then(m => m.ListingDetailComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/users/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'anfitrion',
    canActivate: [authGuard, () => roleGuard('ANFITRION')],
    children: [
      {
        path: 'alojamientos',
        loadComponent: () => import('./features/listings/host/host-listings.component').then(m => m.HostListingsComponent)
      },
      {
        path: 'alojamientos/nuevo',
        loadComponent: () => import('./features/listings/form/listing-form.component').then(m => m.ListingFormComponent)
      },
      {
        path: 'alojamientos/:id/editar',
        loadComponent: () => import('./features/listings/form/listing-form.component').then(m => m.ListingFormComponent)
      },
      {
        path: 'reservas',
        loadComponent: () => import('./features/bookings/host/host-bookings.component').then(m => m.HostBookingsComponent)
      },
      {
        path: 'metricas',
        loadComponent: () => import('./features/host/metrics/host-metrics.component')
          .then(m => m.HostMetricsComponent)
      }
    ]
  },
  {
    path: 'reservas',
    loadComponent: () => import('./features/bookings/user/user-bookings.component').then(m => m.UserBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: '404',
    loadComponent: () => import('./shared/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];