export interface VoiceoverLine {
  scene: string
  text: string
}

export const voiceovers = {
  splash: [
    'Halo… aku Nita 😊',
    'Selamat datang di LKPD Etnomatematika Digital.',
    'Hari ini kita akan belajar transformasi geometri melalui sulaman karawo khas Gorontalo.',
    'Yuk mulai petualangan belajar kita!',
  ],
  home: [
    'Di aplikasi ini, kamu bisa belajar sambil mengeksplorasi motif karawo.',
    'Kamu akan menemukan bagaimana matematika digunakan dalam kehidupan sehari-hari.',
    'Pilih menu yang ingin kamu pelajari ya 😊',
  ],
  story: [
    'Sejak kecil aku sering melihat ibu menyulam karawo.',
    'Awalnya aku hanya melihat motif yang indah…',
    'Tetapi ternyata, di balik sulaman itu ada banyak konsep matematika.',
    'Tanpa sadar, ibu menggunakan pergeseran, pencerminan, putaran, dan perbesaran motif.',
    'Menarik sekali, ya?',
  ],
  translation: {
    intro: 'Sekarang kita belajar translasi. Perhatikan motif karawo di layar. Coba geser motif ke posisi yang sesuai.',
    correct: 'Hebat! 🎉 Motif hanya berpindah tempat tanpa berubah bentuk. Itulah yang disebut translasi atau pergeseran.',
    wrong: 'Hmm… coba perhatikan lagi arah pergeserannya ya. Geser ke kanan terlebih dahulu, lalu ke atas.',
  },
  reflection: {
    intro: 'Sekarang kita membuat bayangan motif. Perhatikan garis cermin di tengah. Menurutmu, di mana posisi bayangannya?',
    correct: 'Iya, benar sekali! Bentuknya tetap sama, tetapi posisinya berlawanan seperti di cermin.',
    wrong: 'Coba bayangkan saat kamu berdiri di depan cermin 😊',
  },
  rotation: {
    intro: 'Sekarang kita memutar motif karawo. Tekan tombol sudut putar dan amati perubahannya.',
    correct: 'Keren sekali! Motif berubah arah, tetapi jaraknya terhadap pusat tetap.',
    wrong: 'Perhatikan arah putarnya ya… apakah searah jarum jam atau berlawanan?',
  },
  dilation: {
    intro: 'Sekarang kita memperbesar motif. Geser skala pada layar dan amati perubahan bentuknya.',
    correct: 'Hebat 😊 Ukuran berubah, tetapi bentuk motif tetap sama.',
    wrong: 'Coba perhatikan lagi… apakah bentuknya berubah?',
  },
  challenge: {
    intro: 'Sekarang saatnya tantangan! Aku ingin membuat pola karawo baru, tetapi aku membutuhkan bantuanmu. Gunakan pemahamanmu tentang transformasi geometri untuk menyelesaikan tantangan ini. Semangat ya!',
    correct: 'Luar biasa! Kamu berhasil menyelesaikan semua tantangan transformasi geometri!',
    wrong: 'Selesaikan langkah per langkah ya. Cek kembali setiap transformasinya.',
  },
  result: [
    'Selamat 🎉',
    'Kamu sudah menyelesaikan pembelajaran hari ini.',
    'Skor yang kamu peroleh menunjukkan usaha belajarmu.',
    'Terus semangat belajar dan jangan takut mencoba.',
  ],
  studentReflection: [
    'Hari ini kita belajar bahwa matematika ada di sekitar kita.',
    'Bahkan dalam budaya dan karya tradisional seperti karawo.',
    'Menurutmu… bagian mana yang paling menarik?',
  ],
  closing: [
    'Terima kasih sudah belajar bersamaku 😊',
    'Sampai jumpa di petualangan berikutnya.',
    'Tetap semangat belajar dan cintai budaya daerah kita.',
  ],
}
