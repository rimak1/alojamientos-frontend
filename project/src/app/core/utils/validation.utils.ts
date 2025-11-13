/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar fortaleza de contraseña
 * Mínimo 8 caracteres, al menos una mayúscula y un número (regla del proyecto)
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validar número de teléfono colombiano
 * Acepta:
 *  - Móviles: 10 dígitos iniciando por 3 (e.g., 3XXXXXXXXX)
 *  - Fijos: esquema actual 60 + código área (1 dígito) + 7 dígitos (e.g., 601XXXXXXX)
 * Opcionalmente con prefijo de país +57, 57 o 0057, y separadores espacios/guiones/paréntesis.
 */
export function isValidPhone(phone: string): boolean {
  // quitar espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // normalizar prefijo internacional colombiano
  if (cleaned.startsWith('+57')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('0057')) cleaned = cleaned.slice(4);
  else if (cleaned.startsWith('57')) cleaned = cleaned.slice(2);

  // móviles: 3 + 9 dígitos (total 10)
  const mobileRegex = /^3\d{9}$/;

  // fijos: 60 + [1-8] + 7 dígitos (total 10)
  const landlineRegex = /^60[1-8]\d{7}$/;

  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

/**
 * Validar que el usuario sea mayor de edad (≥ 18 años)
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
 * Formatear precio en pesos colombianos (COP)
 * @param price Monto a formatear
 * @param locale Locale opcional (por defecto 'es-CO')
 * @param currency Moneda opcional (por defecto 'COP')
 */
export function formatPrice(
  price: number,
  locale: string = 'es-CO',
  currency: string = 'COP'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(price ?? 0);
}

/* ============================
 * Utilidades de fecha 
 * ============================ */

/**
 * Formatea una fecha a DD/MM/AAAA respetando el locale (por defecto 'es-CO')
 */
export function formatDate(iso: string | Date, locale: string = 'es-CO'): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Formatea una fecha corta, p. ej. "02 sept"
 */
export function formatDateShort(iso: string | Date, locale: string = 'es-CO'): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
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
