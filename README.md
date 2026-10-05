# Muslim Citation Timeline 🧭

> **Instrumen Sitasi Sirkadian Islam (8 Fase Harian dengan Radial Valve & Zen Mode)**  
> 100% Zero-Backend, Zero-Dependency, Pure Vanilla JS, HTML5 & CSS3.

Aplikasi web kontemplatif yang menyelaraskan ayat suci Al-Qur'an dan Hadits Nabawi shahih ke dalam **8 fase waktu alami manusia** dalam sehari (Subuh, Dhuha, Dzuhur, Ashar, Senja, Isya, Tengah Malam, dan Sepertiga Malam Terakhir).

---

## 🚀 Cara Menjalankan (Instan Tanpa Server)

Aplikasi ini dirancang **100% statis portabel**. Anda tidak memerlukan Node.js, `npm install`, ataupun server lokal:

1. **Buka Langsung:** Cukup klik dua kali (double-click) file [`index.html`](file:///d:/0pro/muslim-citation-timeline/index.html) di browser favorit Anda (Chrome, Edge, Firefox, Safari).
2. **Hosting Statis:** Siap dideploy ke GitHub Pages, Vercel, Netlify, atau Cloudflare Pages hanya dengan mengunggah folder ini.

---

## ✨ Fitur Unggulan

### 1. Radial Valve Dial (Rotasi Katup Analog)
- Dial interaktif berbentuk lingkaran donat 8 fase waktu yang dapat diputar bebas seperti katup mekanis (*analog valve*).
- Menghitung sudut rotasi presisi menggunakan matematika `Math.atan2`.
- Dilengkapi efek *snap* ke batas segmen fase terdekat dan respon getaran (*haptic tick feedback*) pada perangkat mobile.
- Tombol mengambang *"↺ Kembali ke Sekarang"* otomatis muncul jika dial diputar menjauhi waktu nyata.

### 2. Zen Mode ("No Spoilers")
- **Aktif secara default** untuk melatih kesadaran penuh (*mindfulness*) dan mencegah *information overload*.
- Menampilkan fase saat ini ($T_0$) dan 2 fase ke depan (+6 jam).
- Fase yang telah lewat ditampilkan redup (*dimmed*).
- Fase masa depan yang masih jauh dikunci dan diselubungi tanda `🔒 ••• Terselubung`.
- Mengetuk segmen terselubung memunculkan dialog santun dengan opsi membuka khusus segmen tersebut atau menonaktifkan Zen Mode.

### 3. Dual-Lens Split Screen dengan Draggable Divider
- **Desktop:** Tampilan berdampingan (Kiri: Instrumen Visual Radial Valve, Kanan: Lembar Data Excel & Quick Copy).
- **Mobile:** Tampilan bertumpuk vertikal (Atas: Radial Valve, Bawah: Lembar Data).
- Pemisah layar (*divider*) dapat digeser secara leluasa dengan mouse maupun sentuhan (*touch*).

### 4. Lembar Data (Excel-Grade Lens) & Salin Cepat 1-Klik
- Tabel data terstruktur dengan pencarian langsung (*instant search filter*).
- Tombol salin instan di setiap baris:
  - **Teks Arab Sahaja:** Tulisan Arab berharakat lengkap.
  - **Terjemahan:** Bahasa Indonesia atau English.
  - **Sitasi Ilmiah Lengkap:** Format kutipan akademis dengan teks Arab, terjemahan, nama surah/nomor ayat atau derajat keshahihan hadits, perawi, dan tautan verifikasi sumber ke Quran.com atau Sunnah.com.

### 5. Inspector Detail Drawer
- Mengetuk segmen radial atau baris tabel membuka laci inspeksi mendalam.
- Tipografi kaligrafi Arab resolusi tinggi menggunakan font Google `Amiri`.
- Penjelasan hikmah fase (tafsir ringkas) dalam Bahasa Indonesia dan Inggris.

### 6. Sistem Tema Sirkadian (Dynamic Palette)
- **Auto (Circadian Sync):** Palet warna UI bertransisi secara dinamis mengikuti warna aksen fase yang sedang aktif.
- **Desert Sand:** Nuansa perkamen gurun krem dan cokelat moka.
- **Medina Night:** Nuansa malam berbintang biru obsidian dan emas dirham.
- **Pomegranate:** Nuansa terakota hangat dan merah delima.

---

## 📂 Struktur File

```
d:/0pro/muslim-citation-timeline/
├── index.html            # Antarmuka web semantik dan struktur layout responsif
├── index.css             # Sistem desain, variabel fase HSL, tema, dan animasi
├── app.js                # Logika aplikasi, fisika dial valve, Zen mode, & clipboard
├── citations-data.js     # Dataset seed 24 slot (3 hari penuh) terverifikasi
├── README.md             # Dokumentasi proyek
└── brief/
    ├── v01_CHAT-HISTORY-daily-quran-hardist.md # Arsip percakapan awal
    └── v02_ai-prompt-brief.md                  # PRD & spesifikasi teknis lengkap v02
```
