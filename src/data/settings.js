// Store settings used in "local" mode (no Google Sheet connected).
// With a Google Sheet connected, the Settings tab is used instead and this file is ignored.
// Nothing here is invented: empty means "not provided yet".

export const SETTINGS = {
  storeName: 'Popular General Store',
  tagline: 'Your trusted general store for everyday essentials',
  logoUrl: '',                       // empty = use /public/pgs-logo.png
  // International format, digits only, no "+", e.g. 923001234567.
  // Override with VITE_WHATSAPP_NUMBER in .env.local / Vercel if needed.
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '923001400732',
  contactPhone: '',
  contactEmail: '',
  address: '',
  businessHours: '',
  supportedCities: [],               // [] = accept any city
  deliveryFee: 0,                    // PKR. 0 = no delivery charge (shown as "Free")
  freeDeliveryThreshold: 0,          // PKR, 0 = never free
  minOrderAmount: 0,                 // PKR, 0 = no minimum
  codEnabled: true,
  announcementText: 'Order online and send your order on WhatsApp.',
  announcementLink: '/shop',
  facebookUrl: '',
  instagramUrl: '',
  promoBannerTitle: '',
  promoBannerText: '',
  promoBannerLink: '',
  promoBannerExpires: '',
  whyChooseUs: '',
  aboutText: '',
  deliveryPolicy: '',
  returnPolicy: '',
  privacyPolicy: '',
  terms: '',
};
