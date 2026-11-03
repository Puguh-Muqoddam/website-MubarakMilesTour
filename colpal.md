# Color Palette — Mubarak Miles Tour

Dokumentasi palet warna resmi untuk Website Wisata Religi & Ziarah Wali Songo (B2B) **Mubarak Miles Tour**, Surabaya.

Palet ini mengombinasikan nuansa **Hijau Zamrud (Emerald)** dan **Emas Klasik (Gold)** yang mencerminkan spiritualitas, ketenangan, kemewahan yang anggun, serta profesionalisme layanan terstruktur B2B.

---

## 1. Tabel Palet Warna Utama

| Token Tailwind | Kode HEX | RGB | Peran & Penggunaan Utama |
|---|---|---|---|
| `emerald-deep` | `#0B3528` | `rgb(11, 53, 40)` | **Warna Utama (Brand Dark)**: Latar belakang hero overlay, navbar, footer, tombol utama, dan aksen institusional. |
| `emerald-mid` | `#124E3B` | `rgb(18, 78, 59)` | **Hijau Medium**: Latar belakang section selang-seling, navbar saat di-scroll, dan badge pendukung. |
| `sage-card` | `#526B4C` | `rgb(82, 107, 76)` | **Hijau Sage**: Kartu fitur di atas latar gelap dengan kontras teks krem tinggi. |
| `gold` | `#E8D29B` | `rgb(232, 210, 155)` | **Aksen Emas Terang**: Badge harga, tombol Call-to-Action (CTA) di atas gelap, icon bintang, dan highlight judul. |
| `gold-dark` | `#876316` | `rgb(135, 99, 22)` | **Aksen Emas Gelap**: Eyebrow badge dan teks aksen di atas latar terang (memenuhi standar aksesibilitas WCAG AA ≥ 4.7:1). |
| `cream` | `#F6EFE2` | `rgb(246, 239, 226)` | **Latar Terang Utama**: Background umum situs, kartu formulir, dan warna teks utama di atas latar gelap. |
| `sand` | `#EAE0CE` | `rgb(234, 224, 206)` | **Latar Terang Sekunder**: Section selang-seling, container form kalkulator, dan border kartu. |
| `ink` | `#102820` | `rgb(16, 40, 32)` | **Warna Teks Utama**: Tulisan judul & paragraf di atas latar terang (keterbacaan kontras tinggi). |
| `muted` | `#4E635B` | `rgb(78, 99, 91)` | **Warna Teks Sekunder**: Keterangan pendukung, label input, deskripsi fitur (WCAG AA ≥ 4.8:1). |
| `line` | `#D2C5B0` | `rgb(210, 197, 176)` | **Border & Divider**: Garis pembatas antar kolom, border tabel, dan garis pemisah. |
| `promo-red` | `#B42318` | `rgb(180, 35, 24)` | **Aksen Khusus / Notifikasi**: Coretan harga promo normal, sisa kuota kritis, dan status pembatalan. |

---

## 2. Tipografi Resmi

- **Font Judul & Isi Utama:** `Plus Jakarta Sans` (Weight: 400, 500, 600, 700, 800)
- **Font Aksen & Nuansa Klasik:** `Cormorant Garamond` (Weight: 600, 700, Style: normal & italic)

---

## 3. Contoh Implementasi di Kode (Tailwind CSS v4)

Di file `src/app/globals.css`:

```css
@theme {
  --color-emerald-deep: #0B3528;
  --color-emerald-mid: #124E3B;
  --color-sage-card: #526B4C;
  --color-cream: #F6EFE2;
  --color-sand: #EAE0CE;
  --color-gold: #E8D29B;
  --color-gold-dark: #876316;
  --color-ink: #102820;
  --color-muted: #4E635B;
  --color-line: #D2C5B0;
  --color-promo-red: #B42318;
}
```

---

## 4. Panduan Penggunaan untuk Desainer & Tim Marketing

1. **Kombinasi Elegan Gelap (Hero, Navbar, Footer):**
   - Background: `emerald-deep` (`#0B3528`)
   - Teks Utama: `cream` (`#F6EFE2`)
   - Aksen & CTA: `gold` (`#E8D29B`)
2. **Kombinasi Ramah Baca Terang (Katalog Paket, Formulir, Detail Itinerary):**
   - Background: `cream` (`#F6EFE2`) atau `sand` (`#EAE0CE`)
   - Teks Utama: `ink` (`#102820`)
   - Teks Sekunder: `muted` (`#4E635B`)
   - Eyebrow/Sub-judul: `gold-dark` (`#876316`)
3. **Harga & Diskon:**
   - Harga Promo: `emerald-deep` atau `gold-dark`
   - Harga Normal (Coret): `promo-red` (`#B42318`)
