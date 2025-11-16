import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { formatPrice } from '../../../core/utils/validation.utils';
import { MetricsService, type MetricData } from '../../../core/services/metrics.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingsService } from '../../../core/services/bookings.service';
import { ListingsService } from '../../../core/services/listings.service';
import type { Listing } from '../../../core/models/listing.model';
import type { Booking } from '../../../core/models/booking.model';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-host-metrics',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    HeaderComponent, 
    ButtonComponent,
    FormsModule,  
    CardComponent],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto space-y-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-ink">Métricas y Estadísticas</h1>
            <p class="text-gray-600 mt-2">Analiza el rendimiento de tus alojamientos</p>
          </div>

                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-ink">Métricas y Estadísticas</h1>
              <p class="text-gray-600 mt-2">
                Analiza el rendimiento de tus alojamientos
              </p>
            </div>

            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-ink">Alojamiento</label>
             <select
  class="px-4 py-2 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
  [(ngModel)]="selectedAccommodationId"
  (ngModelChange)="onAccommodationChange($event)"
  [ngModelOptions]="{ standalone: true }"
>
  <option value="">Todos mis alojamientos</option>
  <option *ngFor="let a of myAccommodations" [ngValue]="a.id">
    {{ a.titulo }}
  </option>
</select>

            </div>
          </div>

          <app-card title="Filtros de fecha">
            <form [formGroup]="dateForm" (ngSubmit)="onSubmitFilters()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Desde</label>
                <input type="date" formControlName="desde"
                       class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink mb-2">Hasta</label>
                <input type="date" formControlName="hasta"
                       class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" />
              </div>
              <div class="flex items-end">
                <app-button type="submit" variant="primary" fullWidth [loading]="loading">
                  Actualizar métricas
                </app-button>
              </div>
            </form>
          </app-card>

          <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let item of [1,2,3,4]" class="animate-pulse">
              <app-card>
                <div class="space-y-4">
                  <div class="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </app-card>
            </div>
          </div>

          <div *ngIf="!loading && metrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <app-card class="text-center">
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto bg-primary bg-opacity-10 rounded-2xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 9a3 3 0 100-6 3 3 0 000 6z"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-600">Total Reservas</h3>
                <p class="text-2xl font-bold text-ink">{{ metrics.totalReservas }}</p>
              </div>
            </app-card>

            <app-card class="text-center">
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto bg-secondary bg-opacity-10 rounded-2xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-600">Ingresos Totales</h3>
                <p class="text-2xl font-bold text-ink">{{ formatPrice(metrics.ingresosTotales) }}</p>
              </div>
            </app-card>

            <app-card class="text-center">
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-600">Rating Promedio</h3>
                <p class="text-2xl font-bold text-ink">{{ metrics.ratingPromedio.toFixed(1) }}</p>
              </div>
            </app-card>

            <app-card class="text-center">
              <div class="space-y-2">
                <div class="w-12 h-12 mx-auto bg-accent bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-600">Ocupación</h3>
                <p class="text-2xl font-bold text-ink">{{ metrics.ocupacionPromedio.toFixed(0) }}%</p>
              </div>
            </app-card>
          </div>

          <app-card title="Reservas por mes" *ngIf="!loading && metrics">
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let monthData of metrics.reservasPorMes" class="bg-gray-50 rounded-xl p-4 text-center">
                  <h4 class="font-medium text-ink mb-2">{{ monthData.mes }}</h4>
                  <div class="space-y-1">
                    <p class="text-lg font-bold text-primary">{{ monthData.reservas }} reservas</p>
                    <p class="text-sm text-gray-600">{{ formatPrice(monthData.ingresos) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class HostMetricsComponent implements OnInit {
  dateForm: FormGroup;
  metrics: MetricData | null = null;
  loading = true;
  myAccommodations: Listing[] = [];
  selectedAccommodationId: string = ''; // '' = todos

  constructor(
    private fb: FormBuilder,
    private metricsService: MetricsService,
    private toast: ToastService,
    private bookingsService: BookingsService,
    private listingsService: ListingsService
  ) {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

    this.dateForm = this.fb.group({
      desde: [threeMonthsAgo.toISOString().split('T')[0]],
      hasta: [today.toISOString().split('T')[0]]
    });
  }

  ngOnInit(): void {
    this.loadMyAccommodations();
    this.loadMetrics();
  }
  private loadMyAccommodations(): void {
    // Traemos hasta 100 alojamientos del host
    this.listingsService.getHostListings(1, 100).subscribe({
      next: (page) => {
        this.myAccommodations = page.items ?? [];
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('No se pudieron cargar tus alojamientos');
      }
    });
  }

  loadMetrics(): void {
    this.loading = true;
    const { desde, hasta } = this.dateForm.value;

    this.metricsService.getHostMetrics(desde, hasta).subscribe({
      next: (m) => {
        this.metrics = m;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('No se pudieron cargar las métricas');
        this.loading = false;
      }
    });
  }
  onAccommodationChange(newValue: string | number): void {
  // Normalizamos a string
  this.selectedAccommodationId = String(newValue || '');

  if (!this.selectedAccommodationId) {
    // Sin filtro → métricas globales (backend)
    this.loadMetrics();
  } else {
    // Filtro por alojamiento → métricas calculadas en frontend
    this.loadMetricsForAccommodation(this.selectedAccommodationId);
  }
}

  private loadMetricsForAccommodation(accommodationId: string): void {
    this.loading = true;
    const { desde, hasta } = this.dateForm.value;

    forkJoin({
      bookings: this.bookingsService.getByAccommodation(accommodationId),
      listing: this.listingsService.getListingById(accommodationId),
      rating: this.listingsService.getAverageRating(accommodationId)
        .pipe(catchError(() => of(0)))  // si falla rating, lo dejamos en 0
    })
      .pipe(
        map(({ bookings, listing, rating }) => {
          // 1) Filtrar por rango de fechas (opcional)
          let filtered = bookings as Booking[];

          if (desde) {
            const from = new Date(desde);
            filtered = filtered.filter(b => new Date(b.checkIn) >= from);
          }

          if (hasta) {
            const to = new Date(hasta);
            filtered = filtered.filter(b => new Date(b.checkOut) <= to);
          }

          const totalReservas = filtered.length;
          const priceNight = listing?.precioNoche ?? 0;

          let totalNochesReservadas = 0;
          let ingresosTotales = 0;
          const byMonth: Record<string, { reservas: number; ingresos: number }> = {};

          filtered.forEach((b) => {
            const start = new Date(b.checkIn);
            const end = new Date(b.checkOut);

            const diffMs = end.getTime() - start.getTime();
            const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

            totalNochesReservadas += nights;
            const totalReserva = nights * priceNight;
            ingresosTotales += totalReserva;

            const mes = start.toISOString().slice(0, 7); // "YYYY-MM"
            byMonth[mes] ??= { reservas: 0, ingresos: 0 };
            byMonth[mes].reservas += 1;
            byMonth[mes].ingresos += totalReserva;
          });

          // 2) Ocupación promedio dentro del rango [desde, hasta]
          let ocupacionPromedio = 0;
          if (desde && hasta) {
            const dFrom = new Date(desde);
            const dTo = new Date(hasta);
            const diffMs = dTo.getTime() - dFrom.getTime();
            const totalDiasPeriodo = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
            ocupacionPromedio = (totalNochesReservadas / totalDiasPeriodo) * 100;
          }

          // 3) Reservas por mes
          const reservasPorMes = Object.entries(byMonth).map(([mes, data]) => ({
            mes,
            reservas: data.reservas,
            ingresos: data.ingresos
          }));

          const metrics: MetricData = {
            totalReservas,
            ingresosTotales,
            ratingPromedio: Number(rating ?? 0),
            ocupacionPromedio,
            reservasPorMes
          };

          return metrics;
        })
      )
      .subscribe({
        next: (m) => {
          this.metrics = m;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.toast.showError('No se pudieron cargar las métricas del alojamiento');
          this.loading = false;
        }
      });
  }
  onSubmitFilters(): void {
    if (!this.selectedAccommodationId) {
      this.loadMetrics();
    } else {
      this.loadMetricsForAccommodation(this.selectedAccommodationId);
    }
  }



  formatPrice = formatPrice;
}
