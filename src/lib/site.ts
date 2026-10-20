// Konfigurasi publik situs Mubarak Miles Tour (bukan rahasia).
export const SITE = {
  name: "Mubarak Miles Tour",
  tagline: "Ziarah Wali Songo + Tour Wisata Aman, Nyaman, & Ramah Lansia",
  city: "Surabaya, Jawa Timur",
  addressLines: ["Surabaya, Jawa Timur", "Layanan Rombongan Majelis Taklim, Pesantren, & Komunitas"],
  contact: {
    picName: "Tiya",
    whatsappDisplay: "0858-4787-9784",
    whatsappDefault62: "6285847879784",
    instagram: "@mubarakmiles_tour",
    instagramUrl: "https://www.instagram.com/mubarakmiles_tour",
    email: "mubarakmilestour@gmail.com",
  },
  // Titik tengah rute Jawa (Surabaya - Tuban - Kudus - Demak - Semarang - Tegal)
  routeMapCenter: { lat: -6.9667, lng: 111.0, zoom: 7 },
} as const;

export const NAV_ITEMS = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#keunggulan", label: "Keunggulan" },
  { href: "/#paket", label: "Paket & Jadwal" },
  { href: "/#rute", label: "Rute & Hotel" },
  { href: "/#alur", label: "Alur MOU" },
  { href: "/#faq", label: "FAQ" },
] as const;

/** Format angka rupiah tanpa desimal (contoh: Rp1.399.000). */
export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}
