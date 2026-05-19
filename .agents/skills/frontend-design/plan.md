Berikut **plan ulang yang langsung spesifik menggunakan Vite + PWA + TypeScript** untuk aplikasi **LKPD Digital “Petualangan Nita Karawo”**. Jadi tidak memakai Android native, tidak memakai Kodular sebagai engine utama, dan tidak menghasilkan APK. Aplikasinya dibuat sebagai **PWA mobile-first** yang bisa dibuka lewat link, dipasang ke layar utama HP, dan mendukung mode offline untuk materi inti.

Dalam proposal, produk awal dirancang sebagai **LKPD Digital berbasis Android** dengan pendekatan **etnomatematika Karawo**, menggunakan model **ADDIE**, dan memuat empat aktivitas utama materi transformasi geometri, yaitu **translasi, refleksi, rotasi, dan dilatasi**. Plan ini mengubah basis teknologinya menjadi **Vite PWA TypeScript**, tetapi alur pembelajaran, pendekatan etnomatematika, uji validitas, kepraktisan, dan efektivitas tetap mengikuti rancangan proposal. 

# Plan Pengembangan PWA Vite TypeScript

## 1. Target Produk

**Nama aplikasi:** Petualangan Nita Karawo
**Jenis aplikasi:** Progressive Web App / PWA
**Framework utama:** Vite + React + TypeScript
**Target perangkat:** HP Android, iPhone, tablet, laptop, dan komputer
**Target pengguna:** Siswa kelas IX dan guru matematika
**Materi:** Transformasi Geometri
**Konteks budaya:** Motif sulaman Karawo Gorontalo
**Model pengembangan penelitian:** ADDIE
**Output akhir:** Link PWA + aplikasi installable di layar utama HP + data hasil belajar siswa.

Vite dipakai karena menyediakan template proyek modern, termasuk template React + TypeScript melalui perintah `create vite`. ([vitejs][1]) Untuk menjadikan aplikasi installable sebagai PWA, aplikasi harus memiliki **web app manifest**, sedangkan fitur offline dikerjakan melalui **service worker**. ([MDN Web Docs][2])

---

## 2. Stack Teknologi Final

| Kebutuhan         | Teknologi yang Dipakai              |
| ----------------- | ----------------------------------- |
| Build tool        | Vite                                |
| Bahasa            | TypeScript                          |
| UI framework      | React                               |
| PWA               | vite-plugin-pwa                     |
| Routing halaman   | React Router                        |
| Styling           | Tailwind CSS                        |
| State management  | Zustand                             |
| Penyimpanan lokal | IndexedDB dengan Dexie.js           |
| Animasi           | Lottie React / Framer Motion        |
| Ikon              | Lucide React                        |
| Grafik Kartesius  | SVG custom / Canvas custom          |
| Testing rumus     | Vitest                              |
| Deploy            | Vercel / Netlify / Firebase Hosting |

`vite-plugin-pwa` dipakai karena plugin ini memang dirancang untuk menambahkan kemampuan PWA ke proyek Vite, termasuk web app manifest, service worker, dukungan offline melalui Workbox, dan pengelolaan aset statis. ([Vite PWA][3]) Untuk menyimpan progres, jawaban, skor, dan refleksi siswa di browser, gunakan IndexedDB karena API ini cocok untuk penyimpanan data terstruktur di sisi client dan dapat mendukung aplikasi yang tetap bekerja saat online maupun offline. ([MDN Web Docs][4])

---

## 3. Perintah Awal Membuat Proyek

```bash
npm create vite@latest nita-karawo-pwa -- --template react-ts
cd nita-karawo-pwa
npm install
```

Install dependency utama:

```bash
npm install react-router-dom zustand dexie lottie-react framer-motion lucide-react clsx
npm install -D vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom
```

Install Tailwind CSS:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Targetnya: sejak awal proyek sudah berbasis **TypeScript**, bukan JavaScript biasa.

---

# 4. Ruang Lingkup MVP

MVP adalah versi pertama yang wajib selesai agar bisa dipakai untuk validasi ahli dan uji coba siswa.

## Fitur Wajib MVP

| Fitur                       | Status |
| --------------------------- | ------ |
| Splash / Welcome screen     | Wajib  |
| Beranda / Menu utama        | Wajib  |
| Cerita Nita berbasis Karawo | Wajib  |
| Petunjuk penggunaan         | Wajib  |
| Aktivitas Translasi         | Wajib  |
| Aktivitas Refleksi          | Wajib  |
| Aktivitas Rotasi            | Wajib  |
| Aktivitas Dilatasi          | Wajib  |
| Tantangan akhir HOTS        | Wajib  |
| Input jawaban koordinat     | Wajib  |
| Cek jawaban otomatis        | Wajib  |
| Feedback benar/salah        | Wajib  |
| Skor akhir                  | Wajib  |
| Refleksi peserta didik      | Wajib  |
| Simpan progres lokal        | Wajib  |
| PWA installable             | Wajib  |
| Offline untuk materi inti   | Wajib  |

## Fitur Opsional Setelah MVP

| Fitur                      | Keterangan |
| -------------------------- | ---------- |
| Login siswa                | Opsional   |
| Dashboard guru             | Opsional   |
| Export Excel/CSV           | Opsional   |
| Sinkronisasi online        | Opsional   |
| Leaderboard                | Opsional   |
| Audio narasi               | Opsional   |
| Mode admin untuk edit soal | Opsional   |

Untuk kebutuhan tesis, MVP sudah cukup kuat karena produk dapat diuji dari aspek **kevalidan, kepraktisan, dan keefektifan**.

---

# 5. Alur Aplikasi Berdasarkan Flowchart

Alur aplikasi PWA mengikuti flowchart yang sudah dibuat:

```text
Splash Screen
→ Beranda
→ Pilih Menu
→ Petunjuk / Cerita Nita / Mulai Belajar
→ Pilih Materi Transformasi
→ Translasi / Refleksi / Rotasi / Dilatasi
→ Latihan / Tantangan
→ Input Jawaban
→ Cek Jawaban
→ Feedback
→ Skor
→ Refleksi Peserta Didik
→ Selesai
```

Versi route React Router:

```text
/                     SplashPage
/home                 HomePage
/story                StoryPage
/guide                GuidePage
/activities           ActivityMenuPage
/activity/translation TranslationPage
/activity/reflection  ReflectionPage
/activity/rotation    RotationPage
/activity/dilation    DilationPage
/challenge            ChallengePage
/result               ResultPage
/student-reflection   StudentReflectionPage
/profile              ProfilePage
```

---

# 6. Struktur Folder Proyek

Gunakan struktur seperti ini agar rapi dan mudah dikembangkan:

```text
nita-karawo-pwa/
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ maskable-icon.png
│  ├─ images/
│  │  ├─ nita/
│  │  ├─ karawo/
│  │  └─ backgrounds/
│  ├─ lottie/
│  └─ audio/
│
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  └─ providers.tsx
│  │
│  ├─ pages/
│  │  ├─ SplashPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ StoryPage.tsx
│  │  ├─ GuidePage.tsx
│  │  ├─ ActivityMenuPage.tsx
│  │  ├─ TranslationPage.tsx
│  │  ├─ ReflectionPage.tsx
│  │  ├─ RotationPage.tsx
│  │  ├─ DilationPage.tsx
│  │  ├─ ChallengePage.tsx
│  │  ├─ ResultPage.tsx
│  │  ├─ StudentReflectionPage.tsx
│  │  └─ ProfilePage.tsx
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ BottomNav.tsx
│  │  │  └─ TopBar.tsx
│  │  ├─ ui/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ ProgressDots.tsx
│  │  │  └─ ScoreBadge.tsx
│  │  ├─ geometry/
│  │  │  ├─ CoordinatePlane.tsx
│  │  │  ├─ Grid.tsx
│  │  │  ├─ Axis.tsx
│  │  │  ├─ PointLabel.tsx
│  │  │  ├─ KarawoMotif.tsx
│  │  │  └─ TransformationAnimation.tsx
│  │  └─ feedback/
│  │     ├─ CorrectFeedback.tsx
│  │     ├─ WrongFeedback.tsx
│  │     └─ HintBox.tsx
│  │
│  ├─ features/
│  │  ├─ translation/
│  │  ├─ reflection/
│  │  ├─ rotation/
│  │  ├─ dilation/
│  │  ├─ challenge/
│  │  └─ scoring/
│  │
│  ├─ domain/
│  │  ├─ geometry.ts
│  │  ├─ scoring.ts
│  │  ├─ validation.ts
│  │  └─ types.ts
│  │
│  ├─ data/
│  │  ├─ story.ts
│  │  ├─ guide.ts
│  │  ├─ lessons.ts
│  │  ├─ questions.ts
│  │  └─ achievements.ts
│  │
│  ├─ store/
│  │  ├─ useProgressStore.ts
│  │  ├─ useScoreStore.ts
│  │  └─ useStudentStore.ts
│  │
│  ├─ db/
│  │  ├─ db.ts
│  │  ├─ progressRepository.ts
│  │  ├─ answerRepository.ts
│  │  └─ reflectionRepository.ts
│  │
│  ├─ hooks/
│  │  ├─ usePwaInstall.ts
│  │  ├─ useOnlineStatus.ts
│  │  └─ useCoordinateInput.ts
│  │
│  ├─ styles/
│  │  └─ index.css
│  │
│  └─ main.tsx
│
├─ vite.config.ts
├─ package.json
├─ tsconfig.json
└─ index.html
```

---

# 7. Konfigurasi PWA di Vite

Di `vite.config.ts`, gunakan konsep seperti ini:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "images/**/*",
        "lottie/**/*"
      ],
      manifest: {
        name: "Petualangan Nita Karawo",
        short_name: "Nita Karawo",
        description: "LKPD Digital Transformasi Geometri berbasis Etnomatematika Karawo",
        theme_color: "#7C3AED",
        background_color: "#FFF7ED",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json}"]
      }
    })
  ]
});
```

Catatan penting: service worker untuk PWA perlu diuji pada lingkungan yang aman. Pada produksi, gunakan hosting HTTPS seperti Vercel, Netlify, atau Firebase Hosting. MDN menjelaskan bahwa banyak fitur web modern hanya tersedia pada **secure context**, dan dokumentasi Service Worker menjelaskan service worker sebagai mekanisme penting dalam arsitektur offline aplikasi web. ([MDN Web Docs][5])

---

# 8. Rancangan Halaman Aplikasi

## A. SplashPage

Isi:

* Judul: **Petualangan Nita Karawo**
* Subjudul: **Belajar Transformasi Geometri lewat Motif Karawo**
* Ilustrasi Nita
* Ornamen motif Karawo
* Tombol:

  * **Mulai Petualangan**
  * **Tentang Aplikasi**

Route:

```text
/
```

Tujuan: memberi identitas budaya dan suasana belajar yang menarik.

---

## B. HomePage

Isi:

* Sapaan siswa
* Ringkasan misi belajar
* Badge skor / bintang
* Menu aktivitas:

  * Translasi
  * Refleksi
  * Rotasi
  * Dilatasi
  * Tantangan Akhir
* Bottom navigation

Route:

```text
/home
```

---

## C. StoryPage

Isi:

* Cerita Nita dan ibunya mengamati motif Karawo
* Penjelasan bahwa motif Karawo dapat menunjukkan pergeseran, pencerminan, perputaran, dan perubahan ukuran
* Tombol **Lanjutkan**

Route:

```text
/story
```

---

## D. GuidePage

Isi:

* Panduan membaca cerita
* Panduan mengamati motif
* Cara menjawab koordinat
* Cara memakai tombol petunjuk
* Cara mendapatkan skor
* Tombol **Mulai Belajar**

Route:

```text
/guide
```

---

## E. ActivityMenuPage

Isi:

* Daftar aktivitas transformasi
* Status setiap aktivitas:

  * Belum dikerjakan
  * Sedang berjalan
  * Selesai
* Skor per aktivitas

Route:

```text
/activities
```

---

# 9. Rancangan Aktivitas Matematika

## Aktivitas 1 — Translasi

Route:

```text
/activity/translation
```

Fitur:

* Bidang Kartesius interaktif
* Motif Karawo pada titik awal
* Instruksi pergeseran
* Input jawaban koordinat akhir
* Tombol **Petunjuk**
* Tombol **Cek Jawaban**
* Feedback benar/salah

Contoh soal:

```text
Motif bunga berada di titik A(1, 2).
Geser motif 4 satuan ke kanan dan 2 satuan ke atas.
Tentukan koordinat bayangan A'.
```

Logika TypeScript:

```ts
A(x, y) + T(a, b) = A'(x + a, y + b)
```

Contoh hasil:

```text
A(1, 2) → A'(5, 4)
```

Kriteria selesai:

* Siswa mengisi koordinat benar.
* Feedback konsep tampil.
* Skor tersimpan ke IndexedDB.
* Progress aktivitas berubah menjadi selesai.

---

## Aktivitas 2 — Refleksi

Route:

```text
/activity/reflection
```

Fitur:

* Bidang Kartesius
* Pilihan garis cermin:

  * Sumbu X
  * Sumbu Y
  * y = x
  * y = -x
* Animasi bayangan motif
* Input koordinat bayangan
* Feedback konsep

Contoh soal:

```text
Motif berada di titik B(4, 3).
Cerminkan motif terhadap sumbu Y.
Tentukan koordinat B'.
```

Logika:

```ts
Sumbu X : (x, y) → (x, -y)
Sumbu Y : (x, y) → (-x, y)
y = x   : (x, y) → (y, x)
y = -x  : (x, y) → (-y, -x)
```

Contoh hasil:

```text
B(4, 3) → B'(-4, 3)
```

---

## Aktivitas 3 — Rotasi

Route:

```text
/activity/rotation
```

Fitur:

* Titik pusat O(0, 0)
* Motif Karawo pada koordinat tertentu
* Tombol sudut:

  * 90°
  * 180°
  * 270°
* Pilihan arah:

  * Berlawanan arah jarum jam
  * Searah jarum jam
* Animasi rotasi
* Input koordinat hasil rotasi

Contoh soal:

```text
Motif berada di titik C(2, 1).
Putar motif 90° berlawanan arah jarum jam terhadap titik pusat O(0, 0).
Tentukan koordinat C'.
```

Logika rotasi berlawanan arah jarum jam terhadap O(0, 0):

```ts
90°  : (x, y) → (-y, x)
180° : (x, y) → (-x, -y)
270° : (x, y) → (y, -x)
```

Contoh hasil:

```text
C(2, 1) → C'(-1, 2)
```

---

## Aktivitas 4 — Dilatasi

Route:

```text
/activity/dilation
```

Fitur:

* Bidang Kartesius
* Motif Karawo pada titik awal
* Slider faktor skala
* Visual motif membesar atau mengecil
* Input koordinat bayangan
* Feedback konsep

Contoh soal:

```text
Motif berada di titik D(2, 2).
Motif diperbesar dengan faktor skala k = 2 terhadap O(0, 0).
Tentukan koordinat D'.
```

Logika:

```ts
D(x, y) → D'(kx, ky)
```

Contoh hasil:

```text
D(2, 2) → D'(4, 4)
```

---

## Aktivitas 5 — Tantangan Akhir HOTS

Route:

```text
/challenge
```

Fitur:

* Soal gabungan beberapa transformasi
* Input jawaban akhir
* Petunjuk bertahap
* Feedback proses
* Skor akhir

Contoh soal:

```text
Nita mulai dari titik P(1, 1), kemudian:
1. Digeser sejauh (3, 2)
2. Dicerminkan terhadap sumbu X
3. Diputar 90° berlawanan arah jarum jam terhadap O(0, 0)

Tentukan posisi akhir titik tersebut.
```

Penyelesaian sistem:

```text
P(1, 1)
Translasi (3, 2) → (4, 3)
Refleksi sumbu X → (4, -3)
Rotasi 90° → (3, 4)
```

Jawaban akhir:

```text
P' = (3, 4)
```

---

# 10. Modul TypeScript yang Harus Dibuat

Buat file:

```text
src/domain/geometry.ts
```

Isi fungsi utama:

```ts
export type Point = {
  x: number;
  y: number;
};

export type Vector = {
  a: number;
  b: number;
};

export function translatePoint(point: Point, vector: Vector): Point {
  return {
    x: point.x + vector.a,
    y: point.y + vector.b
  };
}

export function reflectPoint(
  point: Point,
  axis: "x" | "y" | "y=x" | "y=-x"
): Point {
  if (axis === "x") return { x: point.x, y: -point.y };
  if (axis === "y") return { x: -point.x, y: point.y };
  if (axis === "y=x") return { x: point.y, y: point.x };
  return { x: -point.y, y: -point.x };
}

export function rotatePoint(
  point: Point,
  angle: 90 | 180 | 270
): Point {
  if (angle === 90) return { x: -point.y, y: point.x };
  if (angle === 180) return { x: -point.x, y: -point.y };
  return { x: point.y, y: -point.x };
}

export function dilatePoint(point: Point, scale: number): Point {
  return {
    x: point.x * scale,
    y: point.y * scale
  };
}

export function isSamePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}
```

File ini wajib diuji dengan Vitest agar aplikasi tidak salah menghitung jawaban siswa.

---

# 11. Sistem Skor

Skema skor:

| Aktivitas       | Skor Maksimal |
| --------------- | ------------: |
| Translasi       |            20 |
| Refleksi        |            20 |
| Rotasi          |            20 |
| Dilatasi        |            20 |
| Tantangan Akhir |            20 |
| Total           |           100 |

Aturan skor:

| Kondisi                       |     Skor |
| ----------------------------- | -------: |
| Benar percobaan pertama       |       20 |
| Benar setelah 1 petunjuk      |       15 |
| Benar setelah 2 kali coba     |       10 |
| Salah setelah batas percobaan | 5 atau 0 |

Buat file:

```text
src/domain/scoring.ts
```

Isi logika:

```ts
export function calculateScore(attempts: number, usedHint: boolean): number {
  if (attempts === 1 && !usedHint) return 20;
  if (attempts <= 2 || usedHint) return 15;
  if (attempts <= 3) return 10;
  return 5;
}
```

---

# 12. Penyimpanan Data Lokal

Gunakan IndexedDB dengan Dexie.

Data yang disimpan:

```text
student
- id
- name
- className
- createdAt

progress
- id
- activityId
- status
- score
- attempts
- completedAt

answers
- id
- activityId
- questionId
- answerX
- answerY
- isCorrect
- attempts
- createdAt

reflections
- id
- studentId
- text
- createdAt
```

Buat file:

```text
src/db/db.ts
```

Konsep Dexie:

```ts
import Dexie, { Table } from "dexie";

export type ProgressRecord = {
  id?: number;
  activityId: string;
  status: "not-started" | "in-progress" | "completed";
  score: number;
  attempts: number;
  completedAt?: string;
};

class NitaKarawoDB extends Dexie {
  progress!: Table<ProgressRecord>;

  constructor() {
    super("nita-karawo-db");
    this.version(1).stores({
      progress: "++id, activityId, status"
    });
  }
}

export const db = new NitaKarawoDB();
```

---

# 13. Rancangan UI Mobile-First

Ukuran utama desain:

```text
Max width app shell: 430px
Orientasi utama: portrait
Style: seperti aplikasi mobile
```

Komponen global:

```text
AppShell
TopBar
BottomNav
Card
Button
ProgressDots
ScoreBadge
FeedbackModal
CoordinatePlane
KarawoMotif
```

Warna utama:

| Fungsi         | Warna               |
| -------------- | ------------------- |
| Primary        | Ungu                |
| Translasi      | Merah muda          |
| Refleksi       | Oranye              |
| Rotasi         | Biru                |
| Dilatasi       | Hijau               |
| Tantangan      | Ungu tua            |
| Feedback benar | Hijau               |
| Feedback salah | Merah               |
| Background     | Krem / putih hangat |

Gaya UI mengikuti screenshot: kartu besar, tombol bulat, ilustrasi Nita, motif Karawo, progress dots, bottom navigation, dan halaman hasil belajar.

---

# 14. Strategi Offline PWA

Yang harus bisa dibuka offline:

```text
Splash
Beranda
Cerita Nita
Petunjuk
Materi transformasi
Soal aktivitas
Gambar motif Karawo
Animasi ringan
Progress siswa
Skor siswa
Refleksi siswa
```

Yang boleh online-only:

```text
Sinkronisasi dashboard guru
Export data online
Login
Update konten dari server
```

Prinsipnya:

```text
Materi inti disimpan di bundle aplikasi.
Data siswa disimpan di IndexedDB.
Aset penting di-cache oleh service worker.
```

---

# 15. Tahapan Pengembangan Teknis

## Sprint 1 — Setup Proyek dan Fondasi PWA

Durasi: 1 minggu

Output:

* Proyek Vite React TypeScript selesai dibuat.
* Tailwind aktif.
* React Router aktif.
* vite-plugin-pwa aktif.
* Manifest PWA tersedia.
* Ikon aplikasi tersedia.
* Aplikasi bisa di-build.

Checklist:

```text
npm run dev berjalan
npm run build berhasil
manifest terdeteksi
service worker aktif di production preview
aplikasi bisa dipasang ke home screen
```

---

## Sprint 2 — Design System dan Layout Utama

Durasi: 1 minggu

Output:

* AppShell mobile-first
* TopBar
* BottomNav
* Button
* Card
* ProgressDots
* ScoreBadge
* FeedbackModal

Halaman selesai:

```text
SplashPage
HomePage
StoryPage
GuidePage
ActivityMenuPage
```

Checklist:

```text
Tampilan mirip aplikasi mobile
Responsif di layar 360px sampai 430px
Navigasi antarhalaman lancar
Tidak ada halaman kosong
```

---

## Sprint 3 — Engine Geometri TypeScript

Durasi: 1 minggu

Output:

```text
geometry.ts
scoring.ts
validation.ts
geometry.test.ts
```

Fungsi selesai:

```text
translatePoint()
reflectPoint()
rotatePoint()
dilatePoint()
isSamePoint()
calculateScore()
```

Unit test wajib:

```text
Translasi A(1,2) + (4,2) = A'(5,4)
Refleksi B(4,3) terhadap sumbu Y = B'(-4,3)
Rotasi C(2,1) 90° = C'(-1,2)
Dilatasi D(2,2), k=2 = D'(4,4)
```

Checklist:

```text
Semua rumus benar
Semua unit test lulus
Tidak ada logika matematika di komponen UI
```

---

## Sprint 4 — Komponen Bidang Kartesius

Durasi: 1 minggu

Output:

```text
CoordinatePlane.tsx
Grid.tsx
Axis.tsx
PointLabel.tsx
KarawoMotif.tsx
TransformationAnimation.tsx
```

Fitur:

* Grid Kartesius
* Sumbu X dan Y
* Label koordinat
* Motif Karawo sebagai SVG
* Titik awal dan titik bayangan
* Garis bantu / panah transformasi

Checklist:

```text
Koordinat visual sesuai data matematika
Titik tidak meleset dari grid
Motif dapat ditampilkan di posisi tertentu
Animasi tidak mengganggu pembacaan soal
```

---

## Sprint 5 — Aktivitas Translasi dan Refleksi

Durasi: 1 minggu

Output:

```text
TranslationPage
ReflectionPage
```

Fitur:

* Soal tampil
* Bidang Kartesius tampil
* Input koordinat x dan y
* Cek jawaban
* Feedback benar/salah
* Petunjuk
* Simpan skor

Checklist:

```text
Jawaban benar terdeteksi
Jawaban salah diberi petunjuk
Skor masuk ke progress store
Progress tersimpan di IndexedDB
```

---

## Sprint 6 — Aktivitas Rotasi dan Dilatasi

Durasi: 1 minggu

Output:

```text
RotationPage
DilationPage
```

Fitur rotasi:

* Tombol 90°, 180°, 270°
* Animasi putar
* Input koordinat
* Feedback

Fitur dilatasi:

* Slider faktor skala
* Motif membesar/mengecil
* Input koordinat
* Feedback

Checklist:

```text
Rotasi sesuai rumus
Dilatasi sesuai faktor skala
Slider tidak membuat tampilan rusak
Feedback menjelaskan konsep
```

---

## Sprint 7 — Tantangan Akhir, Skor, dan Refleksi

Durasi: 1 minggu

Output:

```text
ChallengePage
ResultPage
StudentReflectionPage
ProfilePage
```

Fitur:

* Soal HOTS gabungan
* Skor akhir dari semua aktivitas
* Rincian skor per materi
* Bintang / predikat
* Refleksi peserta didik
* Tombol ulangi aktivitas
* Tombol selesai

Checklist:

```text
Total skor maksimal 100
Skor per aktivitas tampil
Refleksi tersimpan
Hasil belajar dapat dibuka ulang
```

---

## Sprint 8 — Offline Mode dan Testing PWA

Durasi: 1 minggu

Output:

* Aplikasi installable.
* Materi inti bisa dibuka offline.
* Progress tidak hilang setelah refresh.
* Build production siap deploy.

Testing:

```text
Test Chrome Android
Test Edge Android
Test Safari iPhone jika tersedia
Test mode airplane
Test reload setelah offline
Test install ke home screen
Test Lighthouse PWA
```

Checklist:

```text
Aplikasi bisa dibuka via URL
Aplikasi bisa dipasang ke layar utama
Service worker aktif
Halaman utama tetap terbuka offline
Data skor tetap tersimpan
```

---

## Sprint 9 — Validasi Ahli dan Revisi

Durasi: 1 minggu

Output:

* Prototype I
* Lembar validasi ahli materi
* Lembar validasi ahli media
* Revisi menjadi Prototype II

Aspek validasi ahli materi:

```text
Kesesuaian materi transformasi geometri
Kebenaran rumus
Kejelasan instruksi soal
Kesesuaian konteks Karawo
Kesesuaian dengan indikator pemahaman konsep
```

Aspek validasi ahli media:

```text
Kualitas tampilan
Kejelasan navigasi
Keterbacaan teks
Interaktivitas
Responsivitas mobile
Installability PWA
Kemampuan offline
Kecepatan akses
```

---

## Sprint 10 — Uji Coba Siswa dan Evaluasi

Durasi: 1–2 minggu

Output:

* Prototype final
* Data respon siswa
* Data respon guru
* Data pretest-posttest
* Data N-Gain
* Data skor aktivitas

Tahapan:

```text
Pretest
Penggunaan PWA
Posttest
Angket respon siswa
Angket respon guru
Analisis kepraktisan
Analisis efektivitas
Revisi akhir
```

---

# 16. Rencana Data Soal

Buat file:

```text
src/data/questions.ts
```

Struktur contoh:

```ts
export type Question = {
  id: string;
  activityId: "translation" | "reflection" | "rotation" | "dilation" | "challenge";
  title: string;
  instruction: string;
  startPoint: {
    label: string;
    x: number;
    y: number;
  };
  transformation: unknown;
  correctAnswer: {
    x: number;
    y: number;
  };
  hints: string[];
  conceptFeedback: string;
};
```

Contoh data translasi:

```ts
export const translationQuestions = [
  {
    id: "translation-1",
    activityId: "translation",
    title: "Translasi Motif Bunga",
    instruction:
      "Nita menggeser motif bunga dari titik A(1, 2) sejauh 4 satuan ke kanan dan 2 satuan ke atas. Tentukan koordinat bayangan A'.",
    startPoint: {
      label: "A",
      x: 1,
      y: 2
    },
    transformation: {
      type: "translation",
      vector: {
        a: 4,
        b: 2
      }
    },
    correctAnswer: {
      x: 5,
      y: 4
    },
    hints: [
      "Ke kanan berarti nilai x bertambah.",
      "Ke atas berarti nilai y bertambah.",
      "Gunakan rumus A'(x+a, y+b)."
    ],
    conceptFeedback:
      "Hebat! Translasi memindahkan motif tanpa mengubah bentuk dan ukurannya."
  }
];
```

---

# 17. Alur Penyimpanan Jawaban Siswa

Saat siswa menekan **Cek Jawaban**:

```text
1. Ambil input x dan y.
2. Ambil correctAnswer dari data soal.
3. Bandingkan dengan isSamePoint().
4. Jika benar:
   - tampilkan feedback benar
   - hitung skor
   - simpan jawaban
   - simpan progress
   - unlock aktivitas berikutnya
5. Jika salah:
   - attempts bertambah
   - tampilkan feedback salah
   - tampilkan petunjuk sesuai jumlah percobaan
6. Semua data disimpan ke IndexedDB.
```

---

# 18. Output Build dan Deployment

Command development:

```bash
npm run dev
```

Command build:

```bash
npm run build
```

Preview production:

```bash
npm run preview
```

Deployment disarankan:

```text
Vercel
Netlify
Firebase Hosting
```

Hasil akhir:

```text
https://nita-karawo-pwa.vercel.app
```

Siswa membuka link tersebut, lalu memilih:

```text
Tambahkan ke Layar Utama
```

Setelah itu aplikasi terasa seperti aplikasi mobile, tetapi sebenarnya tetap PWA.

---

# 19. Revisi Istilah Proposal

Karena rencana teknis sudah berubah dari Android ke PWA, bagian proposal perlu disesuaikan.

| Bagian Lama                   | Bagian Baru                                   |
| ----------------------------- | --------------------------------------------- |
| LKPD Digital berbasis Android | LKPD Digital berbasis Progressive Web App     |
| Aplikasi Android              | Aplikasi PWA mobile-first                     |
| Kodular sebagai main engine   | Vite + React + TypeScript sebagai main engine |
| Database Android              | IndexedDB                                     |
| APK                           | Link PWA installable                          |
| Instal aplikasi Android       | Tambahkan ke layar utama                      |
| Validasi media Android        | Validasi media PWA                            |

Judul yang disarankan:

> **Pengembangan Media Pembelajaran LKPD Digital Berbasis Progressive Web App dengan Pendekatan Etnomatematika untuk Mendukung Pemahaman Siswa tentang Konsep-Konsep pada Materi Transformasi Geometri bagi Siswa Kelas IX di SMP Negeri 1 Gorontalo**

Judul ringkas:

> **Pengembangan LKPD Digital Berbasis PWA dengan Pendekatan Etnomatematika pada Materi Transformasi Geometri Kelas IX**

---

# 20. Target Akhir Produk

Produk akhir harus memiliki:

```text
1. PWA Petualangan Nita Karawo berbasis Vite + React + TypeScript
2. Splash screen
3. Beranda
4. Cerita Nita
5. Petunjuk
6. Aktivitas translasi
7. Aktivitas refleksi
8. Aktivitas rotasi
9. Aktivitas dilatasi
10. Tantangan akhir HOTS
11. Feedback otomatis
12. Skor akhir
13. Refleksi peserta didik
14. Simpan progres lokal dengan IndexedDB
15. Mode offline untuk materi inti
16. Installable ke home screen
17. Instrumen validasi ahli materi
18. Instrumen validasi ahli media
19. Angket respon guru dan siswa
20. Data pretest-posttest untuk analisis efektivitas
```

Plan final teknisnya adalah:

```text
Vite + React + TypeScript
+ vite-plugin-pwa
+ Tailwind CSS
+ React Router
+ Zustand
+ Dexie / IndexedDB
+ SVG Coordinate Plane
+ Vitest
+ Deploy HTTPS
```

Dengan plan ini, aplikasi tetap sesuai proposal tesis dan screenshot UI yang diharapkan, tetapi implementasinya lebih modern, lintas perangkat, tidak perlu APK, dan lebih cocok untuk pembelajaran berbasis link serta penggunaan di HP siswa.

[1]: https://vite.dev/guide/?utm_source=chatgpt.com "Getting Started | Vite"
[2]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable?utm_source=chatgpt.com "Making PWAs installable - Progressive web apps | MDN"
[3]: https://vite-pwa-org.netlify.app/?utm_source=chatgpt.com "Vite Plugin PWA"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API?utm_source=chatgpt.com "IndexedDB API - Web APIs | MDN - MDN Web Docs"
[5]: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts?utm_source=chatgpt.com "Secure contexts - Security | MDN - MDN Web Docs"
