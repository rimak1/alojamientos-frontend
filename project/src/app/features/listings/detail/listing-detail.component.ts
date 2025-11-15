import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { GalleryComponent } from '../../../shared/ui/gallery/gallery.component';
import { ListingsService } from '../../../core/services/listings.service';
import { BookingsService } from '../../../core/services/bookings.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatPrice, formatDate, getDaysDifference } from '../../../core/utils/validation.utils';
import type { Listing } from '../../../core/models/listing.model';
import type { Review } from '../../../core/models/review.model';
import type { CreateReviewRequest } from '../../../core/models/review.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-listing-detail',
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
    GalleryComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen" *ngIf="listing; else loading">
      <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <a routerLink="/" class="hover:text-primary transition-colors duration-200">Inicio</a>
          <span>/</span>
          <a routerLink="/buscar" class="hover:text-primary transition-colors duration-200">Buscar</a>
          <span>/</span>
          <span class="text-ink">{{ listing.titulo }}</span>
        </nav>

        <div class="lg:grid lg:grid-cols-3 lg:gap-8">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Title and rating -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-ink mb-2">{{ listing.titulo }}</h1>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{{ listing.ciudad }}</span>
                  <span>•</span>
                  <span>Hasta {{ listing.capacidadMax }} huéspedes</span>
                  <div *ngIf="listing.ratingPromedio" class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span>{{ listing.ratingPromedio.toFixed(1) }} ({{ reviews.length }} reseñas)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gallery -->
            <app-gallery [images]="listing.imagenes" [alt]="listing.titulo" [showCounter]="true"></app-gallery>

            <!-- Description -->
            <app-card title="Descripción">
              <p class="text-gray-700 leading-relaxed">{{ listing.descripcion }}</p>
            </app-card>

            <!-- Services -->
            <app-card title="Servicios incluidos">
              <div class="grid grid-cols-2 gap-4">
                <div *ngFor="let servicio of listing.servicios" class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-ink">{{ servicio }}</span>
                </div>
              </div>
            </app-card>

            <!-- Location -->
<app-card title="Ubicación">
  <p class="text-gray-700 mb-4">{{ listing.direccion }}, {{ listing.ciudad }}</p>

  <ng-container *ngIf="mapUrl; else noMap">
    <iframe
      [src]="mapUrl"
      class="w-full h-64 rounded-xl"
      frameborder="0"
      title="Ubicación del alojamiento"
    ></iframe>
  </ng-container>

  <ng-template #noMap>
    <p class="text-sm text-gray-500">
      No hay información suficiente de ubicación para mostrar el mapa.
    </p>
  </ng-template>
</app-card>


            <!-- Reviews -->
            <app-card [title]="'Reseñas (' + reviews.length + ')'">
              <div *ngIf="reviews.length > 0; else noReviews" class="space-y-6">
                <div *ngFor="let review of reviews" class="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                  <div class="flex items-start space-x-4">
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {{ review.usuario?.nombre?.[0]?.toUpperCase() || 'U' }}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-2">
                        <h4 class="font-medium text-ink">{{ review.usuario?.nombre || 'Usuario' }}</h4>
                        <app-star-rating [rating]="review.rating" [readonly]="true" size="sm"></app-star-rating>
                      </div>
                      
                      <p class="text-gray-700 mb-2">{{ review.texto }}</p>
                      <p class="text-sm text-gray-500">{{ formatDate(review.fecha) }}</p>
                      
                      <div *ngIf="review.respuestaAnfitrion" class="mt-4 ml-4 p-3 bg-gray-50 rounded-xl">
                        <p class="text-sm text-gray-700">
                          <span class="font-medium">Respuesta del anfitrión:</span>
                          {{ review.respuestaAnfitrion }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noReviews>
                <div class="text-center py-8">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <p class="text-gray-600">Aún no hay reseñas para este alojamiento</p>
                </div>
              </ng-template>
              <hr class="my-6 border-gray-100">

<div *ngIf="canReview; else loginToReview">
  <h4 class="text-lg font-semibold text-ink mb-4">Deja tu reseña</h4>

  <form [formGroup]="reviewForm" (ngSubmit)="onSubmitReview()" class="space-y-4">
  <!-- Dentro del formulario de reseña -->
<div class="space-y-2">
  <label class="block text-sm font-medium text-ink mb-1">Tu valoración</label>
  <app-star-rating
    [rating]="reviewForm.get('rating')?.value"
    (ratingChange)="reviewForm.get('rating')?.setValue($event)"
  ></app-star-rating>
</div>

    <div>
      <label class="block text-sm font-medium text-ink mb-2">Puntuación</label>
      <select
        formControlName="rating"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option *ngFor="let r of [1,2,3,4,5]" [value]="r">{{ r }} estrella(s)</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-ink mb-2">Comentario</label>
      <textarea
        formControlName="texto"
        rows="4"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Cuenta tu experiencia..."
      ></textarea>
    </div>

    <app-button
      type="submit"
      variant="primary"
      [disabled]="reviewForm.invalid || submittingReview"
      [loading]="submittingReview"
    >
      Enviar reseña
    </app-button>
  </form>
</div>

<ng-template #loginToReview>
  <p class="text-sm text-gray-600 mt-4">
    Inicia sesión como huésped para dejar una reseña.
  </p>
</ng-template>

            </app-card>
          </div>

          <!-- Booking sidebar -->
          <div class="lg:col-span-1 mt-8 lg:mt-0">
            <div class="sticky top-4">
              <app-card>
                <div class="text-center mb-6">
                  <div class="text-3xl font-bold text-ink">{{ formatPrice(listing.precioNoche) }}</div>
                  <div class="text-sm text-gray-600">por noche</div>
                </div>

                <form [formGroup]="bookingForm" (ngSubmit)="onBooking()" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <app-input
                      label="Check-in"
                      type="date"
                      formControlName="checkIn"
                      [errorMessage]="getFieldError('checkIn')"
                      required
                    ></app-input>
                    <app-input
                      label="Check-out"
                      type="date"
                      formControlName="checkOut"
                      [errorMessage]="getFieldError('checkOut')"
                      required
                    ></app-input>
                  </div>

                  <app-input
                    label="Huéspedes"
                    type="number"
                    [placeholder]="'Máximo ' + listing.capacidadMax"
                    formControlName="huespedes"
                    [errorMessage]="getFieldError('huespedes')"
                    required
                  ></app-input>

                  <!-- Price calculation -->
                  <div *ngIf="totalPrice > 0" class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                      <span>{{ formatPrice(listing.precioNoche) }} × {{ totalNights }} noches</span>
                      <span>{{ formatPrice(listing.precioNoche * totalNights) }}</span>
                    </div>
                    <hr class="border-gray-200">
                    <div class="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{{ formatPrice(totalPrice) }}</span>
                    </div>
                  </div>

                  <app-button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    [disabled]="bookingForm.invalid || !isAuthenticated"
                    [loading]="bookingLoading"
                  >
                    {{ isAuthenticated ? 'Reservar' : 'Inicia sesión para reservar' }}
                  </app-button>
                </form>

                <!-- Calendar availability -->
                <div class="mt-6 pt-6 border-t border-gray-100">
                  <h4 class="font-medium text-ink mb-4">Disponibilidad</h4>
                  <div class="bg-gray-50 rounded-xl p-4">
                    <p class="text-sm text-gray-600 text-center">
                      Calendario simplificado<br>
                      <span class="text-red-500">●</span> Ocupado
                      <span class="ml-4 text-green-500">●</span> Disponible
                    </p>
                    <!-- Simple calendar placeholder -->
                    <div class="grid grid-cols-7 gap-1 mt-4 text-xs">
                      <div *ngFor="let day of calendarDays" 
                           [class]="getCalendarDayClasses(day)"
                           class="h-8 flex items-center justify-center rounded">
                        {{ day.day }}
                      </div>
                    </div>
                  </div>
                </div>
              </app-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <app-header></app-header>
      <div class="bg-base min-h-screen">
        <div class="container mx-auto px-4 py-8">
          <div class="animate-pulse space-y-8">
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
            <div class="aspect-video w-full bg-gray-200 rounded-2xl"></div>
            <div class="space-y-4">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  reviews: Review[] = [];
  bookingForm: FormGroup;
  bookingLoading = false;
  occupiedDates: string[] = [];
  calendarDays: any[] = [];
  reviewForm: FormGroup;
  submittingReview = false;
  reservaId: string | null = null;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listingsService: ListingsService,
    private bookingsService: BookingsService,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer


  ) {
    this.bookingForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      huespedes: [1, [Validators.required, Validators.min(1)]]
    });
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      texto: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  mapUrl: SafeResourceUrl | null = null;

  get canReview(): boolean {
    const user = this.authService.getCurrentUser();

    if (!user || !this.listing) return false;

    // Solo huéspedes, no el anfitrión del alojamiento
    return user.rol === 'USUARIO' && String(user.id) !== this.listing.anfitrionId;
  }



  ngOnInit(): void {
    const listingId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe(params => {
      this.reservaId = params['reservaId'] ?? null;
    });

    if (listingId) {
      this.loadListing(listingId);
      this.loadReviews(listingId);
      this.loadOccupiedDates(listingId);
    }

    this.generateCalendar();
  }


  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get totalNights(): number {
    const checkIn = this.bookingForm.get('checkIn')?.value;
    const checkOut = this.bookingForm.get('checkOut')?.value;

    if (checkIn && checkOut) {
      return getDaysDifference(checkIn, checkOut);
    }
    return 0;
  }

  get totalPrice(): number {
    if (this.listing && this.totalNights > 0) {
      return this.listing.precioNoche * this.totalNights;
    }
    return 0;
  }

loadListing(id: string): void {
  this.listingsService.getListingById(id).subscribe(listing => {
    this.listing = listing;

    // Validar que lat/lng sean válidos
    const lat = Number(listing.lat);
    const lng = Number(listing.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      this.mapUrl = null;
    } else {
      const delta = 0.01;
      const bbox = [
        lng - delta,
        lat - delta,
        lng + delta,
        lat + delta
      ].join(',');

      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    this.bookingForm.get('huespedes')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(listing.capacidadMax)
    ]);
  });
}


  loadReviews(alojamientoId: string): void {
    this.reviewsService.getListingReviews(alojamientoId).subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  loadOccupiedDates(alojamientoId: string): void {
    this.bookingsService.getOccupiedDates(alojamientoId).subscribe((dates: string[]) => {
      this.occupiedDates = dates;
      this.generateCalendar();
    });
  }

  onBooking(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.bookingForm.valid && this.listing && !this.bookingLoading) {
      this.bookingLoading = true;

      const bookingData = {
        alojamientoId: this.listing.id,
        ...this.bookingForm.value
      };

      this.bookingsService.createBooking(bookingData).subscribe({
        next: (booking) => {
          this.bookingLoading = false;
          this.toastService.showSuccess('¡Reserva creada exitosamente!');
          this.router.navigate(['/reservas']);
        },
        error: (error) => {
          this.bookingLoading = false;
          this.toastService.showError('Error al crear la reserva');
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['min']) return `Mínimo ${field.errors['min'].min}`;
      if (field.errors['max']) return `Máximo ${field.errors['max'].max} huéspedes`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      huespedes: 'Huéspedes'
    };
    return labels[fieldName] || fieldName;
  }

  private generateCalendar(): void {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    this.calendarDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];

      this.calendarDays.push({
        day,
        dateString,
        isOccupied: this.occupiedDates.includes(dateString),
        isPast: date < today
      });
    }
  }

  getCalendarDayClasses(day: any): string {
    const baseClasses = 'h-8 flex items-center justify-center rounded text-xs';

    if (day.isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400`;
    }

    if (day.isOccupied) {
      return `${baseClasses} bg-red-100 text-red-600`;
    }

    return `${baseClasses} bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer`;
  }
  onSubmitReview(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirectTo: this.router.url }
      });
      return;
    }

    if (!this.listing) {
      this.toastService.showError('Alojamiento no cargado');
      return;
    }

    if (!this.reservaId) {
      this.toastService.showError('No se encontró la reserva asociada para valorar');
      return;
    }

    if (this.reviewForm.invalid || this.submittingReview) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.submittingReview = true;

    const formValue = this.reviewForm.value;

    const payload: CreateReviewRequest = {
      alojamientoId: this.listing.id,
      reservaId: this.reservaId,       // 👈 AHORA SÍ
      rating: formValue.rating,
      texto: formValue.texto
    };

    this.reviewsService.createReview(payload).subscribe({
      next: (review: Review) => {
        this.submittingReview = false;
        this.toastService.showSuccess('¡Gracias por tu reseña!');

        // meter la nueva reseña en la lista
        this.reviews = [review, ...this.reviews];

        // recalcular rating promedio
        if (this.listing) {
          const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
          this.listing.ratingPromedio = total / this.reviews.length;
        }

        this.reviewForm.reset({ rating: 5, texto: '' });
      },
      error: (err) => {
        console.error(err);
        this.submittingReview = false;
        this.toastService.showError('No se pudo enviar la reseña');
      }
    });
  }



  formatPrice = formatPrice;
  formatDate = formatDate;
}