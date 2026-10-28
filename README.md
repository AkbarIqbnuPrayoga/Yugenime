# YŪGENIME — Immersive Fantasy Anime Discovery & Streaming Platform

> *"Beyond Every World, A Story Awaits."*

YŪGENIME adalah aplikasi penemuan dan pemutaran anime modern bernuansa **Celestial Fantasy × Modern Editorial × Immersive Cinema**. Didesain dengan palet warna *Midnight Astral*, navbar glassmorphism yang responsif, pembukaan intro sinematik *typewriter*, katalog lengkap berbasis metadata AniList GraphQL, sistem *watch progress*, serta arsitektur pemutaran video modular dengan failover otomatis dan integrasi server-side `@coflyn/scrapr`.

---

## ✨ Fitur Utama (MVP Implementasi Penuh)

1. **Pengalaman Visual & Design System Midnight Astral**:
   - **Cinematic Intro**: Intro typewriter pembuka (*"EVERY WORLD HAS A STORY."* / *"Step beyond reality."*), partikel bintang celestial, ring orbit rotasi, dan tombol **Skip Intro** dengan persistensi `sessionStorage`.
   - **Horizontal Portal Reveal**: Transisi pembuka homepage dari kiri ke kanan yang dramatis dan mulus.
   - **Glassmorphism Navbar**: Posisi fixed dengan dynamic scroll effect (`backdrop-filter: blur(18px)`), desktop navigation links, responsive tablet spacing, serta mobile drawer layar sentuh tanpa layout shift.
   - **Palet Warna Celestial**: Void Black (`#090911`), Midnight Indigo (`#111126`), Astral Violet (`#9C7BFF`), Celestial Blue (`#78BFFF`), Aurora Cyan (`#77E6E0`), Lunar White (`#F6F4FF`), dan Ancient Gold (`#E9CA8B`).

2. **Penemuan & Katalog Anime (Discovery & Genres)**:
   - **Homepage Showcase**: Hero Spotlight carousel dengan crossfade backdrop resolusi tinggi, sinopsis, skor, dan tombol CTA.
   - **Continue Watching Row**: Mengambil progress aktual pengguna dari local storage beserta progress bar dan tombol lanjutkan.
   - **Trending & Seasonal**: Menampilkan rilisan terpopuler dan anime musiman (Winter, Spring, Summer, Fall).
   - **Discover Catalog**: Pencarian realtime debounced dengan filter multi-parameter (Genre, Tahun rilis, Musim, Format: TV/Movie/OVA/ONA), tombol Reset filter, dan pagination dinamis.
   - **Genre Dimension**: 11 kategori genre dengan kartu aksen warna dan ikon interaktif.

3. **Detail Anime & Daftar Episode**:
   - Backdrop sinematik dengan vignette bayangan, poster, judul Romaji, Inggris, dan Native.
   - Informasi studio animasi, skor rata-rata, durasi, total episode, dan sinopsis lengkap.
   - Daftar episode terstruktur dengan nomor, judul, thumbnail, durasi, dan indikator status telah ditonton.
   - Rekomendasi anime serupa berdasarkan kesamaan genre.

4. **Pemutar Video & Failover Architecture**:
   - **Teknologi Playback Modular**: Mendukung HTML5 Video native, HLS.js (`.m3u8`), official embeds (YouTube nocookie, Bilibili), serta tautan resmi eksternal.
   - **State Machine Eksplisit**: Mengelola status `idle`, `resolving`, `loading`, `ready`, `playing`, `paused`, `retrying`, `error`, dan `completed`.
   - **Kontrol Lengkap**: Play/Pause, Scrubber dengan buffered indicator, Elapsed & Total time, Kontrol volume & Mute, Kecepatan pemutaran (0.5x - 2x), Fullscreen API, dan navigasi Next/Prev episode.
   - **Keyboard Shortcuts**: Spasi / K (play/pause), Panah Kiri/Kanan (seek 5s), Panah Atas/Bawah (volume), F (fullscreen), M (mute).
   - **Resume Playback**: Otomatis menyimpan posisi tontonan setiap 5 detik ke local storage dan memulihkan posisi saat episode dibuka kembali.
   - **Failover & Health Tracker**: Ketika sumber aliran bermasalah, sistem secara otomatis mengklasifikasikan kesalahan (`NETWORK_TIMEOUT`, `UNSUPPORTED_FORMAT`, dsb.), memperbarui circuit breaker, dan beralih ke sumber cadangan terverifikasi berikutnya tanpa reload halaman.

5. **Integrasi `@coflyn/scrapr`**:
   - Dijalankan sepenuhnya di sisi server Node.js (`src/lib/providers/scrapr-adapter.ts`).
   - Melindungi dari SSRF (Server-Side Request Forgery) dengan memblokir alamat IP privat, `localhost`, dan skema non-HTTP.
   - Menyediakan endpoint `POST /api/playback/resolve` untuk resolusi tautan media Bilibili dan resolvers file yang aman.

6. **Fitur Pengguna (Watchlist, History, Preferences)**:
   - **Watchlist**: Simpan/hapus anime dengan tombol bookmark instan, pencarian di dalam watchlist, dan notifikasi Toast.
   - **Riwayat Tontonan**: Melihat semua episode yang pernah ditonton beserta persentase durasi, tombol lanjutkan, hapus per item, atau hapus seluruh riwayat dengan konfirmasi.
   - **Pengaturan**: Toggle mode *Reduced Motion* (aksesibilitas gerak minim), toggle putar otomatis episode berikutnya, pilihan kualitas default, dan pemantauan status penyedia (*Provider Registry*).

---

## 🛠️ Struktur Direktori

```
Yugenime/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root Layout & Metadata SEO
│   │   ├── page.tsx                       # Homepage (Intro, Hero, Trending, Seasonal)
│   │   ├── discover/page.tsx              # Katalog Anime & Filter
│   │   ├── trending/page.tsx              # Halaman Anime Trending
│   │   ├── seasonal/page.tsx              # Halaman Anime Musiman
│   │   ├── genres/
│   │   │   ├── page.tsx                   # Daftar Semua Genre
│   │   │   └── [slug]/page.tsx            # Anime Berdasarkan Genre
│   │   ├── anime/[id]/page.tsx            # Detail Anime & Episode List
│   │   ├── watch/[animeId]/[episodeId]/page.tsx # Pemutar Video & Sidebar Episode
│   │   ├── watchlist/page.tsx             # Halaman Watchlist
│   │   ├── history/page.tsx               # Halaman Riwayat Tontonan
│   │   ├── settings/page.tsx              # Preferensi & Status Provider
│   │   ├── not-found.tsx                  # 404 Fantasy Page
│   │   └── api/                           # API Routes (anime, search, playback, providers)
│   ├── components/
│   │   ├── common/                        # Navbar, Footer, Intro, StarBackground, Toast, AnimeCard, SearchModal
│   │   ├── home/                          # HeroCarousel, ContinueWatchingRow, AnimeGridSection, GenreGrid
│   │   └── player/                        # VideoPlayer, SourceSelector, EpisodeSidebar
│   ├── lib/
│   │   ├── types.ts                       # Skema TypeScript komprehensif
│   │   ├── design-tokens.ts               # Token warna Midnight Astral & konstanta genre
│   │   ├── storage.ts                     # Persistence manager (Watchlist, History, Prefs, Intro)
│   │   ├── metadata/                      # AniList GraphQL client & fallback catalog dataset
│   │   └── providers/                     # Registry, scrapr-adapter, dan fallback-resolver
│   └── styles/
│       └── globals.css                    # Vanilla CSS Design System Midnight Astral
├── tests/
│   └── unit.test.mjs                      # Automated Unit Tests (Node test runner)
├── .env.example                           # Contoh environment variables
├── package.json
└── tsconfig.json
```

---

## 🚀 Menjalankan Aplikasi

### 1. Mode Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 2. Mode Produksi (Build & Start)
```bash
npm run build
npm run start
```

### 3. Menjalankan Unit Tests
```bash
npm test
# atau
node --test tests/unit.test.mjs
```
Semua 4/4 uji pengujian (Scrapr methods, SSRF Protection, Watch Progress clamping, Circuit Breaker logic) terverifikasi lulus.
