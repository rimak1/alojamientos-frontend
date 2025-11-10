import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HeaderComponent } from '../../../shared/layout/header/header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ListingsService } from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Listing, ImagenListing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <app-header></app-header>

    <div class="bg-base min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-ink">
              {{ isEditMode ? 'Editar Alojamiento' : 'Nuevo Alojamiento' }}
            </h1>
            <p class="text-gray-600 mt-2">
              {{ isEditMode ? 'Actualiza la información de tu propiedad' : 'Comparte tu espacio con viajeros' }}
            </p>
          </div>

          <form [formGroup]="listingForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <!-- Basic information -->
            <app-card title="Información básica">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <app-input
                    label="Título"
                    type="text"
                    placeholder="Ej: Apartamento moderno en el centro"
                    formControlName="titulo"
                    [errorMessage]="getFieldError('titulo')"
                    required
                  ></app-input>
                </div>

                <app-input
                  label="Ciudad"
                  type="text"
                  placeholder="Madrid"
                  formControlName="ciudad"
                  [errorMessage]="getFieldError('ciudad')"
                  required
                ></app-input>

                <app-input
                  label="Precio por noche (€)"
                  type="number"
                  placeholder="50"
                  formControlName="precioNoche"
                  [errorMessage]="getFieldError('precioNoche')"
                  required
                ></app-input>

                <div class="md:col-span-2">
                  <app-input
                    label="Dirección completa"
                    type="text"
                    placeholder="Calle Mayor 123"
                    formControlName="direccion"
                    [errorMessage]="getFieldError('direccion')"
                    required
                  ></app-input>
                </div>

                <app-input
                  label="Latitud"
                  type="number"
                  placeholder="40.4168"
                  formControlName="lat"
                  [errorMessage]="getFieldError('lat')"
                  hint="Coordenada geográfica"
                  required
                ></app-input>

                <app-input
                  label="Longitud"
                  type="number"
                  placeholder="-3.7038"
                  formControlName="lng"
                  [errorMessage]="getFieldError('lng')"
                  hint="Coordenada geográfica"
                  required
                ></app-input>

                <app-input
                  label="Capacidad máxima"
                  type="number"
                  placeholder="4"
                  formControlName="capacidadMax"
                  [errorMessage]="getFieldError('capacidadMax')"
                  hint="Número máximo de huéspedes"
                  required
                ></app-input>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-ink mb-2">
                    Descripción <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    formControlName="descripcion"
                    placeholder="Describe tu alojamiento, sus características y lo que lo hace especial..."
                    rows="5"
                    class="w-full px-4 py-3 rounded-xl border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
                  ></textarea>
                  <div *ngIf="getFieldError('descripcion')" class="text-sm text-red-600 mt-1">
                    {{ getFieldError('descripcion') }}
                  </div>
                </div>
              </div>
            </app-card>

            <!-- Services -->
            <app-card title="Servicios incluidos">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label *ngFor="let servicio of availableServices" class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    [checked]="isServiceSelected(servicio)"
                    (change)="toggleService(servicio, $event)"
                    class="rounded border-gray-300 text-primary focus:ring-primary focus:ring-opacity-50"
                  />
                  <span class="text-sm text-ink">{{ servicio }}</span>
                </label>
              </div>
            </app-card>

            <!-- Images -->
            <app-card title="Imágenes">
              <div class="space-y-4">
                <p class="text-sm text-gray-600">Añade entre 1 y 10 imágenes de tu alojamiento</p>
                
                <div formArrayName="imagenes" class="space-y-4">
                  <div 
                    *ngFor="let imageControl of imagenesFormArray.controls; let i = index" 
                    class="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
                    [formGroupName]="i"
                  >
                    <div class="flex-1">
                      <app-input
                        [label]="'URL de imagen ' + (i + 1)"
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        formControlName="url"
                        [errorMessage]="getImageFieldError(i, 'url')"
                        required
                      ></app-input>
                    </div>

                    <div class="flex items-center space-x-2">
                      <label class="flex items-center space-x-2">
                        <input
                          type="radio"
                          [name]="'principal-' + i"
                          [checked]="imageControl.get('principal')?.value"
                          (change)="setPrincipalImage(i)"
                          class="text-primary focus:ring-primary"
                        />
                        <span class="text-sm text-ink">Principal</span>
                      </label>
                      
                      <app-button
                        *ngIf="imagenesFormArray.length > 1"
                        type="button"
                        variant="ghost"
                        size="sm"
                        (clicked)="removeImage(i)"
                        aria-label="Eliminar imagen"
                      >
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </app-button>
                    </div>
                  </div>
                </div>

                <app-button
                  *ngIf="imagenesFormArray.length < 10"
                  type="button"
                  variant="outline"
                  (clicked)="addImage()"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Añadir imagen
                </app-button>
              </div>
            </app-card>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row sm:justify-end gap-4">
              <app-button 
                type="button" 
                variant="ghost" 
                (clicked)="router.navigate(['/anfitrion/alojamientos'])"
              >
                Cancelar
              </app-button>
              
              <app-button
                type="submit"
                variant="primary"
                size="lg"
                [disabled]="listingForm.invalid || !hasValidImages"
                [loading]="loading"
              >
                {{ isEditMode ? 'Actualizar alojamiento' : 'Crear alojamiento' }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ListingFormComponent implements OnInit {
  listingForm: FormGroup;
  loading = false;
  isEditMode = false;
  listingId?: string;
  availableServices = [
    'WiFi', 'Aire acondicionado', 'Cocina equipada', 'TV', 
    'Lavadora', 'Parking gratuito', 'Jardín', 'Piscina',
    'Gimnasio', 'Spa', 'Barbacoa', 'Terraza'
  ];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private listingsService: ListingsService,
    private toastService: ToastService
  ) {
    this.listingForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10)]],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      lat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      lng: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      precioNoche: ['', [Validators.required, Validators.min(1)]],
      capacidadMax: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      servicios: [[]],
      imagenes: this.fb.array([])
    });

    this.addImage(); // Start with one image field
  }

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.listingId;

    if (this.isEditMode && this.listingId) {
      this.loadListing(this.listingId);
    }
  }

  get imagenesFormArray(): FormArray {
    return this.listingForm.get('imagenes') as FormArray;
  }

  get hasValidImages(): boolean {
    const images = this.imagenesFormArray.controls;
    return images.length >= 1 && images.some(img => img.get('principal')?.value);
  }

  loadListing(id: string): void {
    this.listingsService.getListingById(id).subscribe(listing => {
      // Clear existing images
      while (this.imagenesFormArray.length) {
        this.imagenesFormArray.removeAt(0);
      }

      // Add listing images
      listing.imagenes.forEach(imagen => {
        this.imagenesFormArray.push(this.fb.group({
          url: [imagen.url, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
          principal: [imagen.principal]
        }));
      });

      this.listingForm.patchValue({
        titulo: listing.titulo,
        descripcion: listing.descripcion,
        ciudad: listing.ciudad,
        direccion: listing.direccion,
        lat: listing.lat,
        lng: listing.lng,
        precioNoche: listing.precioNoche,
        capacidadMax: listing.capacidadMax,
        servicios: listing.servicios
      });
    });
  }

  addImage(): void {
    if (this.imagenesFormArray.length < 10) {
      const isPrincipal = this.imagenesFormArray.length === 0;
      this.imagenesFormArray.push(this.fb.group({
        url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
        principal: [isPrincipal]
      }));
    }
  }

  removeImage(index: number): void {
    if (this.imagenesFormArray.length > 1) {
      const wasMain = this.imagenesFormArray.at(index).get('principal')?.value;
      this.imagenesFormArray.removeAt(index);
      
      // If we removed the main image, set the first one as main
      if (wasMain && this.imagenesFormArray.length > 0) {
        this.setPrincipalImage(0);
      }
    }
  }

  setPrincipalImage(index: number): void {
    this.imagenesFormArray.controls.forEach((control, i) => {
      control.get('principal')?.setValue(i === index);
    });
  }

  isServiceSelected(service: string): boolean {
    const servicios = this.listingForm.get('servicios')?.value || [];
    return servicios.includes(service);
  }

  toggleService(service: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const servicios = this.listingForm.get('servicios')?.value || [];
    
    if (target.checked) {
      this.listingForm.patchValue({ 
        servicios: [...servicios, service] 
      });
    } else {
      this.listingForm.patchValue({ 
        servicios: servicios.filter((s: string) => s !== service) 
      });
    }
  }

  onSubmit(): void {
    if (this.listingForm.valid && this.hasValidImages && !this.loading) {
      this.loading = true;
      
      const formData = { ...this.listingForm.value };
      
      const observable = this.isEditMode && this.listingId
        ? this.listingsService.updateListing({ id: this.listingId, ...formData })
        : this.listingsService.createListing(formData);

      observable.subscribe({
        next: (listing) => {
          this.loading = false;
          this.toastService.showSuccess(
            this.isEditMode ? 'Alojamiento actualizado exitosamente' : 'Alojamiento creado exitosamente'
          );
          this.router.navigate(['/anfitrion/alojamientos']);
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showError('Error al guardar el alojamiento');
        }
      });
    } else if (!this.hasValidImages) {
      this.toastService.showWarning('Debe tener al menos una imagen y marcar una como principal');
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.listingForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
      if (field.errors['pattern']) return 'Formato no válido';
    }
    return '';
  }

  getImageFieldError(index: number, fieldName: string): string {
    const field = this.imagenesFormArray.at(index).get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'URL es obligatoria';
      if (field.errors['pattern']) return 'URL no válida (debe empezar con http:// o https://)';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      titulo: 'Título',
      descripcion: 'Descripción',
      ciudad: 'Ciudad',
      direccion: 'Dirección',
      lat: 'Latitud',
      lng: 'Longitud',
      precioNoche: 'Precio por noche',
      capacidadMax: 'Capacidad máxima'
    };
    return labels[fieldName] || fieldName;
  }
}