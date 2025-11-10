import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatPrice } from '../../../core/utils/validation.utils';
import type { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-host-listings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    StarRatingComponent,
    ModalComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-ink">Mis Alojamientos</h1>
            <p class="text-gray-600 mt-2">Gestiona tus propiedades y reservas</p>
          </div>
          
          <app-button variant="primary" size="lg" (clicked)="router.navigate(['/anfitrion/alojamientos/nuevo'])">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Alojamiento
          </app-button>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div *ngFor="let item of [1,2,3]" class="animate-pulse">
            <app-card>
              <div class="space-y-4">
                <div class="aspect-video w-full bg-gray-200 rounded-xl"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <!-- Listings grid -->
        <div *ngIf="!loading && listings.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <app-card *ngFor="let listing of listings" class="group">
            <div class="space-y-4">
              <!-- Image -->
              <div class="aspect-video w-full overflow-hidden rounded-xl bg-gray-200 relative">
                <img
                  [src]="listing.imagenes[0]?.url"
                  [alt]="listing.titulo"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <!-- Status badge -->
                <div class="absolute top-3 left-3">
                  <app-badge [variant]="listing.estado === 'ACTIVO' ? 'success' : 'warning'">
                    {{ listing.estado }}
                  </app-badge>
                </div>
              </div>

              <!-- Content -->
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <h3 class="text-lg font-semibold text-ink line-clamp-2">
                    {{ listing.titulo }}
                  </h3>
                  <div *ngIf="listing.ratingPromedio" class="flex items-center space-x-1 ml-2">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">{{ listing.ratingPromedio.toFixed(1) }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ listing.ciudad }}</span>
                  <span class="font-semibold text-ink">{{ formatPrice(listing.precioNoche) }}/noche</span>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2 pt-2">
                  <app-button 
                    variant="outline" 
                    size="sm" 
                    (clicked)="viewListing(listing.id)"
                    class="flex-1"
                  >
                    Ver
                  </app-button>
                  
                  <app-button 
                    variant="secondary" 
                    size="sm" 
                    (clicked)="editListing(listing.id)"
                    class="flex-1"
                  >
                    Editar
                  </app-button>
                  
                  <app-button 
                    variant="ghost" 
                    size="sm" 
                    (clicked)="confirmDelete(listing)"
                    aria-label="Eliminar alojamiento"
                  >
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </app-button>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && listings.length === 0" class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          
          <h3 class="text-xl font-semibold text-ink mb-4">Aún no tienes alojamientos</h3>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Empieza a generar ingresos publicando tu primer alojamiento
          </p>
          
          <app-button variant="primary" size="lg" (clicked)="router.navigate(['/anfitrion/alojamientos/nuevo'])">
            Crear mi primer alojamiento
          </app-button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <app-modal
      [isOpen]="showDeleteModal"
      title="Confirmar eliminación"
      [hasFooter]="true"
      (closed)="showDeleteModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de que deseas eliminar el alojamiento 
          <strong>"{{ listingToDelete?.titulo }}"</strong>?
        </p>
        <p class="text-sm text-gray-600">
          Esta acción no se puede deshacer. El alojamiento será archivado y no aparecerá en búsquedas.
        </p>
      </div>

      <div slot="footer" class="flex justify-end space-x-4">
        <app-button variant="ghost" (clicked)="showDeleteModal = false">
          Cancelar
        </app-button>
        <app-button 
          variant="danger" 
          (clicked)="deleteListing()"
          [loading]="deleteLoading"
        >
          Eliminar
        </app-button>
      </div>
    </app-modal>
  `
})
export class HostListingsComponent implements OnInit {
  listings: Listing[] = [];
  loading = true;
  showDeleteModal = false;
  deleteLoading = false;
  listingToDelete: Listing | null = null;

  constructor(
    public router: Router,
    private listingsService: ListingsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.listingsService.getHostListings().subscribe(listings => {
      this.listings = listings.filter(listing => listing.estado !== 'ELIMINADO');
      this.loading = false;
    });
  }

  viewListing(id: string): void {
    this.router.navigate(['/alojamientos', id]);
  }

  editListing(id: string): void {
    this.router.navigate(['/anfitrion/alojamientos', id, 'editar']);
  }

  confirmDelete(listing: Listing): void {
    this.listingToDelete = listing;
    this.showDeleteModal = true;
  }

  deleteListing(): void {
    if (this.listingToDelete && !this.deleteLoading) {
      this.deleteLoading = true;
      
      this.listingsService.deleteListing(this.listingToDelete.id).subscribe({
        next: () => {
          this.deleteLoading = false;
          this.showDeleteModal = false;
          this.toastService.showSuccess('Alojamiento eliminado exitosamente');
          this.loadListings();
        },
        error: () => {
          this.deleteLoading = false;
          this.toastService.showError('Error al eliminar el alojamiento');
        }
      });
    }
  }

  formatPrice = formatPrice;
}