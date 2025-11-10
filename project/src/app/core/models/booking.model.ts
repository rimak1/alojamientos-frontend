export interface Booking {
  id: string;
  alojamientoId: string;
  usuarioId: string;
  checkIn: string;
  checkOut: string;
  huespedes: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  creadoEn: string;
  alojamiento?: {
    titulo: string;
    ciudad: string;
    precioNoche: number;
    imagenPrincipal?: string;
  };
  usuario?: {
    nombre: string;
    email: string;
  };
}

export interface CreateBookingRequest {
  alojamientoId: string;
  checkIn: string;
  checkOut: string;
  huespedes: number;
}

export interface BookingFilters {
  estado?: string;
  desde?: string;
  hasta?: string;
  propias?: boolean;
  anfitrion?: boolean;
}