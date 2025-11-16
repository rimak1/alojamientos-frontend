import type { Review, CreateReviewRequest, ReplyToReviewRequest } from '../models/review.model';

export function mapReviewFromApi(api: any): Review {
  return {
    id: String(api.id),
    reservaId: '', // no viene en el DTO de respuesta
    alojamientoId: '',
    usuarioId: '',
    rating: api.rating,
    texto: api.text,
    respuestaAnfitrion: api.hostResponse,
    fecha: api.dateCreation,
    usuario: { nombre: api.authorName, fotoUrl: '' }
  };
}

export function mapCreateReviewToApi(front: CreateReviewRequest) {
  return { rating: front.rating, text: front.texto, idBooking: Number(front.reservaId) };
}

export function mapReplyReviewToApi(front: ReplyToReviewRequest) {
  return { response: front.texto };
}
