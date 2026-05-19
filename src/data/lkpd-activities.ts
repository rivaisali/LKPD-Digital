import type { Point } from '@/domain/types'

export interface SubQuestion {
  id: string
  instruction: string
  correctAnswer: Point
  isText?: false
}

export interface SubQuestionText {
  id: string
  instruction: string
  correctAnswerText: string
  isText: true
}

export type AnySubQuestion = SubQuestion | SubQuestionText

export interface LkpdActivity {
  id: string
  stimulusTitle: string
  stimulusText: string
  subQuestions: AnySubQuestion[]
  conceptFeedback: string
  conceptRule: string
  voiceoverIntro: string
  voiceoverCorrect: string
  voiceoverWrong: string
}

// ─── TRANSLASI ───────────────────────────────────────────────────────────────
// Soal LKPD: mulai dari A(2,1) dengan vektor T(5,4)
// Setup: Letakkan motif di (2,1) [LKPD typo "(1,2)" → yang benar (2,1)]
// Sub-Q a (drag): Seret → A'(7,5)
// Sub-Q b (drag): Seret kembali → A''(12,9)
// Sub-Q c (tanpa drag, input): hitung → A'''(17,13)
export const translationActivity: LkpdActivity = {
  id: 'translation',
  stimulusTitle: 'Pola Berulang yang Tanpa Disadari',
  stimulusText:
    'Suatu hari, Nita membantu ibunya yang sedang menyulam kain karawo. Ia memperhatikan bahwa ibunya tidak menggambar ulang setiap motif, tetapi hanya memindahkan pola yang sama ke posisi lain dengan vektor T(5, 4).\n\nMotif pertama sudah diletakkan di titik A(2,1). Bantu Nita menemukan posisi motif berikutnya!',
  subQuestions: [
    {
      id: 'trans-a',
      instruction: "Seret motif karawo 5 satuan ke kanan dan 4 satuan ke atas dari A(2,1). Di titik manakah motif kedua A' berada?",
      correctAnswer: { x: 7, y: 5 },
    },
    {
      id: 'trans-b',
      instruction: "Seret kembali motif karawo 5 satuan ke kanan dan 4 satuan ke atas dari A'(7,5). Di titik manakah motif ketiga A'' berada?",
      correctAnswer: { x: 12, y: 9 },
    },
    {
      id: 'trans-c',
      instruction: "Tanpa menyeret motif, tentukan di mana posisi motif keempat A''' jika digeser kembali dengan T(5,4) dari A''(12,9).",
      correctAnswer: { x: 17, y: 13 },
    },
  ],
  conceptFeedback:
    "Motif karawo berhasil ditranslasikan! A(2,1) → A'(7,5) → A''(12,9) → A'''(17,13) dengan vektor T(5,4).",
  conceptRule:
    'Translasi menggunakan aturan:\n(x, y) → (x + a, y + b)\nArtinya setiap titik digeser dengan jarak yang sama tanpa berubah bentuk.',
  voiceoverIntro:
    'Sekarang kita belajar translasi. Seret motif karawo ke posisi yang ditentukan ya!',
  voiceoverCorrect:
    'Hebat! Motif hanya berpindah tempat tanpa berubah bentuk. Itulah yang disebut translasi atau pergeseran.',
  voiceoverWrong:
    'Hmm… coba perhatikan lagi arah pergeserannya ya. Geser ke kanan terlebih dahulu, lalu ke atas.',
}

// ─── REFLEKSI ────────────────────────────────────────────────────────────────
// Soal LKPD: titik awal (4,3)
// a. terhadap sumbu Y → (-4,3)
// b. terhadap sumbu X → (4,-3)
export const reflectionActivity: LkpdActivity = {
  id: 'reflection',
  stimulusTitle: 'Rahasia Keseimbangan Motif',
  stimulusText:
    'Seorang pembeli memuji hasil sulaman karawo Nita, karena terlihat "seimbang" antara sisi kiri dan kanan. Ia mengatakan bahwa motif tersebut tampak seperti bayangan di cermin.\n\nNita mencoba memperhatikan. Ia menemukan satu motif di sisi kanan berada di titik (4,3). Ia ingin membuat motif di sisi kiri agar terlihat seimbang sempurna.',
  subQuestions: [
    {
      id: 'refl-a',
      instruction:
        'Sebuah motif berada pada titik (4,3). Cerminkan motif tersebut terhadap sumbu-Y.\nTentukan titik bayangan dari motif karawo tersebut!',
      correctAnswer: { x: -4, y: 3 },
    },
    {
      id: 'refl-b',
      instruction:
        'Jika motif yang sama (titik awal 4,3) dicerminkan terhadap sumbu-X, berapa titik bayangan motif karawo tersebut?',
      correctAnswer: { x: 4, y: -3 },
    },
  ],
  conceptFeedback:
    'Bentuknya tetap sama, tetapi posisinya berlawanan seperti di cermin.',
  conceptRule:
    'Refleksi terhadap sumbu-Y: (x, y) → (−x, y)\nRefleksi terhadap sumbu-X: (x, y) → (x, −y)',
  voiceoverIntro:
    'Sekarang kita membuat bayangan motif. Perhatikan garis cermin di tengah. Menurutmu, di mana posisi bayangannya?',
  voiceoverCorrect: 'Iya, benar sekali! Bentuknya tetap sama, tetapi posisinya berlawanan seperti di cermin.',
  voiceoverWrong: 'Coba bayangkan saat kamu berdiri di depan cermin 😊',
}

// ─── ROTASI ──────────────────────────────────────────────────────────────────
// Soal LKPD: titik awal (2,1)
// a. 90° CCW → (-1,2)
// b. dari hasil a, rotasi 180° → (1,-2)
export const rotationActivity: LkpdActivity = {
  id: 'rotation',
  stimulusTitle: 'Motif Berputar yang Menarik',
  stimulusText:
    'Ibu Nita membuat pola berbentuk bunga yang melingkar. Pola bunga tersebut berada di titik (2,1). Kemudian ia membuat satu motif lagi dengan memutar motif berlawanan arah jarum jam sebesar 90° terhadap titik pusat (0,0). Setelah beberapa menit, Ibu Nita melanjutkan lagi dengan memutar motif searah jarum jam sebesar 180°. Nita sangat terkesan melihat pola karawo yang terbentuk.',
  subQuestions: [
    {
      id: 'rot-a',
      instruction:
        'Motif berada di titik (2,1). Putar motif berlawanan arah jarum jam sebesar 90° terhadap titik pusat O(0,0).\nBerapa titik koordinat posisi motif setelah dirotasi 90°?',
      correctAnswer: { x: -1, y: 2 },
    },
    {
      id: 'rot-b',
      instruction:
        'Dari posisi hasil rotasi sebelumnya di (−1,2), dilanjutkan dengan rotasi 180° terhadap O(0,0).\nBerapa titik koordinat posisi motif sekarang?',
      correctAnswer: { x: 1, y: -2 },
    },
  ],
  conceptFeedback:
    'Motif berubah arah, tetapi jaraknya terhadap pusat tetap sama.',
  conceptRule:
    'Rotasi 90° berlawanan jarum jam: (x, y) → (−y, x)\nRotasi 180°: (x, y) → (−x, −y)',
  voiceoverIntro:
    'Sekarang kita memutar motif karawo. Tekan tombol sudut putar dan amati perubahannya.',
  voiceoverCorrect: 'Keren sekali! Motif berubah arah, tetapi jaraknya terhadap pusat tetap.',
  voiceoverWrong: 'Perhatikan arah putarnya ya… apakah searah jarum jam atau berlawanan?',
}

// ─── DILATASI ────────────────────────────────────────────────────────────────
// Soal LKPD: titik awal (2,2), k=2
// a. hasil koordinat → (4,4)
// b. teks perubahan
export const dilationActivity: LkpdActivity = {
  id: 'dilation',
  stimulusTitle: 'Permainan Ukuran Motif',
  stimulusText:
    'Untuk memenuhi pesanan khusus, ibu Nita diminta membuat motif yang sama tetapi dengan ukuran lebih besar. Ia tidak menggambar ulang, tetapi memperbesar pola yang sudah ada. Motif awal berada di titik (2,2). Setelah diperbesar, motif tersebut tampak dua kali lebih besar dan lebih menonjol.',
  subQuestions: [
    {
      id: 'dil-a',
      instruction:
        'Posisi awal motif berada pada titik (2,2). Geser slider skala ke k=2, lalu amati perubahan.\nTentukan posisi titik motif setelah diperbesar!',
      correctAnswer: { x: 4, y: 4 },
    },
    {
      id: 'dil-b',
      instruction: 'Perubahan apakah yang terjadi pada motif setelah dilatasi dengan k=2?',
      isText: true,
      correctAnswerText: 'Terjadi perubahan ukuran motif. Motif menjadi 2 kali lebih besar.',
    } as SubQuestionText,
  ],
  conceptFeedback:
    'Ukuran berubah, tetapi bentuk motif tetap sama.',
  conceptRule:
    'Pada dilatasi:\n• bentuk tetap sama\n• ukuran berubah\n• jarak terhadap pusat berubah sesuai faktor skala\n\nRumus: (x, y) → (kx, ky)',
  voiceoverIntro: 'Sekarang kita memperbesar motif. Geser skala pada layar dan amati perubahan bentuknya.',
  voiceoverCorrect: 'Hebat 😊 Ukuran berubah, tetapi bentuk motif tetap sama.',
  voiceoverWrong: 'Coba perhatikan lagi… apakah bentuknya berubah?',
}

// ─── TANTANGAN ───────────────────────────────────────────────────────────────
// P(1,1) → geser ke (3,2) → refleksi sumbu X → (3,-2) → rotasi 90° CW → (-2,-3)
export interface ChallengeStep {
  label: string
  detail: string
  result: Point
  color: string
}

export const challengeData = {
  stimulusText:
    'Nita mencoba membuat desain sendiri. Ia mulai dari satu motif di titik P(1,1), lalu melakukan beberapa langkah sebagai berikut:\n\n1. Menggeser motif ke titik (3,2)\n2. Dicerminkan terhadap sumbu X\n3. Diputar 90° searah jarum jam terhadap pusat (0,0)\n\nTentukan posisi akhir titik tersebut!',
  startPoint: { label: 'P', x: 1, y: 1 } as Point & { label: string },
  correctAnswer: { x: -2, y: -3 } as Point,
  steps: [
    {
      label: '1. Translasi',
      detail: 'P(1,1) digeser menjadi titik (3,2)',
      result: { x: 3, y: 2 },
      color: '#EF4444',
    },
    {
      label: '2. Refleksi Sumbu X',
      detail: '(x,y) → (x,−y)  →  (3,2) menjadi (3,−2)',
      result: { x: 3, y: -2 },
      color: '#F97316',
    },
    {
      label: '3. Rotasi 90° Searah Jarum Jam',
      detail: '(x,y) → (y,−x)  →  (3,−2) menjadi (−2,−3)',
      result: { x: -2, y: -3 },
      color: '#3B82F6',
    },
  ] as ChallengeStep[],
  hints: [
    'Selesaikan langkah per langkah mulai dari translasi.',
    'Langkah 1: P(1,1) digeser ke titik (3,2).\nLangkah 2: Refleksi sumbu X → (3,2) menjadi (3,−2).',
    'Langkah 3: Rotasi 90° searah jarum jam → (x,y) → (y,−x) → (−2,−3).\nJawaban akhir: (−2, −3).',
  ],
  conceptFeedback:
    'Luar biasa! Kamu berhasil menggabungkan translasi, refleksi, dan rotasi. Itulah kehebatan transformasi geometri dalam motif Karawo!',
}
