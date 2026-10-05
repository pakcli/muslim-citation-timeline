# Muslim Citation Timeline 🧭

> **Instrumen Sitasi Sirkadian Islam (Mode 8 Radial, Mode 0 Circle 2x Loop, Premiere Pro Timeline & Google Calendar)**  
> 100% Zero-Backend, Zero-Dependency, Pure Vanilla JS, HTML5 & CSS3.

Aplikasi web kontemplatif yang menyelaraskan ayat suci Al-Qur'an dan Hadits Nabawi shahih ke dalam **8 fase waktu alami sirkadian manusia** dalam sehari (Subuh, Dhuha, Dzuhur, Ashar, Senja, Isya, Tengah Malam, dan Sepertiga Malam Terakhir).

---

## 🚀 Cara Menjalankan (Instan Tanpa Server)

Aplikasi ini dirancang **100% statis portabel** (murni Vanilla JS tanpa modul, tanpa bundler, tanpa npm):

1. **Buka Langsung:** Cukup klik dua kali (*double-click*) file [`index.html`](file:///d:/0pro/muslim-citation-timeline/index.html) di browser favorit Anda (Chrome, Edge, Firefox, Safari) atau buka via `file:///`.
2. **Hosting Statis:** Siap dideploy ke GitHub Pages, Vercel, Netlify, atau Cloudflare Pages hanya dengan mengunggah folder ini.

---

## ✨ 4 Lensa Tampilan (*4 View Modes*)

### 1. [0] Mode 0 — Radial (O = Satu Lingkaran)
- **Mode 0 = O = satu lingkaran:** Bentuk angka 0 adalah lingkaran tunggal — cocok untuk dial donat radial 8 fase yang merupakan satu cincin.
- **Label Statis & Selalu Horizontal (Anti-Pusing):** Seluruh 8 titik waktu dan label topik tetap diam (*static*) di posisinya masing-masing (Utara, Timur Laut, Timur, Tenggara, Selatan, Barat Daya, Barat, Barat Laut) dan selalu terbaca horizontal (0 derajat) seperti radar chart.
- **Jarum Penunjuk yang Berputar:** Ketika dial diputar atau diklik, jarum penunjuk (*knob needle*) berputar dengan klik mekanis ke fase yang dituju, sementara teks dan lingkaran waktu tidak ikut berputar sehingga tidak membuat mata pusing.
- **Concentric Radar Grid:** Latar belakang jaring radar konsentris yang elegan dengan 8 baji fase proporsional.

### 2. [0] Mode 0 — Circle 0 (Two-Time Rotation Dial 2x12h)
- **"0 Meaning Two Time Rotation":** Format jam sirkular 12 jam yang mengitari 24 jam dalam **2 kali putaran penuh**:
  - **Putaran 1/2 (AM):** 00:00 – 12:00 (Fajar, Dhuha, Dzuhur).
  - **Putaran 2/2 (PM):** 12:00 – 24:00 (Ashar, Maghrib, Isya, Tengah Malam, Sepertiga Malam).
- **Titik Sitasi pada Cincin Jam:** Menampilkan 8 node sitasi di sekeliling piringan jam sesuai jam terjadinya.
- **Jarum Penunjuk 360° & Auto-Flip:** Menggeser jarum melintasi angka 12 akan otomatis beralih antara Putaran 1 (AM) dan Putaran 2 (PM). Badge putaran di tengah juga dapat diklik langsung untuk berganti putaran.

### 3. [⏱️] Timeline Panel Adobe Premiere Pro
- **Panel NLE Otentik Premiere Pro:**
  - **Tab Sequence:** Tab aktif `Muslim_Timeline_24h.prproj` lengkap dengan tombol close `×`.
  - **Tools Ribbon:** Tombol alat pengeditan Premiere: `V` (Selection), `A` (Track Select), `B` (Ripple Edit), `C` (Razor), `H` (Hand), dan `🧲` (Snap to Cuts).
  - **SMPTE Timecode:** Box timecode biru `00;08;24;15` (29.97 fps) dengan penghitungan frame presisi.
  - **Header Track Kolom Kiri:** Track `V2 Overlays`, `V1 Citations` (aktif target dengan ikon Mata & Kunci), pemisah A/V, `A1 Ambient` (aktif target dengan Mute & Solo), dan `A2 Tafsir`.
  - **Track V1 (Klip Berwarna NLE):** 8 klip blok sitasi proporsional dengan warna khas Premiere (Cerulean, Forest, Rose, Mango, Iris, Teal, Slate, Purple), nama file klip (contoh: `01_Pagi_Fajar_Quran.mov`), dan durasi timecode.
  - **Track A1 (Audio Waveforms):** Visualisasi gelombang audio SVG untuk setiap fase sirkadian.
  - **CTI Playhead Biru:** Jarum playhead khas Premiere dengan kepala panah biru dan garis vertikal. Dapat di-scrub bebas dengan magnet snap `🧲` ke batas potongan klip.
  - **Zoom Navigator Bar:** Slider navigator zoom bawah `( ═════ )` khas Premiere.

### 4. [📅] Kalender Jadwal Google
- Jadwal harian terstruktur ala Google Calendar lengkap dengan baris jam, kartu event warna-warni, cuplikan ayat/hadis, dan legenda Qur'an vs Hadits.

---

## 🔀 Fitur Fokus & Collapse Split Screen (*Shrink & Expand*)

- Header panel kiri dan kanan dilengkapi tombol **"⤢ Fokus Visual"** dan **"⤢ Fokus Data"**.
- Menekan tombol ini akan menyusutkan (*collapse*) panel sebelahnya dan memperluas panel yang dipilih hingga 100% lebar layar.
- Menekan tombol kembali (**"⤡ Kembalikan Layar"**) mengembalikan rasio layar split secara instan.
- Pembagi tengah (*split divider*) juga dapat digeser bebas secara manual (*drag resize*).

---

## 🍃 Zen Mode ("No Spoilers")

- **Aktif secara default** untuk melatih kesadaran penuh (*mindfulness*) dan mencegah *information overload*.
- Menampilkan fase saat ini ($T_0$) dan 2 fase ke depan (+6 jam).
- Fase yang telah lewat ditampilkan redup (*dimmed*).
- Fase masa depan yang masih jauh diselubungi tanda `🔒 ••• Terselubung`.
- Mengetuk segmen terselubung memunculkan konfirmasi lembut untuk membuka khusus segmen tersebut jika diinginkan.

---

## 📊 Lembar Data (Excel-Grade Lens) & Salin Cepat 1-Klik

- Tabel data terstruktur dengan pencarian langsung (*instant search filter*).
- Tombol salin instan di setiap baris:
  - **`عربي`:** Menyalin teks Arab berharakat lengkap.
  - **`ID / EN`:** Menyalin terjemahan aktif.
  - **`📋 Lengkap`:** Menyalin format kutipan akademis lengkap (teks Arab, arti, nama surah/nomor ayat atau derajat keshahihan hadits, perawi, dan tautan verifikasi sumber ke Quran.com atau Sunnah.com).

---

## 📂 Struktur File

```
d:/0pro/muslim-citation-timeline/
├── index.html            # Antarmuka web semantik dan struktur 4 tampilan visual
├── index.css             # Desain sistem, panel Premiere Pro, Circle 0, Radial 8, dan animasi
├── app.js                # Engine Vanilla JS (Mode 8, Mode 0 2x loop, Premiere NLE, Kalender, Sheet)
├── citations-data.js     # Dataset seed 24 slot (3 hari penuh) terverifikasi
├── README.md             # Dokumentasi proyek
└── brief/
    ├── v01_CHAT-HISTORY-daily-quran-hardist.md # Arsip percakapan awal
    └── v02_ai-prompt-brief.md                  # PRD & spesifikasi teknis lengkap v02
```
