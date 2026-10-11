import { QuestionItem } from '../types/game';

// Helper to create visual fraction pie SVG data URI
function makeFractionPieSvg(numerator: number, denominator: number, color = '#3B82F6'): string {
  const size = 160;
  const cx = 80;
  const cy = 80;
  const r = 68;

  let paths = '';
  for (let i = 0; i < denominator; i++) {
    const startAngle = (i * 2 * Math.PI) / denominator - Math.PI / 2;
    const endAngle = ((i + 1) * 2 * Math.PI) / denominator - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const isShaded = i < numerator;
    const fill = isShaded ? color : '#F1F5F9';
    const stroke = '#334155';

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    paths += `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#F1F5F9" />
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="4" fill="#334155" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Helper to create rectangle bar fraction
function makeFractionBarSvg(numerator: number, denominator: number, color = '#10B981'): string {
  const w = 240;
  const h = 70;
  const cellW = (w - 20) / denominator;
  let rects = '';

  for (let i = 0; i < denominator; i++) {
    const x = 10 + i * cellW;
    const isShaded = i < numerator;
    const fill = isShaded ? color : '#F8FAFC';
    rects += `<rect x="${x}" y="15" width="${cellW}" height="40" fill="${fill}" stroke="#334155" stroke-width="2" rx="4" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" rx="10" fill="#E2E8F0" />
    ${rects}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'soal-1',
    grade: 'Kelas 3',
    title: 'Mengenal Pecahan Dasar',
    questionText: 'Sebuah pizza dipotong menjadi 4 bagian sama besar. Fadhika memakan 1 bagian. Berapa bagian pizza yang dimakan Fadhika?',
    questionImage: makeFractionPieSvg(1, 4, '#F59E0B'),
    options: [
      { id: 'opt-1-a', label: 'A', text: '1/2 bagian' },
      { id: 'opt-1-b', label: 'B', text: '1/4 bagian' },
      { id: 'opt-1-c', label: 'C', text: '3/4 bagian' },
      { id: 'opt-1-d', label: 'D', text: '2/4 bagian' },
    ],
    correctOptionId: 'opt-1-b',
    explanation: 'Karena 1 bagian dimakan dari total 4 bagian sama rata, pecahannya adalah 1/4.',
  },
  {
    id: 'soal-2',
    grade: 'Kelas 3',
    title: 'Pembilang dan Penyebut',
    questionText: 'Pada lambang pecahan 3/5, bilangan 3 dinamakan...',
    options: [
      { id: 'opt-2-a', label: 'A', text: 'Penyebut' },
      { id: 'opt-2-b', label: 'B', text: 'Pembilang' },
      { id: 'opt-2-c', label: 'C', text: 'Pembagi' },
      { id: 'opt-2-d', label: 'D', text: 'Faktor' },
    ],
    correctOptionId: 'opt-2-b',
    explanation: 'Pada pecahan a/b, angka di bagian atas (3) adalah pembilang, sedangkan angka di bawah (5) adalah penyebut.',
  },
  {
    id: 'soal-3',
    grade: 'Kelas 4',
    title: 'Pecahan Senilai',
    questionText: 'Pecahan manakah yang senilai dengan 1/2?',
    questionImage: makeFractionBarSvg(2, 4, '#3B82F6'),
    options: [
      { id: 'opt-3-a', label: 'A', text: '2/4' },
      { id: 'opt-3-b', label: 'B', text: '2/5' },
      { id: 'opt-3-c', label: 'C', text: '1/3' },
      { id: 'opt-3-d', label: 'D', text: '3/8' },
    ],
    correctOptionId: 'opt-3-a',
    explanation: 'Jika pembilang dan penyebut 1/2 dikalikan 2, didapatkan (1×2)/(2×2) = 2/4.',
  },
  {
    id: 'soal-4',
    grade: 'Kelas 4',
    title: 'Menyederhanakan Pecahan',
    questionText: 'Bentuk paling sederhana dari pecahan 6/8 adalah...',
    options: [
      { id: 'opt-4-a', label: 'A', text: '2/4' },
      { id: 'opt-4-b', label: 'B', text: '3/4' },
      { id: 'opt-4-c', label: 'C', text: '1/2' },
      { id: 'opt-4-d', label: 'D', text: '4/5' },
    ],
    correctOptionId: 'opt-4-b',
    explanation: 'Bagi pembilang dan penyebut dengan FPB-nya (yaitu 2): 6 ÷ 2 = 3, dan 8 ÷ 2 = 4. Hasilnya 3/4.',
  },
  {
    id: 'soal-5',
    grade: 'Kelas 3',
    title: 'Penjumlahan Pecahan Penyebut Sama',
    questionText: 'Berapakah hasil dari 2/7 + 3/7?',
    questionImage: makeFractionBarSvg(5, 7, '#EC4899'),
    options: [
      { id: 'opt-5-a', label: 'A', text: '5/14' },
      { id: 'opt-5-b', label: 'B', text: '5/7' },
      { id: 'opt-5-c', label: 'C', text: '6/7' },
      { id: 'opt-5-d', label: 'D', text: '1/7' },
    ],
    correctOptionId: 'opt-5-b',
    explanation: 'Karena penyebutnya sudah sama (7), jumlahkan saja pembilangnya: 2 + 3 = 5. Hasilnya 5/7.',
  },
  {
    id: 'soal-6',
    grade: 'Kelas 4',
    title: 'Pengurangan Pecahan Penyebut Sama',
    questionText: 'Berapakah hasil dari 7/9 - 4/9?',
    options: [
      { id: 'opt-6-a', label: 'A', text: '3/9 (atau 1/3)' },
      { id: 'opt-6-b', label: 'B', text: '3/0' },
      { id: 'opt-6-c', label: 'C', text: '11/9' },
      { id: 'opt-6-d', label: 'D', text: '2/9' },
    ],
    correctOptionId: 'opt-6-a',
    explanation: 'Penyebut sama (9), kurangkan pembilang: 7 - 4 = 3. Jadi hasilnya 3/9, yang disederhanakan menjadi 1/3.',
  },
  {
    id: 'soal-7',
    grade: 'Kelas 4',
    title: 'Membandingkan Pecahan',
    questionText: 'Tanda yang tepat untuk membandingkan: 3/5 ... 1/5 adalah...',
    options: [
      { id: 'opt-7-a', label: 'A', text: '< (lebih kecil)' },
      { id: 'opt-7-b', label: 'B', text: '> (lebih besar)' },
      { id: 'opt-7-c', label: 'C', text: '= (sama dengan)' },
      { id: 'opt-7-d', label: 'D', text: '≤ (kurang dari)' },
    ],
    correctOptionId: 'opt-7-b',
    explanation: 'Dengan penyebut yang sama (5), 3 bagian tentu lebih besar daripada 1 bagian (3 > 1). Jadi 3/5 > 1/5.',
  },
  {
    id: 'soal-8',
    grade: 'Kelas 4',
    title: 'Arsiran Pecahan Diagram',
    questionText: 'Berapakah nilai pecahan yang ditunjukkan oleh diagram lingkaran berikut?',
    questionImage: makeFractionPieSvg(3, 8, '#8B5CF6'),
    options: [
      { id: 'opt-8-a', label: 'A', text: '3/8' },
      { id: 'opt-8-b', label: 'B', text: '5/8' },
      { id: 'opt-8-c', label: 'C', text: '3/5' },
      { id: 'opt-8-d', label: 'D', text: '4/8' },
    ],
    correctOptionId: 'opt-8-a',
    explanation: 'Diagram lingkaran terbagi menjadi 8 juring sama besar, dan 3 juring diwarnai. Maka pecahannya 3/8.',
  },
  {
    id: 'soal-9',
    grade: 'Kelas 5',
    title: 'Penjumlahan Penyebut Berbeda',
    questionText: 'Berapakah hasil dari 1/2 + 1/4?',
    questionImage: makeFractionBarSvg(3, 4, '#10B981'),
    options: [
      { id: 'opt-9-a', label: 'A', text: '2/6' },
      { id: 'opt-9-b', label: 'B', text: '3/4' },
      { id: 'opt-9-c', label: 'C', text: '2/4' },
      { id: 'opt-9-d', label: 'D', text: '1/8' },
    ],
    correctOptionId: 'opt-9-b',
    explanation: 'Samakan penyebut menjadi 4: 1/2 senilai dengan 2/4. Maka 2/4 + 1/4 = 3/4.',
  },
  {
    id: 'soal-10',
    grade: 'Kelas 5',
    title: 'Pecahan Campuran ke Pecahan Biasa',
    questionText: 'Bentuk pecahan biasa dari 2 1/3 (dua satu per tiga) adalah...',
    options: [
      { id: 'opt-10-a', label: 'A', text: '5/3' },
      { id: 'opt-10-b', label: 'B', text: '7/3' },
      { id: 'opt-10-c', label: 'C', text: '6/3' },
      { id: 'opt-10-d', label: 'D', text: '3/2' },
    ],
    correctOptionId: 'opt-10-b',
    explanation: 'Kalikan bilangan bulat dengan penyebut, lalu tambah pembilang: (2 × 3) + 1 = 7. Jadi pecahannya 7/3.',
  },
  {
    id: 'soal-11',
    grade: 'Kelas 4',
    title: 'Pecahan Senilai Lanjutan',
    questionText: 'Jika 2/3 = n/12, berapakah nilai n yang tepat?',
    options: [
      { id: 'opt-11-a', label: 'A', text: '6' },
      { id: 'opt-11-b', label: 'B', text: '8' },
      { id: 'opt-11-c', label: 'C', text: '9' },
      { id: 'opt-11-d', label: 'D', text: '10' },
    ],
    correctOptionId: 'opt-11-b',
    explanation: 'Penyebut 3 dikalikan 4 menjadi 12, maka pembilang 2 juga harus dikalikan 4: 2 × 4 = 8. Jadi n = 8.',
  },
  {
    id: 'soal-12',
    grade: 'Kelas 5',
    title: 'Pecahan Biasa ke Pecahan Campuran',
    questionText: 'Bentuk pecahan campuran dari 9/4 adalah...',
    options: [
      { id: 'opt-12-a', label: 'A', text: '2 1/4' },
      { id: 'opt-12-b', label: 'B', text: '2 3/4' },
      { id: 'opt-12-c', label: 'C', text: '1 5/4' },
      { id: 'opt-12-d', label: 'D', text: '3 1/4' },
    ],
    correctOptionId: 'opt-12-a',
    explanation: '9 dibagi 4 menghasilkan 2 dengan sisa 1. Maka pecahan campurannya adalah 2 1/4.',
  },
  {
    id: 'soal-13',
    grade: 'Kelas 4',
    title: 'Soal Cerita Pecahan Roti',
    questionText: 'Ibu memiliki 1 loyang kue. Kakak mengambil 2/6 bagian dan Adik mengambil 3/6 bagian. Berapa bagian kue yang sudah diambil?',
    options: [
      { id: 'opt-13-a', label: 'A', text: '5/6 bagian' },
      { id: 'opt-13-b', label: 'B', text: '1/6 bagian' },
      { id: 'opt-13-c', label: 'C', text: '5/12 bagian' },
      { id: 'opt-13-d', label: 'D', text: '1 bagian utuh' },
    ],
    correctOptionId: 'opt-13-a',
    explanation: 'Jumlahkan bagian Kakak dan Adik: 2/6 + 3/6 = 5/6 bagian kue.',
  },
  {
    id: 'soal-14',
    grade: 'Kelas 5',
    title: 'Pengurangan Pecahan Berpenyebut Beda',
    questionText: 'Berapakah hasil dari 3/4 - 1/2?',
    options: [
      { id: 'opt-14-a', label: 'A', text: '1/4' },
      { id: 'opt-14-b', label: 'B', text: '2/2' },
      { id: 'opt-14-c', label: 'C', text: '1/2' },
      { id: 'opt-14-d', label: 'D', text: '2/4' },
    ],
    correctOptionId: 'opt-14-a',
    explanation: 'Ubah 1/2 menjadi 2/4. Maka 3/4 - 2/4 = 1/4.',
  },
  {
    id: 'soal-15',
    grade: 'Kelas 5',
    title: 'Perkalian Pecahan Sederhana',
    questionText: 'Berapakah hasil dari 1/2 × 2/3?',
    options: [
      { id: 'opt-15-a', label: 'A', text: '2/6 (senilai dengan 1/3)' },
      { id: 'opt-15-b', label: 'B', text: '3/5' },
      { id: 'opt-15-c', label: 'C', text: '1/5' },
      { id: 'opt-15-d', label: 'D', text: '2/5' },
    ],
    correctOptionId: 'opt-15-a',
    explanation: 'Kalikan pembilang dengan pembilang (1 × 2 = 2), dan penyebut dengan penyebut (2 × 3 = 6). Hasilnya 2/6 = 1/3.',
  },
  {
    id: 'soal-16',
    grade: 'Kelas 4',
    title: 'Menyederhanakan Pecahan Puluhan',
    questionText: 'Bentuk sederhana dari 10/25 adalah...',
    options: [
      { id: 'opt-16-a', label: 'A', text: '2/5' },
      { id: 'opt-16-b', label: 'B', text: '1/5' },
      { id: 'opt-16-c', label: 'C', text: '3/5' },
      { id: 'opt-16-d', label: 'D', text: '5/10' },
    ],
    correctOptionId: 'opt-16-a',
    explanation: 'Bagi pembilang dan penyebut dengan 5: 10 ÷ 5 = 2, 25 ÷ 5 = 5. Jadi 2/5.',
  },
  {
    id: 'soal-17',
    grade: 'Kelas 5',
    title: 'Pecahan Desimal',
    questionText: 'Bentuk pecahan desimal dari 3/10 adalah...',
    options: [
      { id: 'opt-17-a', label: 'A', text: '0,03' },
      { id: 'opt-17-b', label: 'B', text: '0,3' },
      { id: 'opt-17-c', label: 'C', text: '3,0' },
      { id: 'opt-17-d', label: 'D', text: '0,33' },
    ],
    correctOptionId: 'opt-17-b',
    explanation: 'Pecahan berpenyebut 10 memiliki satu angka di belakang koma: 3/10 = 0,3.',
  },
  {
    id: 'soal-18',
    grade: 'Kelas 5',
    title: 'Persen dan Pecahan',
    questionText: 'Bentuk persen (%) dari pecahan 1/4 adalah...',
    options: [
      { id: 'opt-18-a', label: 'A', text: '20%' },
      { id: 'opt-18-b', label: 'B', text: '25%' },
      { id: 'opt-18-c', label: 'C', text: '40%' },
      { id: 'opt-18-d', label: 'D', text: '50%' },
    ],
    correctOptionId: 'opt-18-b',
    explanation: 'Ubah penyebut menjadi 100: (1 × 25) / (4 × 25) = 25/100 = 25%.',
  },
  {
    id: 'soal-19',
    grade: 'Kelas 6',
    title: 'Pembagian Pecahan',
    questionText: 'Berapakah hasil dari 1/2 ÷ 1/4?',
    options: [
      { id: 'opt-19-a', label: 'A', text: '1/8' },
      { id: 'opt-19-b', label: 'B', text: '2' },
      { id: 'opt-19-c', label: 'C', text: '4' },
      { id: 'opt-19-d', label: 'D', text: '1/2' },
    ],
    correctOptionId: 'opt-19-b',
    explanation: 'Ubah pembagian menjadi perkalian dengan kebalikan pecahan kedua: 1/2 × 4/1 = 4/2 = 2.',
  },
  {
    id: 'soal-20',
    grade: 'Kelas 6',
    title: 'Operasi Campuran Pecahan',
    questionText: 'Fadhika mempunyai tali sepanjang 3/4 meter. Ia menyambungnya dengan tali 1/4 meter, lalu memotong 2/4 meter untuk mengikat bendera. Berapa sisa tali Fadhika sekarang?',
    options: [
      { id: 'opt-20-a', label: 'A', text: '2/4 meter (atau 1/2 m)' },
      { id: 'opt-20-b', label: 'B', text: '1/4 meter' },
      { id: 'opt-20-c', label: 'C', text: '3/4 meter' },
      { id: 'opt-20-d', label: 'D', text: '4/4 meter' },
    ],
    correctOptionId: 'opt-20-a',
    explanation: '(3/4 + 1/4) - 2/4 = 4/4 - 2/4 = 2/4 meter = 1/2 meter. Selamat menyelesaikan tantangan bintang ke-20!',
  },
];
