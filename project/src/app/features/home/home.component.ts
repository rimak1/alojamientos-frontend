import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { HeaderComponent } from '../../shared/layout/header/header.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { StarRatingComponent } from '../../shared/ui/star-rating/star-rating.component';

import { ListingsService } from '../../core/services/listings.service';
import { AuthService } from '../../core/services/auth.service';

import { formatPrice } from '../../core/utils/validation.utils';
import type { Listing } from '../../core/models/listing.model';
import type { User } from '../../core/models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent,
    StarRatingComponent
  ],
  template: `
    <app-header></app-header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary to-secondary py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 text-balance">
          Encuentra tu alojamiento perfecto
        </h1>
        <p class="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto text-balance">
          Descubre lugares únicos donde quedarte y crea recuerdos inolvidables
        </p>

        <!-- Quick search -->
        <div class="max-w-md mx-auto">
          <form [formGroup]="searchForm" (ngSubmit)="onQuickSearch()" class="flex gap-2">
            <div class="flex-1">
              <input
                type="text"
                placeholder="¿Dónde quieres ir?"
                formControlName="ciudad"
                class="w-full px-4 py-3 rounded-xl border-0 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent shadow-medium"
              />
            </div>
            <app-button type="submit" variant="secondary">
              Buscar
            </app-button>
          </form>
        </div>
      </div>
    </section>

    <!-- Featured listings -->
    <section class="py-16 bg-base">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-ink mb-4">Alojamientos destacados</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestros alojamientos mejor valorados y más populares
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loading">
          <app-card
            *ngFor="let listing of featuredListings"
            class="group cursor-pointer hover:shadow-medium transition-all duration-200"
            (click)="goToListing(listing.id)"
          >
            <div class="space-y-4">
              <!-- Image -->
              <div class="aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                <img
                  [src]="listing.imagenes?.length ? listing.imagenes[0].url : 'assets/placeholder.jpg'"
                  [alt]="listing.titulo"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <!-- Content -->
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <h3 class="text-lg font-semibold text-ink group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {{ listing.titulo }}
                  </h3>
                  <div *ngIf="listing.ratingPromedio as rating" class="flex items-center space-x-1 ml-2">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">{{ rating.toFixed(1) }}</span>
                  </div>
                </div>

                <p class="text-gray-600 text-sm line-clamp-2">{{ listing.descripcion }}</p>

                <div class="flex items-center justify-between">
                  <app-badge variant="secondary">{{ listing.ciudad }}</app-badge>
                  <div class="text-right">
                    <p class="text-lg font-bold text-ink">{{ formatPrice(listing.precioNoche, 'es-CO', 'COP') }}</p>
                    <p class="text-sm text-gray-500">por noche</p>
                  </div>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let item of [1,2,3]" class="animate-pulse">
            <app-card>
              <div class="space-y-4">
                <div class="aspect-video w-full bg-gray-200 rounded-xl"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <div class="text-center mt-12">
          <app-button variant="outline" size="lg" (clicked)="router.navigate(['/buscar'])">
            Ver todos los alojamientos
          </app-button>
        </div>
      </div>
    </section>

    <!-- Features section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-ink mb-4">¿Por qué elegirnos?</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center group">
            <div class="w-16 h-16 mx-auto mb-4 bg-primary bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:bg-opacity-20 transition-colors duration-200">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-ink mb-2">Verificado</h3>
            <p class="text-gray-600">Todos nuestros alojamientos están verificados y cumplen con estándares de calidad</p>
          </div>

          <div class="text-center group">
            <div class="w-16 h-16 mx-auto mb-4 bg-secondary bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:bg-opacity-20 transition-colors duración-200">
              <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-ink mb-2">Soporte 24/7</h3>
            <p class="text-gray-600">Nuestro equipo está disponible para ayudarte en cualquier momento</p>
          </div>

          <div class="text-center group">
            <div class="w-16 h-16 mx-auto mb-4 bg-accent bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:bg-opacity-30 transition-colors duration-200">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-ink mb-2">Mejores precios</h3>
            <p class="text-gray-600">Encuentra las mejores ofertas sin comisiones ocultas</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  featuredListings: Listing[] = [];
  loading = true;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService,
    private authService: AuthService,
    public router: Router
  ) {
    this.searchForm = this.fb.group({
      ciudad: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadFeaturedListings();
  }

  onQuickSearch(): void {
    const ciudad = this.searchForm.get('ciudad')?.value ?? '';
    this.router.navigate(['/buscar'], { queryParams: { ciudad } });
  }

  loadFeaturedListings(): void {
    this.listingsService.searchListings({}, 1, 6).subscribe(response => {
      this.featuredListings = response.items;
      this.loading = false;
    });
  }

  goToListing(id: string): void {
    this.router.navigate(['/alojamientos', id]);
  }

  // Exponer util para el template
  formatPrice = formatPrice;
}
