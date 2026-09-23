// Database Stasiun (Koordinat Canvas Jawa & Sumatra)
const STATIONS = {
  // Jawa
  GMR: { id: 'GMR', region: 'JAWA', name: 'Jakarta Gambir', x: 120, y: 120 },
  BD:  { id: 'BD',  region: 'JAWA', name: 'Bandung',        x: 180, y: 200 },
  SMT: { id: 'SMT', region: 'JAWA', name: 'Semarang Tawang', x: 450, y: 110 },
  YK:  { id: 'YK',  region: 'JAWA', name: 'Yogyakarta',     x: 520, y: 220 },
  SGB: { id: 'SGB', region: 'JAWA', name: 'Surabaya Gubeng', x: 780, y: 160 },

  // Sumatra
  MDN: { id: 'MDN', region: 'SUMATRA', name: 'Medan',         x: 200, y: 90 },
  PKU: { id: 'PKU', region: 'SUMATRA', name: 'Pekanbaru',     x: 350, y: 150 },
  PDG: { id: 'PDG', region: 'SUMATRA', name: 'Padang',        x: 280, y: 200 },
  PLB: { id: 'PLB', region: 'SUMATRA', name: 'Palembang',     x: 580, y: 220 },
  TKG: { id: 'TKG', region: 'SUMATRA', name: 'Bandar Lampung', x: 720, y: 260 }
};

// Master Stasiun & Rute Visual Lengkap (Jawa dan Sumatera)
const stationsData = {
  jawa: [
    { id: 'merak', name: 'Merak (Banten)', x: 30, y: 150 },
    { id: 'serang', name: 'Serang', x: 50, y: 165 },
    { id: 'rangkas', name: 'Rangkasbitung', x: 70, y: 180 },
    { id: 'bogor', name: 'Bogor', x: 100, y: 200 },
    { id: 'gambir', name: 'Jakarta Gambir', x: 120, y: 130 },
    { id: 'pasarsenen', name: 'Jakarta Pasar Senen', x: 130, y: 140 },
    { id: 'bekasi', name: 'Bekasi', x: 150, y: 145 },
    { id: 'karawang', name: 'Karawang', x: 180, y: 160 },
    { id: 'bandung', name: 'Bandung', x: 220, y: 230 },
    { id: 'garut', name: 'Garut / Cipeundeuy', x: 260, y: 250 },
    { id: 'tasikmalaya', name: 'Tasikmalaya', x: 290, y: 260 },
    { id: 'banjar', name: 'Banjar', x: 320, y: 265 },
    { id: 'cirebon', name: 'Cirebon', x: 310, y: 150 },
    { id: 'tegal', name: 'Tegal', x: 370, y: 155 },
    { id: 'pekallongan', name: 'Pekalongan', x: 420, y: 155 },
    { id: 'purwokerto', name: 'Purwokerto', x: 390, y: 230 },
    { id: 'kutoarjo', name: 'Kutoarjo', x: 450, y: 255 },
    { id: 'semarang', name: 'Semarang Tawang', x: 490, y: 130 },
    { id: 'yogyakarta', name: 'Yogyakarta', x: 520, y: 260 },
    { id: 'solobalapan', name: 'Solo Balapan', x: 570, y: 250 },
    { id: 'madiun', name: 'Madiun', x: 640, y: 230 },
    { id: 'kertosono', name: 'Kertosono', x: 690, y: 220 },
    { id: 'bojonegoro', name: 'Bojonegoro', x: 660, y: 150 },
    { id: 'surabaya', name: 'Surabaya Gubeng / Pasar Turi', x: 760, y: 160 },
    { id: 'malang', name: 'Malang Kotabaru', x: 760, y: 260 },
    { id: 'probolinggo', name: 'Probolinggo', x: 820, y: 210 },
    { id: 'jember', name: 'Jember', x: 880, y: 230 },
    { id: 'banyuwangi', name: 'Banyuwangi Ketapang', x: 960, y: 220 }
  ],
  sumatra: [
    { id: 'banda_aceh', name: 'Banda Aceh', x: 50, y: 50 },
    { id: 'lhokseumawe', name: 'Lhokseumawe', x: 110, y: 80 },
    { id: 'langsa', name: 'Langsa', x: 160, y: 100 },
    { id: 'medan', name: 'Medan', x: 220, y: 120 },
    { id: 'tebingtinggi', name: 'Tebing Tinggi', x: 270, y: 140 },
    { id: 'kisaran', name: 'Kisaran / Rantau Prapat', x: 330, y: 170 },
    { id: 'padang', name: 'Padang (Simpang Haru)', x: 390, y: 250 },
    { id: 'lubuklinggau', name: 'Lubuk Linggau', x: 590, y: 280 },
    { id: 'prabumulih', name: 'Prabumulih', x: 680, y: 250 },
    { id: 'palembang', name: 'Palembang Kertapati', x: 730, y: 210 },
    { id: 'baturaja', name: 'Baturaja', x: 790, y: 260 },
    { id: 'kotabumi', name: 'Kotabumi', x: 840, y: 280 },
    { id: 'lampung', name: 'Tanjung Karang (Lampung)', x: 900, y: 300 },
    { id: 'bakauheni', name: 'Pelabuhan Bakauheni', x: 950, y: 320 }
  ]
};

// Master Data Lokomotif dan Trainset Indonesia
const trainUnits = [
  { id: 'bb301', name: 'BB 301 / BB 304 (Klasik)', speed: '75 km/jam', capacity: 6, price: 800000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/BB301_26.jpg/320px-BB301_26.jpg', desc: 'Lokomotif diesel-hidrolik legendaris era 1970-an Krupp Jerman.' },
  { id: 'cc201', name: 'CC 201 (GE U18C)', speed: '90 km/jam', capacity: 8, price: 1500000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/CC201_83_25_Purwokerto.png/320px-CC201_83_25_Purwokerto.png', desc: 'Lokomotif pekerja keras utama KAI di Pulau Jawa & Sumatera.' },
  { id: 'cc202', name: 'CC 202 (EMD G26MC-2)', speed: '80 km/jam', capacity: 14, price: 2800000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/CC_202_08_Kertapati.jpg/320px-CC_202_08_Kertapati.jpg', desc: 'Lokomotif kelas berat khusus angkutan batu bara babaranjang Sumatera.' },
  { id: 'cc203', name: 'CC 203 (GE U20C Aerodynamic)', speed: '100 km/jam', capacity: 10, price: 2200000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/CC_203_01_01_Jember.png/320px-CC_203_01_01_Jember.png', desc: 'Desain moncong miring khas untuk kereta penumpang ekspres.' },
  { id: 'cc204', name: 'CC 204 (GE C20EMP Brightstar)', speed: '110 km/jam', capacity: 10, price: 3200000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/CC204_08_CN.jpg/320px-CC204_08_CN.jpg', desc: 'Lokomotif GE modern dilengkapi sistem komputerisasi Brightstar.' },
  { id: 'cc205', name: 'CC 205 (EMD GT38AC)', speed: '90 km/jam', capacity: 16, price: 4200000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/CC_205_13_29_TNK.jpg/320px-CC_205_13_29_TNK.jpg', desc: 'Lokomotif terkuat di Indonesia dengan traksi AC buatan Electro-Motive Diesel.' },
  { id: 'cc206', name: 'CC 206 (GE CM20EMP Double Cab)', speed: '120 km/jam', capacity: 12, price: 4500000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CC206_13_55_SMC.png/320px-CC206_13_55_SMC.png', desc: 'Lokomotif dua kabin serbaguna untuk KA Eksekutif, Ekonomi, & Barang.' },
  { id: 'cc300', name: 'CC 300 (INKA Diesel Hydraulic)', speed: '110 km/jam', capacity: 10, price: 3800000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/CC300_12_01.jpg/320px-CC300_12_01.jpg', desc: 'Lokomotif buatan anak bangsa buatan PT INKA Madiun tahan banjir.' },
  { id: 'krl_commuter', name: 'KRL Commuter Line (JR 205)', speed: '100 km/jam', capacity: 10, price: 2000000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KRL_Commuterline_JR_205.png/320px-KRL_Commuterline_JR_205.png', desc: 'Rangkaian KRL komuter perkotaan aglomerasi Jabodetabek & Jogja-Solo.' },
  { id: 'ka_bandara', name: 'KA Bandara (Railink / KAU)', speed: '120 km/jam', capacity: 8, price: 3500000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/KAA_Soekarno-Hatta.jpg/320px-KAA_Soekarno-Hatta.jpg', desc: 'Kereta rel listrik ekspres penghubung pusat kota ke Bandara.' },
  { id: 'lrt_mrt', name: 'MRT Jakarta / LRT Jabodebek', speed: '110 km/jam', capacity: 6, price: 5000000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/MRT_Jakarta_Ratrimaya.jpg/320px-MRT_Jakarta_Ratrimaya.jpg', desc: 'Trainset modern nirawak (driverless) standar metro internasional.' },
  { id: 'kcic_whoosh', name: 'KCIC Whoosh (CR400AF)', speed: '350 km/jam', capacity: 8, price: 15000000000, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/KCIC_Whoosh_CR400AF-AF.png/320px-KCIC_Whoosh_CR400AF-AF.png', desc: 'Kereta Cepat Pertama di Asia Tenggara lintasan Jakarta - Bandung!' }
];

// Master Data Gerbong dan Kereta Penumpang
const carriageClasses = [
  {
    id: 'ekonomi_k3',
    name: 'Ekonomi K3 (Tegak 106 Kursi)',
    price: 100000000,
    capacity: 106,
    comfort: '⭐⭐',
    fare: 80000,
    img: 'https://img.icons8.com/color/96/train.png'
  },
  {
    id: 'ekonomi_mod',
    name: 'Ekonomi New Gen / Modifikasi',
    price: 250000000,
    capacity: 72,
    comfort: '⭐⭐⭐',
    fare: 160000,
    img: 'https://img.icons8.com/fluency/96/train.png'
  },
  {
    id: 'bisnis_k2',
    name: 'Bisnis K2 (Reclining Seat)',
    price: 350000000,
    capacity: 64,
    comfort: '⭐⭐⭐',
    fare: 220000,
    img: 'https://img.icons8.com/color/96/subway.png'
  },
  {
    id: 'eksekutif_k1',
    name: 'Eksekutif K1 Stainless Steel',
    price: 600000000,
    capacity: 50,
    comfort: '⭐⭐⭐⭐',
    fare: 380000,
    img: 'https://img.icons8.com/fluency/96/railroad-car.png'
  },
  {
    id: 'priority',
    name: 'Kereta Priority (AVOD & Minibar)',
    price: 1200000000,
    capacity: 28,
    comfort: '⭐⭐⭐⭐⭐',
    fare: 750000,
    img: 'https://img.icons8.com/color/96/bullet-train-front.png'
  },
  {
    id: 'luxury_gen',
    name: 'Luxury Sleeper (Gen 1 & 2)',
    price: 2000000000,
    capacity: 18,
    comfort: '⭐⭐⭐⭐⭐⭐',
    fare: 1250000,
    img: 'https://img.icons8.com/color-glass/96/bullet-train-front.png'
  },
  {
    id: 'panoramic',
    name: 'Kereta Panoramic (Glass Roof)',
    price: 2800000000,
    capacity: 38,
    comfort: '⭐⭐⭐⭐⭐⭐',
    fare: 1500000,
    img: 'https://img.icons8.com/fluency/96/bullet-train.png'
  },
  {
    id: 'compartment',
    name: 'Compartment Suites (VIP Private)',
    price: 3500000000,
    capacity: 16,
    comfort: '👑 VIP Suites',
    fare: 2100000,
    img: 'https://img.icons8.com/external-filled-outline-icons-maxicon/85/external-train-travel-filled-outline-icons-maxicon.png'
  }
];

// Master Data Lokomotif Langka & Eksklusif.
// Unit ini tidak masuk dealer reguler dan hanya dapat diberikan melalui admin/top-up.
const exclusiveUnits = [
  {
    id: 'cc201_vintage',
    name: 'CC 201 Livery Vintage 1953',
    speed: '100 km/jam',
    capacity: 10,
    rarity: '✨ EXCLUSIVE / RARE',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/CC201_83_25_Purwokerto.png/320px-CC201_83_25_Purwokerto.png',
    desc: 'Lokomotif warna merah-biru klasik legendaris PNKA/PJKA.'
  },
  {
    id: 'cc206_special',
    name: 'CC 206 Livery KAI Commemorative',
    speed: '130 km/jam',
    capacity: 14,
    rarity: '🔥 LEGENDARY',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CC206_13_55_SMC.png/320px-CC206_13_55_SMC.png',
    desc: 'Spesifikasi khusus daya tarik ekstra +20% pendapatan tiket.'
  }
];

// Master Data Gerbong Eksklusif.
// Unit ini tidak masuk dealer reguler dan hanya dapat diberikan melalui admin/top-up.
const exclusiveCarriages = [
  {
    id: 'retro_k1',
    name: 'Gerbong Retro Luxury Wood Edition',
    capacity: 20,
    bonusFare: '+50% Pendapatan',
    rarity: '✨ EXCLUSIVE',
    img: 'https://img.icons8.com/color-glass/96/bullet-train-front.png'
  },
  {
    id: 'presidential_suite',
    name: 'Gerbong Kepresidenan / VIP State',
    capacity: 12,
    bonusFare: '+100% Pendapatan',
    rarity: '👑 ULTIMATE VIP',
    img: 'https://img.icons8.com/external-filled-outline-icons-maxicon/85/external-train-travel-filled-outline-icons-maxicon.png'
  }
];

// Nomor WhatsApp admin untuk konfirmasi top-up atau klaim unit eksklusif.
const ADMIN_WA_NUMBER = '6285141017508';

// Master Data Cuaca
const weatherTypes = [
  { id: 'cerah', name: 'Cerah ☀️', passengerMultiplier: 1.2, desc: 'Banyak orang ingin bepergian!' },
  { id: 'berawan', name: 'Berawan ⛅', passengerMultiplier: 1.0, desc: 'Cuaca normal untuk bepergian.' },
  { id: 'hujan', name: 'Hujan Deras 🌧️', passengerMultiplier: 0.8, desc: 'Jumlah penumpang sedikit menurun.' },
  { id: 'badai', name: 'Badai Petir ⛈️', passengerMultiplier: 0.5, desc: 'Banyak penumpang menunda perjalanan.' }
];

// Master Data Event
const gameEvents = [
  { id: 'normal', name: 'Hari Biasa 📅', multiplier: 1.0, desc: 'Kondisi penumpang stabil.' },
  { id: 'libur_sekolah', name: 'Liburan Sekolah 🎒', multiplier: 1.5, desc: 'Lonjakan penumpang keluarga & pelajar (+50%)!' },
  { id: 'mudik', name: 'Musim Mudik Lebaran 🕌', multiplier: 2.2, desc: 'Permintaan tiket melonjak drastis (+120%)!' },
  { id: 'tahun_baru', name: 'Libur Natal & Tahun Baru 🎄', multiplier: 1.8, desc: 'Antrean penumpang sangat padat (+80%)!' },
  { id: 'weekend', name: 'Akhir Pekan (Weekend) 🎈', multiplier: 1.3, desc: 'Penumpang wisata meningkat (+30%).' }
];

// Database Lokomotif
const LOCOMOTIVES = {
  CC201: {
    id: 'CC201',
    name: 'Lokomotif CC201',
    price: 120000000,
    maxCoaches: 5,
    fuelCostPerSec: 1500000,
    repairCost: 15000000
  },
  CC206: {
    id: 'CC206',
    name: 'Lokomotif CC206',
    price: 220000000,
    maxCoaches: 10,
    fuelCostPerSec: 2500000,
    repairCost: 30000000
  }
};

const COACHES = {
  EKONOMI: {
    id: 'EKONOMI',
    name: 'Gerbong Ekonomi (K3)',
    price: 30000000,
    capacity: 106,
    ticketPrice: 150000
  },
  EKSEKUTIF: {
    id: 'EKSEKUTIF',
    name: 'Gerbong Eksekutif (K1)',
    price: 60000000,
    capacity: 50,
    ticketPrice: 350000
  }
};

// Database Rute Perjalanan (Jawa + Sumatra)
const ROUTES = [
  // Rute Jawa
  { id: 'GMR-BD',  region: 'JAWA', originKey: 'GMR', destKey: 'BD',  origin: 'Jakarta Gambir', destination: 'Bandung',        durationSeconds: 5,  multiplier: 0.7 },
  { id: 'GMR-SMT', region: 'JAWA', originKey: 'GMR', destKey: 'SMT', origin: 'Jakarta Gambir', destination: 'Semarang Tawang', durationSeconds: 8,  multiplier: 1.0 },
  { id: 'BD-YK',   region: 'JAWA', originKey: 'BD',  destKey: 'YK',  origin: 'Bandung',        destination: 'Yogyakarta',     durationSeconds: 7,  multiplier: 1.1 },
  { id: 'SMT-SGB', region: 'JAWA', originKey: 'SMT', destKey: 'SGB', origin: 'Semarang Tawang', destination: 'Surabaya Gubeng', durationSeconds: 9,  multiplier: 1.3 },
  { id: 'YK-SGB',  region: 'JAWA', originKey: 'YK',  destKey: 'SGB', origin: 'Yogyakarta',     destination: 'Surabaya Gubeng', durationSeconds: 7,  multiplier: 1.1 },

  // Rute Sumatra
  { id: 'MDN-PKU', region: 'SUMATRA', originKey: 'MDN', destKey: 'PKU', origin: 'Medan',          destination: 'Pekanbaru',      durationSeconds: 10, multiplier: 1.4 },
  { id: 'PKU-PDG', region: 'SUMATRA', originKey: 'PKU', destKey: 'PDG', origin: 'Pekanbaru',      destination: 'Padang',         durationSeconds: 6,  multiplier: 0.9 },
  { id: 'PKU-PLB', region: 'SUMATRA', originKey: 'PKU', destKey: 'PLB', origin: 'Pekanbaru',      destination: 'Palembang',      durationSeconds: 11, multiplier: 1.5 },
  { id: 'PLB-TKG', region: 'SUMATRA', originKey: 'PLB', destKey: 'TKG', origin: 'Palembang',      destination: 'Bandar Lampung', durationSeconds: 8,  multiplier: 1.2 }
];

// Database Rute Ekspres Multi-Stop
const MULTI_ROUTES = [
  {
    id: 'R_EXPRESS_JAWA_1',
    name: 'Ekspres Argo Jawa (Jakarta - Semarang - Surabaya)',
    region: 'JAWA',
    stops: ['ST_JKT', 'ST_SMG', 'ST_SBY'],
    distanceTotal: 780,
    bonusMultiplier: 1.15
  },
  {
    id: 'R_EXPRESS_SUMATRA_1',
    name: 'Trans-Sumatra Express (Lampung - Palembang - Medan)',
    region: 'SUMATRA',
    stops: ['ST_LPG', 'ST_PLB', 'ST_MDN'],
    distanceTotal: 1250,
    bonusMultiplier: 1.20
  }
];

// Konfigurasi Keseimbangan Permainan
const GAME_BALANCE = {
  ticketBasePrice: {
    EKONOMI: 1200,
    EKSEKUTIF: 2800
  },
  fuelCostPerKm: 15000,
  maintenanceCostPerPercent: 2500000,
  bankInterestRate: 0.03
};

// Database Cuaca
const WEATHERS = {
  CLEAR: { name: 'Cereh ☀️', speedMultiplier: 1.0, fuelMultiplier: 1.0 },
  RAIN:  { name: 'Hujan 🌧️', speedMultiplier: 1.2, fuelMultiplier: 1.15 },
  STORM: { name: 'Badai ⛈️', speedMultiplier: 1.5, fuelMultiplier: 1.3 }
};

// Database Event Acak
const RANDOM_EVENTS = [
  {
    id: 'NORMAL',
    name: 'Hari Biasa',
    desc: 'Lalu lintas kereta api berjalan normal.',
    ticketMultiplier: 1.0
  },
  {
    id: 'MUDIK',
    name: 'Musim Mudik Lebaran 🌙',
    desc: 'Lonjakan penumpang tinggi! Harga tiket naik 2x lipat.',
    ticketMultiplier: 2.0
  },
  {
    id: 'HOLIDAY',
    name: 'Libur Sekolah 🎉',
    desc: 'Permintaan tiket meningkat. Harga tiket naik 1.3x lipat.',
    ticketMultiplier: 1.3
  }
];

// Database Pencapaian
const ACHIEVEMENTS = [
  {
    id: 'FIRST_TRIP',
    name: 'Perjalanan Perdana',
    desc: 'Selesaikan 1 perjalanan kereta.',
    reward: 50000000
  },
  {
    id: 'FLEET_5',
    name: 'Juragan Kereta',
    desc: 'Miliki minimal 5 lokomotif di dipo.',
    reward: 200000000
  },
  {
    id: 'EXPANSION_SUMATRA',
    name: 'Lintas Pulau',
    desc: 'Buka dan jelajahi wilayah Pulau Sumatra.',
    reward: 150000000
  }
];

// Database Level Masinis
const DRIVER_LEVELS = {
  PEMULA: {
    name: 'Pemula',
    salary: 200000,
    bbmEfficiency: 1.0,
    durabilityLoss: 1.0
  },
  SENIOR: {
    name: 'Senior',
    salary: 500000,
    bbmEfficiency: 0.85,
    durabilityLoss: 0.7
  },
  MASTER: {
    name: 'Master',
    salary: 1200000,
    bbmEfficiency: 0.70,
    durabilityLoss: 0.4
  }
};