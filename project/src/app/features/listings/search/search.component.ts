import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { ListingsService } from '../../../core/services/listings.service';
import { formatPrice } from '../../../core/utils/validation.utils';
import type { Listing } from '../../../core/models/listing.model';
import type { SearchFilters } from '../../../core/models/common.model';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-search',
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
    StarRatingComponent,
    PaginationComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen">
      <div class="container mx-auto px-4 py-8">
        <div class="lg:grid lg:grid-cols-4 lg:gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-1">
            <app-card title="Filtros" class="sticky top-4">
              <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()" class="space-y-6">
                <app-input
                  label="Ciudad"
                  type="text"
                  placeholder="Buscar por ciudad..."
                  formControlName="ciudad"
                ></app-input>

                <div class="grid grid-cols-2 gap-4">
                  <app-input
                    label="Check-in"
                    type="date"
                    formControlName="fechaInicio"
                  ></app-input>
                  <app-input
                    label="Check-out"
                    type="date"
                    formControlName="fechaFin"
                  ></app-input>
                </div>

                <div class="space-y-4">
                  <label class="block text-sm font-medium text-ink">Rango de precio (por noche)</label>
                  <div class="grid grid-cols-2 gap-4">
                    <app-input
                      label="Mínimo"
                      type="number"
                      placeholder="0"
                      formControlName="precioMin"
                    ></app-input>
                    <app-input
                      label="Máximo"
                      type="number"
                      placeholder="1000000"
                      formControlName="precioMax"
                    ></app-input>
                  </div>
                </div>

                <div class="space-y-4">
                  <label class="block text-sm font-medium text-ink">Servicios</label>
                  <div class="space-y-3">
                    <label *ngFor="let servicio of availableServices" class="flex items-center">
                      <input
                        type="checkbox"
                        [value]="servicio"
                        [checked]="isServiceSelected(servicio)"
                        (change)="toggleService(servicio, $event)"
                        class="rounded border-gray-300 text-primary focus:ring-primary focus:ring-opacity-50"
                      />
                      <span class="ml-2 text-sm text-ink">{{ servicio }}</span>
                    </label>
                  </div>
                </div>

                <div class="flex space-x-2">
                  <app-button type="submit" variant="primary" fullWidth [loading]="loading">
                    Buscar
                  </app-button>
                  <app-button type="button" variant="ghost" (clicked)="clearFilters()">
                    Limpiar
                  </app-button>
                </div>
              </form>
            </app-card>
          </div>

          <!-- Results -->
          <div class="lg:col-span-3 mt-8 lg:mt-0">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h1 class="text-2xl font-bold text-ink">Alojamientos disponibles</h1>
                <p class="text-gray-600 mt-1" *ngIf="!loading">
                  {{ totalResults }} resultados encontrados
                </p>
              </div>

              <!-- Map toggle -->
              <app-button variant="outline" (clicked)="toggleMap()">
                {{ showMap ? 'Ocultar mapa' : 'Mostrar mapa' }}
              </app-button>
            </div>

            <!-- Map -->
            <div *ngIf="showMap" class="mb-8">
              <app-card>
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-75.6,3.5,-75.9,4.9&layer=mapnik&marker=4.5327777777778,-75.6725"
                  class="w-full h-64 rounded-xl"
                  frameborder="0"
                  title="Mapa de alojamientos"
                ></iframe>
              </app-card>
            </div>

            <!-- Loading state -->
            <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div *ngFor="let item of [1,2,3,4,5,6]" class="animate-pulse">
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

            <!-- Results grid -->
            <div *ngIf="!loading && listings.length > 0" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <app-card *ngFor="let listing of listings" class="group cursor-pointer hover:shadow-medium transition-all duration-200" (click)="goToListing(listing.id)">
                  <div class="space-y-4">
                    <!-- Image -->
                    <div class="aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                      <img
                        [src]="listing.imagenes[0]?.url"
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
                        <div *ngIf="listing.ratingPromedio" class="flex items-center space-x-1 ml-2">
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span class="text-sm font-medium text-gray-700">{{ listing.ratingPromedio.toFixed(1) }}</span>
                        </div>
                      </div>

                      <p class="text-gray-600 text-sm line-clamp-2">{{ listing.descripcion }}</p>
                      
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                          <app-badge variant="secondary">{{ listing.ciudad }}</app-badge>
                          <span class="text-sm text-gray-500">{{ listing.capacidadMax }} huéspedes</span>
                        </div>
                        <div class="text-right">
                          <p class="text-lg font-bold text-ink">{{ formatPrice(listing.precioNoche) }}</p>
                          <p class="text-sm text-gray-500">por noche</p>
                        </div>
                      </div>

                      <!-- Services -->
                      <div class="flex flex-wrap gap-2">
                        <span
                          *ngFor="let servicio of listing.servicios.slice(0, 3)"
                          class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {{ servicio }}
                        </span>
                        <span
                          *ngIf="listing.servicios.length > 3"
                          class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          +{{ listing.servicios.length - 3 }} más
                        </span>
                      </div>
                    </div>
                  </div>
                </app-card>
              </div>

              <!-- Pagination -->
              <app-pagination
                [currentPage]="currentPage"
                [pageSize]="pageSize"
                [total]="totalResults"
                (pageChange)="onPageChange($event)"
              ></app-pagination>
            </div>

            <!-- No results -->
            <div *ngIf="!loading && listings.length === 0" class="text-center py-12">
              <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-ink mb-2">No se encontraron alojamientos</h3>
              <p class="text-gray-600 mb-6">Intenta ajustar los filtros para obtener más resultados</p>
              <app-button variant="outline" (clicked)="clearFilters()">
                Limpiar filtros
              </app-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  filtersForm: FormGroup;

  private allListings: Listing[] = [];
  private filteredListings: Listing[] = [];
  listings: Listing[] = [];

  loading = true;
  showMap = false;

  currentPage = 1;
  pageSize = 10;
  totalResults = 0;

  private readonly serverPageSize = 500;

  availableServices = ['WiFi', 'Aire acondicionado', 'Cocina equipada', 'TV', 'Parking gratuito', 'Piscina'];

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filtersForm = this.fb.group({
      ciudad: [''],
      fechaInicio: [''],
      fechaFin: [''],
      precioMin: [''],
      precioMax: [''],
      servicios: [[]]
    });
  }

  ngOnInit(): void {
    // Solo leemos los query params una vez para ciudad inicial
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['ciudad']) {
        this.filtersForm.patchValue({ ciudad: params['ciudad'] });
      }
    });

    this.loadFromBackend();
  }

  /** Carga una página grande desde el backend y luego filtra/pagina en memoria */
  private loadFromBackend(): void {
    this.loading = true;
    const filters: SearchFilters = this.filtersForm.value;

    this.listingsService
      .searchListings(filters, 1, this.serverPageSize)
      .subscribe({
        next: (response) => {
          this.allListings = response.items ?? [];
          this.applyFiltersAndPagination();
          this.loading = false;
        },
        error: () => {
          this.allListings = [];
          this.filteredListings = [];
          this.listings = [];
          this.totalResults = 0;
          this.loading = false;
        }
      });
  }

  /** Aplica filtros del formulario y recalcula paginación */
  private applyFiltersAndPagination(): void {
    const filters: SearchFilters = this.filtersForm.value;

    const ciudad = (filters.ciudad ?? '').trim().toLowerCase();

    const rawMin = filters.precioMin;
    const rawMax = filters.precioMax;

    let precioMin: number | null = null;
    let precioMax: number | null = null;

    if (rawMin !== undefined && rawMin !== null && rawMin !== '') {
      const n = Number(rawMin);
      precioMin = Number.isNaN(n) ? null : n;
    }

    if (rawMax !== undefined && rawMax !== null && rawMax !== '') {
      const n = Number(rawMax);
      precioMax = Number.isNaN(n) ? null : n;
    }

    const servicios: string[] = Array.isArray(filters.servicios)
      ? filters.servicios
      : [];

    let result = [...this.allListings];

    // ciudad
    if (ciudad) {
      result = result.filter(l =>
        (l.ciudad ?? '').toLowerCase().includes(ciudad)
      );
    }

    // precio mínimo
    if (precioMin !== null) {
      result = result.filter(l => l.precioNoche >= precioMin!);
    }

    // precio máximo
    if (precioMax !== null) {
      result = result.filter(l => l.precioNoche <= precioMax!);
    }

    // servicios
    if (servicios.length > 0) {
      result = result.filter(l => {
        const srv = (l.servicios ?? []).map(s => s.toLowerCase());
        return servicios.every(s =>
          srv.includes(String(s).toLowerCase())
        );
      });
    }

    // Nota: los filtros de fecha se aplican en el backend (SearchFilters.fechaInicio / fechaFin)


    this.filteredListings = result;
    this.totalResults = result.length;

    const maxPage = Math.max(1, Math.ceil(this.totalResults / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.listings = this.filteredListings.slice(start, end);
  }

  /** submit del form */
  onSubmitFilters(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      ciudad: '',
      fechaInicio: '',
      fechaFin: '',
      precioMin: '',
      precioMax: '',
      servicios: []
    });
    this.currentPage = 1;
    this.loadFromBackend();
  }



  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFiltersAndPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMap(): void {
    this.showMap = !this.showMap;
  }

  goToListing(id: string): void {
    this.router.navigate(['/alojamientos', id]);
  }

  isServiceSelected(service: string): boolean {
    const servicios = this.filtersForm.get('servicios')?.value || [];
    return servicios.includes(service);
  }

  toggleService(service: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const servicios = this.filtersForm.get('servicios')?.value || [];

    if (target.checked) {
      this.filtersForm.patchValue({
        servicios: [...servicios, service]
      });
    } else {
      this.filtersForm.patchValue({
        servicios: servicios.filter((s: string) => s !== service)
      });
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadFromBackend();
  }

  formatPrice = formatPrice;
}