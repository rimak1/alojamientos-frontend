export interface Review {
  id: string;
  reservaId: string;
  alojamientoId: string;
  usuarioId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  texto: string;
  fecha: string;
  respuestaAnfitrion?: string;
  usuario?: {
    nombre: string;
    fotoUrl?: string;
  };
}

export interface CreateReviewRequest {
  reservaId: string;
  alojamientoId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  texto: string;
}

export interface ReplyToReviewRequest {
  texto: string;
}