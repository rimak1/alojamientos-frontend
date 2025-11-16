import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatPrice, formatDateShort, getDaysDifference } from '../../../core/utils/validation.utils';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ListingsService } from '../../../core/services/listings.service';


import type { Booking, BookingFilters } from '../../../core/models/booking.model';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    ModalComponent,
    PaginationComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto space-y-8">
          <!-- Header -->
          <div class="text-center">
            <h1 class="text-3xl font-bold text-ink">Mis Reservas</h1>
            <p class="text-gray-600 mt-2">Historial de todas tus reservas</p>
          </div>

          <!-- Filters -->
          <app-card title="Filtros">
            <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Estado</label>
                <select 
                  formControlName="estado"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="COMPLETADA">Completada</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-ink mb-2">Desde</label>
                <input
                  type="date"
                  formControlName="desde"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-ink mb-2">Hasta</label>
                <input
                  type="date"
                  formControlName="hasta"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              <div class="flex items-end">
                <app-button type="submit" variant="primary" fullWidth>
                  Buscar
                </app-button>
              </div>
            </form>
          </app-card>

          <!-- Loading state -->
          <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let item of [1,2,3,4]" class="animate-pulse">
              <app-card>
                <div class="space-y-4">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-full"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </app-card>
            </div>
          </div>

          <!-- Bookings list -->
          <div *ngIf="!loading && bookings.length > 0" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-card *ngFor="let booking of bookings">
                <div class="space-y-4">
                  <!-- Booking header -->
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-semibold text-ink">{{ booking.alojamiento?.titulo }}</h3>
                      <p class="text-sm text-gray-600">{{ booking.alojamiento?.ciudad }}</p>
                    </div>
                    <app-badge [variant]="getStatusVariant(booking.estado)">
                      {{ getStatusText(booking.estado) }}
                    </app-badge>
                  </div>

                  <!-- Booking details -->
                  <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Check-in</span>
                      <span class="font-medium text-ink">{{ formatDateShort(booking.checkIn) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Check-out</span>
                      <span class="font-medium text-ink">{{ formatDateShort(booking.checkOut) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Huéspedes</span>
                      <span class="font-medium text-ink">{{ booking.huespedes }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Duración</span>
                      <span class="font-medium text-ink">{{ getDaysDifference(booking.checkIn, booking.checkOut) }} noches</span>
                    </div>
                    <hr class="border-gray-200">
                    <div class="flex justify-between font-semibold">
                      <span>Total</span>
                      <span class="text-primary">{{ calculateTotal(booking) }}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-2">
                    <app-button variant="outline" size="sm" [routerLink]="['/alojamientos', booking.alojamientoId]" class="flex-1">
                      Ver alojamiento
                    </app-button>
                    
                    <app-button
                      *ngIf="canCancelBooking(booking)"
                      variant="ghost"
                      size="sm"
                      (clicked)="confirmCancel(booking)"
                    >
                      Cancelar
                    </app-button>
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

          <!-- Empty state -->
          <div *ngIf="!loading && bookings.length === 0" class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 9a3 3 0 100-6 3 3 0 000 6z"></path>
              </svg>
            </div>
            
            <h3 class="text-xl font-semibold text-ink mb-4">No tienes reservas</h3>
            <p class="text-gray-600 mb-8">
              Comienza a explorar alojamientos increíbles
            </p>
            
            <app-button variant="primary" size="lg" routerLink="/buscar">
              Buscar alojamientos
            </app-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <app-modal
      [isOpen]="showCancelModal"
      title="Confirmar cancelación"
      [hasFooter]="true"
      (closed)="showCancelModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de que deseas cancelar la reserva en 
          <strong>"{{ bookingToCancel?.alojamiento?.titulo }}"</strong>?
        </p>
        <p class="text-sm text-gray-600">
          Esta acción no se puede deshacer.
        </p>
      </div>

      <div slot="footer" class="flex justify-end space-x-4">
        <app-button variant="ghost" (clicked)="showCancelModal = false">
          No, mantener reserva
        </app-button>
        <app-button 
          variant="danger" 
          (clicked)="cancelBooking()"
          [loading]="cancelLoading"
        >
          Sí, cancelar reserva
        </app-button>
      </div>
    </app-modal>
  `
})


export class UserBookingsComponent implements OnInit {
  filtersForm: FormGroup;
  bookings: Booking[] = [];
  allBookings: Booking[] = [];
  loading = true;

  currentPage = 1;
  pageSize = 10;
  totalResults = 0;

  showCancelModal = false;
  cancelLoading = false;
  bookingToCancel: Booking | null = null;

  private mapApiToEs(api: string): Booking['estado'] {
    const m: Record<string, Booking['estado']> = {
      PENDING: 'PENDIENTE',
      CONFIRMED: 'CONFIRMADA',
      PAID: 'CONFIRMADA',      // el back puede usar PAID; en UI lo mostramos como confirmada
      CANCELED: 'CANCELADA',
      COMPLETED: 'COMPLETADA'
    };
    return m[api] ?? (api as Booking['estado']);
  }

  private mapEsToApi(es: string): string | undefined {
    const m: Record<Booking['estado'], string> = {
      PENDIENTE: 'PENDING',
      CONFIRMADA: 'CONFIRMED',
      CANCELADA: 'CANCELED',
      COMPLETADA: 'COMPLETED'
    };
    return (es as Booking['estado']) in m ? m[es as Booking['estado']] : undefined;
  }

  constructor(
    private fb: FormBuilder,
    private bookingsService: BookingsService,
    private listingsService: ListingsService,
    private toastService: ToastService
  ) {
    this.filtersForm = this.fb.group({
      estado: [''],
      desde: [''],
      hasta: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;

    // Tomamos los filtros del form, pero solo usaremos estado/fechas en el front
    const f = this.filtersForm.value;
    const estadoApi = f.estado ? this.mapEsToApi(f.estado) : undefined;

    const filters: BookingFilters = {
      ...f,
      estado: estadoApi,   // por si en un futuro el back lo soporta
      propias: true
    };

    // Pedimos una página grande (p.ej. 1000) y paginamos en el front
    this.bookingsService.getBookings(filters, 1, 1000).pipe(
      switchMap((response) => {
        const items = response.items || [];
        if (!items.length) {
          this.allBookings = [];
          this.totalResults = 0;
          return of([] as Booking[]);
        }

        const perItem$ = items.map((b) =>
          forkJoin({
            acc: this.listingsService.getListingById(b.alojamientoId)
              .pipe(catchError(() => of(null))),
            img: this.listingsService.getMainImageUrl(b.alojamientoId)
              .pipe(catchError(() => of('')))
          }).pipe(
            map(({ acc, img }) => {
              const alojamiento = acc
                ? {
                    titulo: acc.titulo,
                    ciudad: acc.ciudad,
                    precioNoche: acc.precioNoche,
                    imagenPrincipal: img || undefined
                  }
                : b.alojamiento; // fallback si algo falla

              return {
                ...b,
                estado: this.mapApiToEs(String(b.estado)), // normaliza a español para la UI
                alojamiento
              } as Booking;
            })
          )
        );

        return forkJoin(perItem$);
      })
    ).subscribe({
      next: (enriched) => {
        this.allBookings = enriched;  
        this.loading = false;
        this.updatePagedBookings();    
      },
      error: (err) => {
        console.error(err);
        this.allBookings = [];
        this.bookings = [];
        this.totalResults = 0;
        this.loading = false;
      }
    });
  }
    /**
   * Aplica los filtros del formulario sobre allBookings
   * y actualiza this.bookings con la página actual.
   */
  private updatePagedBookings(): void {
    const f = this.filtersForm.value;
    const estadoFiltro: Booking['estado'] | '' = f.estado;
    const desdeStr: string | '' = f.desde;
    const hastaStr: string | '' = f.hasta;

    let filtered = [...this.allBookings];

    // Filtro por estado (en español: PENDIENTE, CONFIRMADA, etc.)
    if (estadoFiltro) {
      filtered = filtered.filter(b => b.estado === estadoFiltro);
    }

    // Filtro por fecha "desde" (check-in >= desde)
    if (desdeStr) {
      const desde = new Date(desdeStr);
      filtered = filtered.filter(b => new Date(b.checkIn) >= desde);
    }

    // Filtro por fecha "hasta" (check-out <= hasta)
    if (hastaStr) {
      const hasta = new Date(hastaStr);
      filtered = filtered.filter(b => new Date(b.checkOut) <= hasta);
    }

    // Actualizamos conteo total para el componente de paginación
    this.totalResults = filtered.length;

    // Paginación en memoria
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.bookings = filtered.slice(startIndex, endIndex);
  }




  applyFilters(): void {
    this.currentPage = 1;
    this.updatePagedBookings();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagedBookings();
  }

  canCancelBooking(booking: Booking): boolean {
    if (booking.estado !== 'PENDIENTE' && booking.estado !== 'CONFIRMADA') {
      return false;
    }

    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilCheckIn >= 48;
  }

  confirmCancel(booking: Booking): void {
    this.bookingToCancel = booking;
    this.showCancelModal = true;
  }

  cancelBooking(): void {
    if (this.bookingToCancel && !this.cancelLoading) {
      this.cancelLoading = true;

      this.bookingsService.cancelBooking(this.bookingToCancel.id).subscribe({
        next: () => {
          this.cancelLoading = false;
          this.showCancelModal = false;
          this.toastService.showSuccess('Reserva cancelada exitosamente');
          this.loadBookings();
        },
        error: () => {
          this.cancelLoading = false;
          this.toastService.showError('Error al cancelar la reserva');
        }
      });
    }
  }

  calculateTotal(booking: Booking): string {
    const nights = getDaysDifference(booking.checkIn, booking.checkOut);
    const pricePerNight = booking.alojamiento?.precioNoche || 0;
    return formatPrice(nights * pricePerNight);
  }

  getStatusVariant(estado: Booking['estado']): BadgeComponent['variant'] {
    const variants = {
      'PENDIENTE': 'warning' as const,
      'CONFIRMADA': 'success' as const,
      'CANCELADA': 'error' as const,
      'COMPLETADA': 'info' as const
    };
    return variants[estado] || 'default';
  }

  getStatusText(estado: Booking['estado']): string {
    const texts = {
      'PENDIENTE': 'Pendiente',
      'CONFIRMADA': 'Confirmada',
      'CANCELADA': 'Cancelada',
      'COMPLETADA': 'Completada'
    };
    return texts[estado] || estado;
  }

  formatPrice = formatPrice;
  formatDateShort = formatDateShort;
  getDaysDifference = getDaysDifference;
}