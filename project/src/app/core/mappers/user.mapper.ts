import type { User } from '../models/user.model';

export function mapUserFromApi(api: any, rol: User['rol']): User {
  return {
    id: String(api.id),
    nombre: api.fullName ?? api.name,
    email: api.email,
    telefono: api.phone,
    rol,
    fechaNacimiento: api.dateBirth,
    fotoUrl: api.photoProfile
  };
}
