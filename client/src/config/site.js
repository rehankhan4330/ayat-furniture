export const siteConfig = {
  name: 'Ayat Furniture',
  tagline: 'Crafted for your home & office',

  // WhatsApp format: 91 + 10-digit number, with no + or spaces.
  whatsappNumber: '918147989483',
  phone: '+91 81479 89483',
  email: 'info@example.com', // TODO: Replace with the real business email.
  address: 'Bengaluru, Karnataka, India', // TODO: Replace with the full showroom or factory address.
}

export function getWhatsAppLink(message = 'Hello, I want to enquire about your furniture.') {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
}