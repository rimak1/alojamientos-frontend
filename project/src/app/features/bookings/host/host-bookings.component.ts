import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';

import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';

import { formatPrice, formatDateShort, getDaysDifference } from '../../../core/utils/validation.utils';
import type { Booking, BookingFilters } from '../../../core/models/booking.model';

// ✅ Debe coincidir EXACTAMENTE con el @Input() variant del BadgeComponent
type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

@Component({
  selector: 'app-host-bookings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    PaginationComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto space-y-8">
          <!-- Header -->
          <div class="text-center">
            <h1 class="text-3xl font-bold text-ink">Reservas de mis Alojamientos</h1>
            <p class="text-gray-600 mt-2">Gestiona las reservas de tus propiedades</p>
          </div>

          <!-- View toggle -->
          <div class="flex justify-center">
            <div class="bg-white rounded-2xl p-1 shadow-soft">
              <app-button
                [variant]="viewMode === 'list' ? 'primary' : 'ghost'"
                size="sm"
                (clicked)="setViewMode('list')"
              >
                Lista
              </app-button>
              <app-button
                [variant]="viewMode === 'calendar' ? 'primary' : 'ghost'"
                size="sm"
                (clicked)="setViewMode('calendar')"
              >
                Calendario
              </app-button>
            </div>
          </div>

          <!-- List view -->
          <div *ngIf="viewMode === 'list'">
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
                    <!-- Guest info -->
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-ink">{{ booking.usuario?.nombre || 'Huésped' }}</h3>
                        <p class="text-sm text-gray-600">{{ booking.usuario?.email }}</p>
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
                      <hr class="border-gray-200">
                      <div class="flex justify-between font-semibold">
                        <span>Ingresos</span>
                        <span class="text-primary">{{ calculateTotal(booking) }}</span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-2">
                      <app-button 
                        *ngIf="booking.estado === 'PENDIENTE'"
                        variant="primary"
                        size="sm"
                        class="flex-1"
                        (clicked)="confirmBooking(booking)"
                      >
                        Confirmar
                      </app-button>
                      
                      <app-button 
                        variant="outline" 
                        size="sm" 
                        class="flex-1"
                        (clicked)="contactGuest(booking)"
                      >
                        Contactar
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
              
              <h3 class="text-xl font-semibold text-ink mb-4">No hay reservas</h3>
              <p class="text-gray-600">
                Las reservas aparecerán aquí cuando los huéspedes reserven tus alojamientos
              </p>
            </div>
          </div>

          <!-- Calendar view -->
          <div *ngIf="viewMode === 'calendar'">
            <app-card title="Vista de calendario">
              <div class="bg-gray-50 rounded-xl p-8">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 9a3 3 0 100-6 3 3 0 000 6z"></path>
                  </svg>
                  <h3 class="text-lg font-semibold text-ink mb-2">Calendario de reservas</h3>
                  <p class="text-gray-600">Vista mensual con todas las reservas de tus alojamientos</p>
                </div>
                
                <!-- Simple calendar placeholder -->
                <div class="mt-8 grid grid-cols-7 gap-2 text-center text-sm">
                  <div *ngFor="let day of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" class="p-2 font-semibold text-gray-600">
                    {{ day }}
                  </div>
                  <div *ngFor="let day of Array(31).fill(0); let i = index" class="p-2 h-10 rounded border hover:bg-accent transition-colors duration-200">
                    {{ i + 1 }}
                  </div>
                </div>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HostBookingsComponent implements OnInit {
  filtersForm: FormGroup;
  bookings: Booking[] = [];
  loading = true;
  viewMode: 'list' | 'calendar' = 'list';
  
  currentPage = 1;
  pageSize = 10;
  totalResults = 0;

  constructor(
    private fb: FormBuilder,
    private bookingsService: BookingsService,
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
    const filters: BookingFilters = {
      ...this.filtersForm.value,
      anfitrion: true
    };

    this.bookingsService.getBookings(filters, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.bookings = response.items;
        this.totalResults = response.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('No se pudieron cargar las reservas');
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  setViewMode(mode: 'list' | 'calendar'): void {
    this.viewMode = mode;
  }

  confirmBooking(_booking: Booking): void {
    // Aquí iría la llamada a servicio para confirmar.
    this.toastService.showSuccess('Reserva confirmada');
  }

  contactGuest(_booking: Booking): void {
    this.toastService.showInfo('Función de contacto no implementada');
  }

  calculateTotal(booking: Booking): string {
    const nights = getDaysDifference(booking.checkIn, booking.checkOut);
    const pricePerNight = booking.alojamiento?.precioNoche || 0;
    return formatPrice(nights * pricePerNight);
  }

  getStatusVariant(estado: Booking['estado']): BadgeVariant {
    const variants: Record<Booking['estado'], BadgeVariant> = {
      PENDIENTE: 'warning',
      CONFIRMADA: 'success',
      CANCELADA: 'error',
      COMPLETADA: 'info'
    };
    return variants[estado] ?? 'default';
  }

  getStatusText(estado: Booking['estado']): string {
    const texts: Record<Booking['estado'], string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      COMPLETADA: 'Completada'
    };
    return texts[estado] || estado;
  }

  // Exponer utils al template
  formatPrice = formatPrice;
  formatDateShort = formatDateShort;

  // Para el *ngFor del placeholder del calendario
  Array = Array;
}
