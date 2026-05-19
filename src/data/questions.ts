import type { Question } from '@/domain/types'

export const translationQuestions: Question[] = [
  {
    id: 'translation-1',
    activityId: 'translation',
    title: 'Translasi Motif Bunga',
    instruction: 'Nita menggeser motif bunga dari titik A(1, 2) sejauh 4 satuan ke kanan dan 2 satuan ke atas. Tentukan koordinat bayangan titik A!',
    startPoint: { label: 'A', x: 1, y: 2 },
    transformation: { type: 'translation', vector: { a: 4, b: 2 } },
    correctAnswer: { x: 5, y: 4 },
    hints: [
      'Ke kanan berarti nilai x bertambah.',
      'Ke atas berarti nilai y bertambah.',
      "Gunakan rumus: A'(x + a, y + b) = A'(1 + 4, 2 + 2).",
    ],
    conceptFeedback: 'Translasi memindahkan motif tanpa mengubah bentuk dan ukurannya. Semua titik bergerak sejauh dan searah yang sama.',
  },
  {
    id: 'translation-2',
    activityId: 'translation',
    title: 'Geser Motif Karawo',
    instruction: 'Motif sulaman berada di titik B(2, 3). Geser motif 3 satuan ke kiri dan 1 satuan ke bawah. Tentukan koordinat bayangan B!',
    startPoint: { label: 'B', x: 2, y: 3 },
    transformation: { type: 'translation', vector: { a: -3, b: -1 } },
    correctAnswer: { x: -1, y: 2 },
    hints: [
      'Ke kiri berarti nilai x berkurang.',
      'Ke bawah berarti nilai y berkurang.',
      "Gunakan rumus: B'(x - 3, y - 1) = B'(2 - 3, 3 - 1).",
    ],
    conceptFeedback: 'Pada translasi, vektor (a, b) menentukan arah dan jarak pergeseran. Nilai negatif berarti ke kiri atau ke bawah.',
  },
  {
    id: 'translation-3',
    activityId: 'translation',
    title: 'Pergeseran Diagonal',
    instruction: 'Nita menempatkan motif di titik C(-2, -1). Geser motif sejauh 5 satuan ke kanan dan 3 satuan ke atas. Tentukan posisi akhir C!',
    startPoint: { label: 'C', x: -2, y: -1 },
    transformation: { type: 'translation', vector: { a: 5, b: 3 } },
    correctAnswer: { x: 3, y: 2 },
    hints: [
      'Tambahkan nilai a ke koordinat x.',
      'Tambahkan nilai b ke koordinat y.',
      "C'(-2 + 5, -1 + 3) = C'(?, ?).",
    ],
    conceptFeedback: 'Translasi dari titik manapun selalu menggunakan rumus yang sama: tambahkan vektor ke koordinat awal.',
  },
]

export const reflectionQuestions: Question[] = [
  {
    id: 'reflection-1',
    activityId: 'reflection',
    title: 'Cermin Terhadap Sumbu Y',
    instruction: 'Motif bunga berada di titik B(4, 3). Cerminkan motif terhadap sumbu Y. Tentukan koordinat bayangan B!',
    startPoint: { label: 'B', x: 4, y: 3 },
    transformation: { type: 'reflection', axis: 'y' },
    correctAnswer: { x: -4, y: 3 },
    hints: [
      'Refleksi terhadap sumbu Y mengubah tanda nilai x.',
      'Nilai y tetap sama.',
      "Gunakan rumus: B'(-x, y) = B'(-4, 3).",
    ],
    conceptFeedback: "Bayangan titik B(4, 3) terhadap sumbu Y adalah B'(-4, 3). Motif seperti bercermin pada garis tengah vertikal.",
  },
  {
    id: 'reflection-2',
    activityId: 'reflection',
    title: 'Cermin Terhadap Sumbu X',
    instruction: 'Motif karawo berada di titik C(3, 4). Cerminkan motif terhadap sumbu X. Tentukan koordinat bayangan C!',
    startPoint: { label: 'C', x: 3, y: 4 },
    transformation: { type: 'reflection', axis: 'x' },
    correctAnswer: { x: 3, y: -4 },
    hints: [
      'Refleksi terhadap sumbu X mengubah tanda nilai y.',
      'Nilai x tetap sama.',
      "Gunakan rumus: C'(x, -y) = C'(3, -4).",
    ],
    conceptFeedback: "Bayangan titik C(3, 4) terhadap sumbu X adalah C'(3, -4). Titik dicerminkan pada garis horizontal.",
  },
  {
    id: 'reflection-3',
    activityId: 'reflection',
    title: 'Cermin y = x',
    instruction: 'Titik D(2, 5) dicerminkan terhadap garis y = x. Tentukan koordinat bayangan D!',
    startPoint: { label: 'D', x: 2, y: 5 },
    transformation: { type: 'reflection', axis: 'y=x' },
    correctAnswer: { x: 5, y: 2 },
    hints: [
      'Refleksi terhadap y = x menukar koordinat x dan y.',
      'Nilai x menjadi y, dan nilai y menjadi x.',
      "Gunakan rumus: D'(y, x) = D'(5, 2).",
    ],
    conceptFeedback: "Pada refleksi terhadap y = x, koordinat x dan y saling bertukar. Bayangan D(2, 5) adalah D'(5, 2).",
  },
]

export const rotationQuestions: Question[] = [
  {
    id: 'rotation-1',
    activityId: 'rotation',
    title: 'Putar 90° Berlawanan Jarum Jam',
    instruction: 'Motif berada di titik C(2, 1). Putar motif 90° berlawanan arah jarum jam terhadap titik pusat O(0, 0). Tentukan koordinat C!',
    startPoint: { label: 'C', x: 2, y: 1 },
    transformation: { type: 'rotation', angle: 90, direction: 'ccw' },
    correctAnswer: { x: -1, y: 2 },
    hints: [
      'Rotasi 90° berlawanan jarum jam: (x, y) → (-y, x).',
      'Ubah x menjadi negatif y, dan y menjadi x.',
      "C'(-1, 2) adalah jawaban yang benar.",
    ],
    conceptFeedback: "Rotasi 90° berlawanan jarum jam terhadap O menggunakan rumus (x, y) → (-y, x). Jadi C(2, 1) → C'(-1, 2).",
  },
  {
    id: 'rotation-2',
    activityId: 'rotation',
    title: 'Putar 180°',
    instruction: 'Motif berada di titik D(3, 2). Putar motif 180° terhadap titik pusat O(0, 0). Tentukan koordinat D!',
    startPoint: { label: 'D', x: 3, y: 2 },
    transformation: { type: 'rotation', angle: 180, direction: 'ccw' },
    correctAnswer: { x: -3, y: -2 },
    hints: [
      'Rotasi 180° mengubah tanda kedua koordinat.',
      'Gunakan rumus: (x, y) → (-x, -y).',
      "D'(-3, -2) adalah jawaban yang benar.",
    ],
    conceptFeedback: "Rotasi 180° terhadap O menggunakan rumus (x, y) → (-x, -y). Jadi D(3, 2) → D'(-3, -2). Titik berpindah ke sisi berlawanan.",
  },
  {
    id: 'rotation-3',
    activityId: 'rotation',
    title: 'Putar 270° Berlawanan Jarum Jam',
    instruction: 'Titik E(1, 3) diputar 270° berlawanan arah jarum jam terhadap O(0, 0). Tentukan koordinat E!',
    startPoint: { label: 'E', x: 1, y: 3 },
    transformation: { type: 'rotation', angle: 270, direction: 'ccw' },
    correctAnswer: { x: 3, y: -1 },
    hints: [
      'Rotasi 270° berlawanan jarum jam: (x, y) → (y, -x).',
      'x menjadi y, dan y menjadi -x.',
      "E'(3, -1) adalah jawaban yang benar.",
    ],
    conceptFeedback: "Rotasi 270° berlawanan jarum jam sama dengan 90° searah jarum jam. Rumusnya: (x, y) → (y, -x). Jadi E(1, 3) → E'(3, -1).",
  },
]

export const dilationQuestions: Question[] = [
  {
    id: 'dilation-1',
    activityId: 'dilation',
    title: 'Perbesar Motif k = 2',
    instruction: 'Motif berada di titik D(2, 2). Motif diperbesar dengan faktor skala k = 2 terhadap titik pusat O(0, 0). Tentukan koordinat D!',
    startPoint: { label: 'D', x: 2, y: 2 },
    transformation: { type: 'dilation', scale: 2, center: { x: 0, y: 0 } },
    correctAnswer: { x: 4, y: 4 },
    hints: [
      'Dilatasi: kalikan setiap koordinat dengan faktor skala k.',
      'Gunakan rumus: (kx, ky).',
      "D'(2×2, 2×2) = D'(4, 4).",
    ],
    conceptFeedback: "Dilatasi dengan k = 2 memperbesar jarak setiap titik dari pusat menjadi 2 kali lipat. D(2, 2) → D'(4, 4).",
  },
  {
    id: 'dilation-2',
    activityId: 'dilation',
    title: 'Perbesar Motif k = 3',
    instruction: 'Motif karawo berada di titik E(1, 2). Diperbesar dengan faktor skala k = 3 terhadap O(0, 0). Tentukan koordinat E!',
    startPoint: { label: 'E', x: 1, y: 2 },
    transformation: { type: 'dilation', scale: 3, center: { x: 0, y: 0 } },
    correctAnswer: { x: 3, y: 6 },
    hints: [
      'Kalikan koordinat x dengan k = 3.',
      'Kalikan koordinat y dengan k = 3.',
      "E'(1×3, 2×3) = E'(3, 6).",
    ],
    conceptFeedback: "Dilatasi dengan k = 3 memperbesar motif 3 kali lipat dari pusat. E(1, 2) → E'(3, 6).",
  },
  {
    id: 'dilation-3',
    activityId: 'dilation',
    title: 'Perkecil Motif k = 0.5',
    instruction: 'Titik F(4, 2) diperkecil dengan faktor skala k = 0.5 terhadap O(0, 0). Tentukan koordinat F!',
    startPoint: { label: 'F', x: 4, y: 2 },
    transformation: { type: 'dilation', scale: 0.5, center: { x: 0, y: 0 } },
    correctAnswer: { x: 2, y: 1 },
    hints: [
      'Kalikan koordinat dengan k = 0.5 (setengahnya).',
      'Dilatasi k < 1 memperkecil ukuran.',
      "F'(4×0.5, 2×0.5) = F'(2, 1).",
    ],
    conceptFeedback: "Dilatasi dengan k = 0.5 memperkecil motif menjadi setengahnya. F(4, 2) → F'(2, 1). Bentuk motif tetap sama, hanya ukurannya berubah.",
  },
]

export const challengeQuestion: Question = {
  id: 'challenge-1',
  activityId: 'challenge',
  title: 'Tantangan Akhir HOTS',
  instruction: 'Nita mulai dari titik P(1, 1), kemudian:\n1. Digeser sejauh (3, 2)\n2. Dicerminkan terhadap sumbu X\n3. Diputar 90° berlawanan arah jarum jam terhadap O(0, 0)\n\nTentukan posisi akhir titik tersebut!',
  startPoint: { label: 'P', x: 1, y: 1 },
  transformation: {
    type: 'challenge',
    steps: [
      { type: 'translation', vector: { a: 3, b: 2 } },
      { type: 'reflection', axis: 'x' },
      { type: 'rotation', angle: 90, direction: 'ccw' },
    ],
    intermediatePoints: [
      { x: 4, y: 3 },
      { x: 4, y: -3 },
    ],
  },
  correctAnswer: { x: 3, y: 4 },
  hints: [
    'Selesaikan langkah per langkah.',
    'Langkah 1: Translasi (3, 2) → P(1,1) + (3,2) = (4, 3).',
    'Langkah 2: Refleksi sumbu X → (4, -3). Langkah 3: Rotasi 90° CCW → (-y, x) = (3, 4).',
  ],
  conceptFeedback: 'Luar biasa! Kamu berhasil menggabungkan translasi, refleksi, dan rotasi. Itulah kehebatan transformasi geometri dalam motif Karawo!',
}
