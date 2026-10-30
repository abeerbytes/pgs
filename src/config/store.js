// Public, non-secret defaults. Live business settings may override these in the Google Sheet.

export const STORE = {
  name: 'Popular General Store',
  tagline: 'Everyday groceries, delivered to your door',
  siteUrl: (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, ''),
};

// Used until the Settings tab has loaded (or if it fails to load).
export const DEFAULT_SETTINGS = {
  storeName: STORE.name,
  tagline: STORE.tagline,
  logoUrl: '',
  whatsappNumber: '923001400732',
  contactPhone: '',
  contactEmail: '',
  address: '',
  businessHours: '',
  supportedCities: [],
  deliveryFee: 0,
  freeDeliveryThreshold: 0,
  minOrderAmount: 0,
  codEnabled: true,
  announcementText: '',
  announcementLink: '',
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

// Shown on the homepage unless "whyChooseUs" (JSON) is set in Settings.
// Keep these free of claims the business has not confirmed.
export const DEFAULT_BENEFITS = [
  { title: 'Wide selection', text: 'Daily essentials, pantry staples and household items in one place.' },
  { title: 'Clear pricing', text: 'Prices in PKR with discounts shown against the original price.' },
  { title: 'Order on WhatsApp', text: 'Review your order, then send it to the store in one tap.' },
  { title: 'Delivery in supported areas', text: 'Check the delivery policy for the cities we deliver to.' },
];
