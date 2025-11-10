/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar fortaleza de contraseña
 * Mínimo 8 caracteres, al menos una mayúscula y un número
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validar número de teléfono español
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+34|0034|34)?[ -]?[6789][ -]?([0-9][ -]?){8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validar que el usuario sea mayor de edad
 */
export function isValidAge(birthDate: string): boolean {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

/**
 * Formatear precio
 * @param price Monto a formatear
 * @param locale Locale opcional (por defecto 'es-ES')
 * @param currency Moneda opcional (por defecto 'EUR')
 */
export function formatPrice(price: number, locale: string = 'es-ES', currency: string = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(price ?? 0);
}

/* ============================
 * Utilidades de fecha pedidas
 * ============================ */

/**
 * Formatea una fecha a DD/MM/AAAA (dependiendo del locale)
 */
export function formatDate(iso: string | Date, locale: string = 'es-ES'): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Formatea una fecha corta, p. ej. "02 sept"
 */
export function formatDateShort(iso: string | Date, locale: string = 'es-ES'): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  // month: 'short' -> ene, feb, mar...
  return d.toLocaleDateString(locale, { month: 'short', day: '2-digit' });
}

/**
 * Diferencia en días (ceil) entre dos fechas
 * Ajusta a mediodía para evitar problemas por DST
 */
export function getDaysDifference(startIso: string | Date, endIso: string | Date): number {
  const a = typeof startIso === 'string' ? new Date(startIso) : startIso;
  const b = typeof endIso === 'string' ? new Date(endIso) : endIso;
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;

  const aNoon = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 12);
  const bNoon = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 12);

  const ms = bNoon.getTime() - aNoon.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
