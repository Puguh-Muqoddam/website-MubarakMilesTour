// Bentuk data publik yang boleh dikirim ke halaman. Tidak pernah berisi data pesanan atau PII.

export type PublicPackage = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationDays: number;
  durationNights: number;
  totalDestinations: number;
  priceNormalPerPax: number;
  pricePromoPerPax: number;
  minParticipants: number;
  maxParticipants: number;
  highlights: string[];
  facilities: string[];
  hotels: string[];
  isCustomAllowed: boolean;
};

export type PublicDepartureSlot = {
  id: string;
  packageId: string;
  departDate: string; // "YYYY-MM-DD"
  returnDate: string; // "YYYY-MM-DD"
  label: string;
  maxRombonganQuota: number;
  bookedRombonganCount: number;
  remainingRombonganQuota: number;
  seatCapacityPerBus: number;
  isClosed: boolean;
  closedReason: string | null;
};

export type PublicDestination = {
  id: string;
  slug: string;
  name: string;
  city: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
};

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
};
