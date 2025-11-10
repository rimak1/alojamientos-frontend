import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { User } from '../models/user.model';

export const roleGuard = (requiredRole: User['rol']): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();
    
    if (currentUser && currentUser.rol === requiredRole) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};