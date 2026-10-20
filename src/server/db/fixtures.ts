// Data awal resmi sesuai Brosur & Laporan PPBI Mubarak Miles Tour.
// Dipakai oleh prisma/seed.ts serta sebagai fallback di luar produksi saat DB belum dikonfigurasi.
import type {
  PublicDepartureSlot,
  PublicDestination,
  PublicFaq,
  PublicPackage,
} from "./types";

export const FIXTURE_PACKAGES: PublicPackage[] = [
  {
    id: "pkg_walisongo_3h2m",
    slug: "ziarah-wali-songo-3h2m",
    name: "Ziarah Wali Songo + Tour Wisata (12 Destinasi)",
    description:
      "Paket perjalanan ziarah Wali Songo dan wisata religi 3 Hari 2 Malam berkonsep All-In Zero-Cash Hassle khusus rombongan Majelis Taklim, Komunitas, Pesantren, dan Yayasan. Seluruh retribusi makam, konsumsi, hotel bintang 3, hingga perlengkapan ramah lansia sudah tercakup penuh.",
    durationDays: 3,
    durationNights: 2,
    totalDestinations: 12,
    priceNormalPerPax: 1499000,
    pricePromoPerPax: 1399000,
    minParticipants: 20,
    maxParticipants: 45,
    highlights: [
      "Makam Walisongo",
      "Masjid Agung Jawa Tengah",
      "Kota Lama Semarang",
      "Masjid Agung Demak",
    ],
    facilities: [
      "Hotel Bintang 3 (2 Malam)",
      "Konsumsi Prasmanan Halal 3x Sehari",
      "Armada Bus AC Resmi SPIONAM & Lulus Uji BLUE",
      "Pendampingan Muthawwif Profesional Bersanad",
      "Travel Documentation (Foto & Video Rombongan)",
      "Ziarah Handbook Cetak & Digital",
      "Asuransi Perjalanan Mikro Syariah",
      "Fasilitas Ramah Lansia (Kursi Roda Lipat & Tabung Oxycan)",
    ],
    hotels: [
      "Lasnur Pallace Hotel Tegal (Bintang 3)",
      "De La Charis Hotel Tuban (Bintang 3)",
    ],
    isCustomAllowed: false,
  },
  {
    id: "pkg_custom_rombongan",
    slug: "custom-rombongan-komunitas",
    name: "Paket Custom Rombongan Majelis & Instansi",
    description:
      "Fleksibilitas penuh penentuan tanggal keberangkatan, titik penjemputan di Jawa Timur, serta penyesuaian titik destinasi ziarah sesuai kesepakatan MOU komunitas atau lembaga Anda.",
    durationDays: 3,
    durationNights: 2,
    totalDestinations: 12,
    priceNormalPerPax: 1499000,
    pricePromoPerPax: 1399000,
    minParticipants: 20,
    maxParticipants: 120,
    highlights: [
      "Jadwal Keberangkatan Bebas Pilih",
      "Titik Jemput Langsung di Lokasi Komunitas",
      "Rute & Destinasi Fleksibel Sesuai MOU",
      "Bisa Lebih dari 1 Armada Bus",
    ],
    facilities: [
      "Hotel Bintang 3 Pilihan",
      "Konsumsi Halal 3x Sehari Ramah Lansia",
      "Armada Bus AC Resmi SPIONAM & Ramp Check H-1",
      "Muthawwif Profesional & Ziarah Handbook",
      "Dokumentasi Eksklusif & LPJ Kegiatan",
      "Asuransi Perjalanan Syariah",
      "Kursi Roda Lipat & Oksigen Portabel (Oxycan)",
    ],
    hotels: [
      "Lasnur Pallace Hotel Tegal / Setara",
      "De La Charis Hotel Tuban / Setara",
    ],
    isCustomAllowed: true,
  },
];

export const FIXTURE_DEPARTURE_SLOTS: PublicDepartureSlot[] = [
  {
    id: "slot_2027_02_01",
    packageId: "pkg_walisongo_3h2m",
    departDate: "2027-02-01",
    returnDate: "2027-02-03",
    label: "Gelombang Perdana: 1–3 Februari 2027",
    maxRombonganQuota: 2,
    bookedRombonganCount: 0,
    remainingRombonganQuota: 2,
    seatCapacityPerBus: 40,
    isClosed: false,
    closedReason: null,
  },
  {
    id: "slot_2027_02_15",
    packageId: "pkg_walisongo_3h2m",
    departDate: "2027-02-15",
    returnDate: "2027-02-17",
    label: "Gelombang Kedua: 15–17 Februari 2027",
    maxRombonganQuota: 2,
    bookedRombonganCount: 0,
    remainingRombonganQuota: 2,
    seatCapacityPerBus: 40,
    isClosed: false,
    closedReason: null,
  },
];

export const FIXTURE_DESTINATIONS: PublicDestination[] = [
  {
    id: "dest_ampel",
    slug: "makam-sunan-ampel",
    name: "Makam Sunan Ampel",
    city: "Surabaya",
    category: "MAKAM",
    description:
      "Titik awal keberangkatan dan ziarah ke makam Raden Rahmat (Sunan Ampel) di kawasan Masjid Agung Sunan Ampel Surabaya.",
    lat: -7.2302,
    lng: 112.7428,
    imageUrl: "/images/dest-ampel.webp",
  },
  {
    id: "dest_gresik",
    slug: "makam-sunan-gresik",
    name: "Makam Syekh Maulana Malik Ibrahim",
    city: "Gresik",
    category: "MAKAM",
    description:
      "Ziarah ke makam wali tertua di jajaran Wali Songo, Syekh Maulana Malik Ibrahim di pusat Kota Gresik.",
    lat: -7.1592,
    lng: 112.6562,
    imageUrl: "/images/dest-malik-ibrahim.webp",
  },
  {
    id: "dest_giri",
    slug: "makam-sunan-giri",
    name: "Makam Sunan Giri",
    city: "Gresik",
    category: "MAKAM",
    description:
      "Ziarah ke makam Raden Paku (Sunan Giri) di perbukitan Kebomas, dilengkapi koordinasi shuttle lokal ramah lansia.",
    lat: -7.1695,
    lng: 112.6311,
    imageUrl: "/images/dest-giri.webp",
  },
  {
    id: "dest_drajat",
    slug: "makam-sunan-drajat",
    name: "Makam Sunan Drajat",
    city: "Lamongan",
    category: "MAKAM",
    description:
      "Ziarah ke makam Raden Qasim (Sunan Drajat) di Paciran, Lamongan yang sarat warisan filosofi kepedulian sosial.",
    lat: -6.8851,
    lng: 112.3924,
    imageUrl: "/images/dest-drajat.webp",
  },
  {
    id: "dest_bonang",
    slug: "makam-sunan-bonang",
    name: "Makam Sunan Bonang",
    city: "Tuban",
    category: "MAKAM",
    description:
      "Ziarah ke kompleks makam Raden Makhdum Ibrahim (Sunan Bonang) di jantung Kota Tuban.",
    lat: -6.8947,
    lng: 112.0632,
    imageUrl: "/images/dest-bonang.webp",
  },
  {
    id: "dest_muria",
    slug: "makam-sunan-muria",
    name: "Makam Sunan Muria",
    city: "Kudus",
    category: "MAKAM",
    description:
      "Ziarah ke makam Raden Umar Said (Sunan Muria) di lereng Gunung Muria dengan koordinasi ojek/shuttle terpadu All-In.",
    lat: -6.6624,
    lng: 110.8975,
    imageUrl: "/images/dest-muria.webp",
  },
  {
    id: "dest_kudus",
    slug: "makam-sunan-kudus",
    name: "Masjid Menara & Makam Sunan Kudus",
    city: "Kudus",
    category: "MAKAM",
    description:
      "Ziarah ke makam Ja'far Shadiq (Sunan Kudus) dan menyaksikan arsitektur ikonik Menara Kudus.",
    lat: -6.8044,
    lng: 110.8328,
    imageUrl: "/images/dest-menara-kudus.webp",
  },
  {
    id: "dest_kalijaga",
    slug: "makam-sunan-kalijaga",
    name: "Makam Sunan Kalijaga (Kadilangu)",
    city: "Demak",
    category: "MAKAM",
    description:
      "Ziarah ke makam Raden Said (Sunan Kalijaga) di Kadilangu, Demak dengan bimbingan tahlil bersanad Aswaja.",
    lat: -6.9061,
    lng: 110.6524,
    imageUrl: "/images/dest-kalijaga.webp",
  },
  {
    id: "dest_masjid_demak",
    slug: "masjid-agung-demak",
    name: "Masjid Agung Demak",
    city: "Demak",
    category: "MASJID",
    description:
      "Kunjungan ibadah dan tadabbur sejarah kesultanan Islam pertama di Jawa pada masjid bersejarah peninggalan para Wali.",
    lat: -6.8946,
    lng: 110.6373,
    imageUrl: "/images/dest-masjid-demak.webp",
  },
  {
    id: "dest_majt",
    slug: "masjid-agung-jawa-tengah",
    name: "Masjid Agung Jawa Tengah (MAJT)",
    city: "Semarang",
    category: "MASJID",
    description:
      "Shalat berjamaah dan wisata religi di masjid megah berpayung raksasa hidrolik di Kota Semarang.",
    lat: -6.9836,
    lng: 110.4455,
    imageUrl: "/images/dest-majt.webp",
  },
  {
    id: "dest_kota_lama",
    slug: "kota-lama-semarang",
    name: "Kawasan Wisata Kota Lama Semarang",
    city: "Semarang",
    category: "WISATA",
    description:
      "Tour wisata santai dan dokumentasi kebersamaan rombongan di kawasan cagar budaya berarsitektur klasik.",
    lat: -6.9682,
    lng: 110.4275,
    imageUrl: "/images/dest-kota-lama.webp",
  },
  {
    id: "dest_gunung_jati",
    slug: "makam-sunan-gunung-jati",
    name: "Makam Sunan Gunung Jati",
    city: "Cirebon",
    category: "MAKAM",
    description:
      "Ziarah penutup rangkaian Wali Songo di kompleks makam Syarif Hidayatullah (Sunan Gunung Jati) sebelum istirahat di Hotel Tegal.",
    lat: -6.6714,
    lng: 108.5393,
    imageUrl: "/images/dest-gunung-jati.webp",
  },
];

export const FIXTURE_FAQS: PublicFaq[] = [
  {
    id: "faq_all_in",
    question: "Apa yang dimaksud dengan Paket All-In Zero-Cash Hassle?",
    answer:
      "Seluruh pos pengeluaran selama perjalanan (bus pariwisata AC resmi, hotel bintang 3 selama 2 malam, makan prasmanan halal 3x sehari, retribusi masuk makam, infaq resmi, shuttle lokal, tol, parkir, hingga tips kru) sudah tercakup dalam satu harga kontrak di awal. Jamaah dan pengurus majelis tidak dibebani pungutan uang printilan di jalan.",
  },
  {
    id: "faq_lansia",
    question: "Fasilitas apa saja yang disiapkan khusus untuk jamaah lansia?",
    answer:
      "Kami menyediakan 1 unit kursi roda lipat (atau sesuai permintaan di awal), 2 tabung oksigen portabel (Oxycan), kotak P3K & tim pendamping medis, menu konsumsi yang ramah orang tua, serta pemilihan titik transit dan hotel dengan akses yang mudah bagi lansia.",
  },
  {
    id: "faq_mou_dp",
    question: "Bagaimana alur pemesanan dan pembayaran untuk rombongan Majelis Taklim?",
    answer:
      "Setelah mengisi form Permintaan Penawaran di website, tim kami akan menindaklanjuti via WhatsApp untuk penyusunan MOU di atas materai. Pembayaran dilakukan 2 tahap: Uang Muka (DP) minimal 50% paling lambat H-30 sebelum keberangkatan, dan pelunasan 50% paling lambat H-14 sebelum keberangkatan.",
  },
  {
    id: "faq_kapasitas",
    question: "Berapa jumlah jamaah dalam satu rombongan keberangkatan?",
    answer:
      "Kapasitas ideal untuk 1 bus pariwisata adalah 40 jamaah (rentang pemesanan 20–45 jamaah per bus). Jika komunitas Anda berjumlah lebih dari 45 jamaah, kami dapat menyiapkan lebih dari 1 unit armada bus.",
  },
  {
    id: "faq_keamanan_bus",
    question: "Bagaimana standar keamanan armada bus yang digunakan?",
    answer:
      "Mubarak Miles Tour hanya bermitra dengan Perusahaan Otobus (PO) resmi yang terdaftar aktif di portal SPIONAM Kementerian Perhubungan dan memiliki Bukti Lulus Uji Elektronik (BLUE) aktif. Selain itu, tim operasional kami wajib melakukan Ramp Check fisik H-1 sebelum keberangkatan.",
  },
  {
    id: "faq_custom",
    question: "Apakah tanggal keberangkatan dan titik penjemputan bisa menyesuaikan majelis kami?",
    answer:
      "Bisa. Selain jadwal reguler (seperti 1–3 Februari 2027), Anda dapat memilih Paket Custom Rombongan untuk menentukan tanggal keberangkatan sendiri serta titik penjemputan langsung di lokasi majelis/komunitas di Surabaya Raya maupun Jawa Timur.",
  },
];
