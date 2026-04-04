export function sanitizeString(
  value: unknown,
  maxLength = 500
): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null
  const cleaned = value
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength)
  return cleaned.length > 0 ? cleaned : null
}

export function sanitizeEmail(
  value: unknown
): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  if (email.length > 320) return null
  return email
}

export function sanitizePhone(
  value: unknown
): string | null {
  if (typeof value !== 'string') return null
  const phone = value
    .replace(/[^0-9\s\+\-\(\)]/g, '')
    .trim()
    .slice(0, 20)
  return phone.length >= 6 ? phone : null
}

export function sanitizeNumber(
  value: unknown,
  min = 0,
  max = 999999999
): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  if (isNaN(num) || num < min || num > max) return null
  return num
}

export function sanitizeUUID(
  value: unknown
): string | null {
  if (typeof value !== 'string') return null
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value) ? value : null
}
