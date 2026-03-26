export function getWhatsAppLink(
  phone: string,
  propertyTitle?: string,
  propertyUrl?: string
): string {
  const base = `Bonjour, je suis intéressé par la propriété : ${propertyTitle ?? ''} ${propertyUrl ?? ''}`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(base)}`
}
