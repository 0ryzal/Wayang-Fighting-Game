import * as THREE from 'three';

// ==========================================
// WAYANG OPEN WORLD - JAWA & BALI
// 3D Open World with 2D Sprite Characters
// Featuring: Borobudur, Prambanan, Lempuyang, Danau Batur
// ==========================================

// ===== GAME STATE =====
const gameState = {
  status: 'loading', // loading, charSelect, playing, paused
  selectedCharacter: 'bagong',
  isPointerLocked: false,
  currentLocation: 'Borobudur Temple'
};

// ===== COLLISION BOXES =====
const collisionBoxes = [];

// ===== CHARACTER DATA WITH LORE =====
const characterData = {
  bagong: {
    name: 'Bagong',
    title: 'Si Jenaka Bijaksana',
    lore: 'Bagong adalah putra bungsu Semar dan adik dari Gareng serta Petruk. Meski bertubuh gemuk dan tampak lamban, Bagong memiliki kecerdasan luar biasa. Ia sering berpura-pura bodoh namun selalu memberikan nasihat bijak melalui humor. Dalam pewayangan, Bagong melambangkan kejujuran dan keberanian menyuarakan kebenaran tanpa takut.',
    idle: ['./textures/bagong/idle/idle 1.png', './textures/bagong/idle/idle 2.png', './textures/bagong/idle/idle 3.png', './textures/bagong/idle/idle 4.png'],
    walk: ['./textures/bagong/walk/walk 1.png', './textures/bagong/walk/walk 2.png', './textures/bagong/walk/walk 3.png', './textures/bagong/walk/walk 4.png', './textures/bagong/walk/walk 5.png', './textures/bagong/walk/walk 6.png']
  },
  gareng: {
    name: 'Gareng',
    title: 'Si Cacat yang Setia',
    lore: 'Gareng atau Nala Gareng adalah putra sulung Semar. Tubuhnya penuh cacat: mata juling, tangan bengkok, dan kaki pincang. Namun setiap cacatnya melambangkan filosofi mendalam - mata juling berarti melihat kebenaran sejati, tangan bengkok berarti tidak suka mengambil yang bukan haknya, kaki pincang berarti berhati-hati dalam melangkah. Gareng adalah simbol kesetiaan dan kesabaran.',
    idle: ['./textures/gareng/idle/grng idle 1.png', './textures/gareng/idle/grng idle 2.png', './textures/gareng/idle/grng idle 3.png', './textures/gareng/idle/grng idle 4.png', './textures/gareng/idle/grng idle 5.png'],
    walk: ['./textures/gareng/walk/grng walk 1.png', './textures/gareng/walk/grng walk 2.png', './textures/gareng/walk/grng walk 3.png', './textures/gareng/walk/grng walk 4.png', './textures/gareng/walk/grng walk 5.png']
  },
  petruk: {
    name: 'Petruk',
    title: 'Si Hidung Panjang',
    lore: 'Petruk atau Kanthong Bolong adalah putra kedua Semar. Ciri khasnya adalah hidung panjang dan tubuh tinggi kurus. Ia paling humoris dan suka bergurau, namun di balik candaannya tersimpan kebijaksanaan. Nama Kanthong Bolong (kantong berlubang) melambangkan sifat dermawan yang tidak menyimpan harta untuk diri sendiri. Petruk adalah simbol kegembiraan dan kedermawanan.',
    idle: ['./textures/petruk/idle/petrul idle 1.png', './textures/petruk/idle/petrul idle 2.png', './textures/petruk/idle/petrul idle 3.png', './textures/petruk/idle/petrul idle 4.png'],
    walk: ['./textures/petruk/walk/petruk walk 1.png', './textures/petruk/walk/petruk walk 2.png', './textures/petruk/walk/petruk walk 3.png', './textures/petruk/walk/petruk walk 4.png', './textures/petruk/walk/petruk walk 5.png']
  },
  semar: {
    name: 'Semar',
    title: 'Sang Pamomong Agung',
    lore: 'Semar atau Batara Ismaya adalah dewa yang turun ke dunia menjadi pamomong (pengasuh) para kesatria Pandawa. Ia adalah kakak Batara Guru namun memilih hidup sederhana di bumi. Tubuhnya gemuk dengan wajah tua namun seperti bayi, melambangkan kebijaksanaan yang melampaui usia. Semar adalah penjaga kebenaran dan keadilan, sosok suci yang menyamar sebagai rakyat jelata. Ia adalah simbol kebijaksanaan tertinggi dalam pewayangan Jawa.',
    idle: ['./textures/semar/idle/semar idle 1.png', './textures/semar/idle/semar idle 2.png', './textures/semar/idle/semar idle 3.png', './textures/semar/idle/semar idle 4.png'],
    walk: ['./textures/semar/walk/semar walk 1.png', './textures/semar/walk/semar walk 2.png', './textures/semar/walk/semar walk 3.png', './textures/semar/walk/semar walk 4.png', './textures/semar/walk/semar walk 5.png', './textures/semar/walk/semar walk 6.png']
  }
};

// ===== LANDMARK LOCATIONS =====
const landmarks = {
  borobudur: {
    position: { x: 0, y: 0, z: 0 },
    name: 'Candi Borobudur',
    color: 0x8B8B7A
  },
  prambanan: {
    position: { x: 200, y: 0, z: 200 },
    name: 'Candi Prambanan',
    color: 0x9B7653
  },
  lempuyang: {
    position: { x: -200, y: 0, z: 200 },
    name: 'Pura Lempuyang',
    color: 0x708090
  },
  batur: {
    position: { x: 0, y: 0, z: -250 },
    name: 'Danau Batur',
    color: 0x4682B4
  }
};

// ===== POI (Points of Interest) WITH HISTORY =====
const pointsOfInterest = [
  // === BOROBUDUR ===
  {
    id: 'borobudur-main',
    position: { x: 0, y: 0, z: 45 },
    title: 'Candi Borobudur',
    description: `Candi Borobudur adalah candi Buddha terbesar di dunia, dibangun pada abad ke-8 oleh Dinasti Syailendra. Nama "Borobudur" berasal dari "Vihara Buddha Uhr" yang berarti biara Buddha di atas bukit.

SEJARAH:
Dibangun sekitar tahun 750-850 Masehi, candi ini ditinggalkan setelah pusat kerajaan Jawa pindah ke Jawa Timur akibat letusan Gunung Merapi. Candi terkubur abu vulkanik selama berabad-abad hingga ditemukan kembali oleh Sir Thomas Stamford Raffles pada tahun 1814.

FILOSOFI:
Candi memiliki 10 tingkat yang melambangkan perjalanan spiritual menuju pencerahan:
• Kamadhatu (dasar): Alam nafsu duniawi
• Rupadhatu (5 tingkat persegi): Alam peralihan
• Arupadhatu (3 tingkat bundar): Alam tanpa bentuk
• Stupa utama: Pencerahan tertinggi (Nirvana)

FAKTA MENARIK:
- Terdapat 2.672 panel relief dan 504 arca Buddha
- Merupakan Situs Warisan Dunia UNESCO sejak 1991
- Panjang total relief jika direntangkan mencapai 6 km`
  },
  {
    id: 'borobudur-stupa',
    position: { x: 0, y: 0, z: -5 },
    title: 'Stupa Berlubang (Arupadhatu)',
    description: `Stupa-stupa berlubang di tingkat Arupadhatu memiliki makna filosofis mendalam.

MAKNA LUBANG:
Lubang-lubang berbentuk belah ketupat pada stupa melambangkan:
• Tingkat pertama: Lubang berbentuk persegi (masih terikat dunia)
• Tingkat kedua: Lubang berbentuk belah ketupat (transisi)  
• Tingkat ketiga: Lubang lebih besar (hampir bebas)

Di dalam setiap stupa terdapat arca Buddha dalam posisi Dharmachakra Mudra (memutar roda dharma).

MISTERI:
Konon, jika seseorang dapat menyentuh tangan Buddha di dalam stupa melalui lubang, ia akan mendapat keberuntungan. Namun praktik ini kini dilarang untuk menjaga kelestarian candi.`
  },

  // === PRAMBANAN ===
  {
    id: 'prambanan-main',
    position: { x: 200, y: 0, z: 245 },
    title: 'Candi Prambanan',
    description: `Candi Prambanan adalah kompleks candi Hindu terbesar di Indonesia, dibangun pada abad ke-9 oleh Raja Rakai Pikatan dari Dinasti Sanjaya.

SEJARAH:
Dibangun sekitar tahun 850 Masehi sebagai tandingan Candi Borobudur yang Buddhist. Candi ini didedikasikan untuk Trimurti - tiga dewa utama Hindu:
• Candi Siwa (tengah, tertinggi - 47 meter)
• Candi Brahma (selatan)
• Candi Wisnu (utara)

LEGENDA RORO JONGGRANG:
Konon candi ini dibangun oleh Bandung Bondowoso untuk memenuhi syarat menikahi Roro Jonggrang. Ia harus membangun 1.000 candi dalam semalam. Dengan bantuan jin, hampir selesai, namun Roro Jonggrang menipu dengan menumbuk padi agar ayam berkokok pertanda pagi. Marah, Bandung Bondowoso mengutuk Roro Jonggrang menjadi arca - yang kini dikenal sebagai Arca Durga Mahisasuramardini.

ARSITEKTUR:
- 240 candi dalam kompleks (8 candi utama + 232 candi perwara)
- Relief menceritakan kisah Ramayana
- Merupakan Situs Warisan Dunia UNESCO sejak 1991`
  },
  {
    id: 'prambanan-siwa',
    position: { x: 200, y: 0, z: 200 },
    title: 'Candi Siwa (Candi Utama)',
    description: `Candi Siwa adalah candi tertinggi dan terbesar di kompleks Prambanan dengan tinggi 47 meter.

RUANGAN:
Candi ini memiliki 4 ruangan:
• Ruang utama: Arca Siwa Mahadewa setinggi 3 meter
• Ruang utara: Arca Durga Mahisasuramardini (Roro Jonggrang)
• Ruang selatan: Arca Agastya (guru para dewa)
• Ruang barat: Arca Ganesha (dewa kebijaksanaan)

RELIEF:
Dinding candi dihiasi 42 panel relief yang menceritakan kisah Ramayana, dilanjutkan ke Candi Brahma.

MAKNA ARSITEKTUR:
Bentuk candi yang menjulang tinggi melambangkan Gunung Meru, tempat bersemayamnya para dewa dalam kosmologi Hindu.`
  },

  // === LEMPUYANG ===
  {
    id: 'lempuyang-main',
    position: { x: -200, y: 0, z: 245 },
    title: 'Pura Lempuyang Luhur',
    description: `Pura Lempuyang Luhur adalah salah satu pura tertua dan tersucri di Bali, terletak di lereng Gunung Lempuyang pada ketinggian 1.175 meter.

SEJARAH:
Pura ini dipercaya sudah ada sejak zaman prasejarah, sebelum agama Hindu masuk ke Bali. Awalnya merupakan tempat pemujaan roh leluhur dan kekuatan alam.

KOMPLEKS PURA:
Pura Lempuyang terdiri dari 7 pura yang tersebar dari kaki hingga puncak gunung:
1. Pura Penataran Agung (paling bawah)
2. Pura Telaga Mas
3. Pura Telaga Sawang  
4. Pura Lempuyang Madya
5. Pura Puncak Bisbis
6. Pura Pasar Agung
7. Pura Lempuyang Luhur (puncak)

GATES OF HEAVEN:
Gerbang terkenal yang memperlihatkan pemandangan Gunung Agung di kejauhan, menjadi salah satu spot foto paling ikonik di Bali.

RITUAL:
Untuk mencapai puncak, umat harus menaiki 1.700 anak tangga sambil bersembahyang di setiap pura.`
  },
  {
    id: 'lempuyang-gate',
    position: { x: -200, y: 0, z: 200 },
    title: 'Gates of Heaven (Gerbang Surga)',
    description: `"Gates of Heaven" adalah nama populer untuk Candi Bentar (gerbang terbelah) di Pura Penataran Agung Lempuyang.

FILOSOFI CANDI BENTAR:
Gerbang yang terbelah dua melambangkan:
• Dualitas alam semesta (baik-buruk, terang-gelap)
• Pemisahan dunia profan dengan dunia sakral
• Gunung kosmis yang terbelah untuk memberi jalan

FENOMENA VIRAL:
Pada 2018, foto dengan refleksi di depan gerbang ini viral di media sosial. Refleksi tersebut sebenarnya berasal dari cermin yang diletakkan fotografer lokal, bukan air. Meski begitu, keindahan pemandangan Gunung Agung di kejauhan tetap nyata dan menakjubkan.

TIPS BERKUNJUNG:
- Datang pagi hari untuk cuaca cerah
- Hormati aturan berpakaian (kain & selendang)
- Antre untuk foto bisa memakan waktu berjam-jam`
  },

  // === DANAU BATUR ===
  {
    id: 'batur-main',
    position: { x: 0, y: 0, z: -295 },
    title: 'Danau Batur & Gunung Batur',
    description: `Danau Batur adalah danau kawah terbesar di Bali, terletak di dalam kaldera raksasa Gunung Batur pada ketinggian 1.050 meter.

GEOLOGI:
Danau ini terbentuk dari letusan dahsyat Gunung Batur purba sekitar 29.000 tahun lalu yang menciptakan kaldera selebar 13,8 x 10 km - salah satu yang terbesar di dunia.

GUNUNG BATUR:
Gunung Batur (1.717 m) adalah gunung berapi aktif yang telah meletus lebih dari 20 kali sejak 1800. Letusan terakhir terjadi tahun 2000. Pendakian ke puncak untuk melihat sunrise sangat populer.

KEPERCAYAAN:
Dalam kepercayaan Hindu Bali, Danau Batur adalah tempat bersemayamnya Dewi Danu - dewi air dan kesuburan. Air danau ini mengairi sawah-sawah di seluruh Bali melalui sistem Subak.

PURA ULUN DANU BATUR:
Pura kedua terpenting di Bali (setelah Pura Besakih), didedikasikan untuk Dewi Danu. Pura asli tenggelam dalam letusan 1917 dan dibangun kembali di tepi kaldera.

DESA TRUNYAN:
Di tepi danau terdapat desa Trunyan dengan tradisi unik - jenazah tidak dikubur atau dikremasi, melainkan diletakkan di bawah pohon Taru Menyan.`
  },
  {
    id: 'batur-lake',
    position: { x: 30, y: 0, z: -250 },
    title: 'Danau Kawah Batur',
    description: `Danau Batur memiliki luas 16 km² dengan kedalaman maksimum 88 meter, menjadikannya danau terbesar di Bali.

EKOLOGI:
Danau ini adalah habitat ikan mujair yang diintroduksi dari Afrika pada 1939. Kini ikan mujair menjadi sumber protein penting bagi masyarakat sekitar dan diolah menjadi berbagai hidangan khas.

SUBAK:
Air Danau Batur mengalir melalui sistem irigasi tradisional Subak yang telah berusia lebih dari 1.000 tahun. Sistem Subak adalah warisan dunia UNESCO yang mengatur distribusi air secara adil ke seluruh sawah di Bali.

PEMANDIAN AIR PANAS:
Di tepi danau terdapat pemandian air panas alami Toya Bungkah yang dipercaya memiliki khasiat menyembuhkan berbagai penyakit.

LEGENDA:
Konon Danau Batur dan Danau Bratan (di Bedugul) dulunya satu. Ketika Dewa Wisnu membelah gunung untuk mengairi Bali, terbentuklah dua danau terpisah.`
  },

  // === PUNAKAWAN INFO ===
  {
    id: 'punakawan-info',
    position: { x: 50, y: 0, z: 50 },
    title: 'Punakawan - Pengawal Setia',
    description: `PUNAKAWAN adalah kelompok empat abdi dalam pewayangan Jawa yang mengawal para kesatria Pandawa. Mereka adalah ciptaan asli budaya Jawa yang tidak ada dalam Mahabharata India asli.

ANGGOTA PUNAKAWAN:

SEMAR (Sang Pamomong)
• Nama asli: Batara Ismaya
• Status: Dewa yang memilih hidup sebagai rakyat jelata
• Filosofi: Kebijaksanaan sejati datang dari kesederhanaan

GARENG (Si Setia)
• Nama asli: Nala Gareng
• Ciri: Mata juling, tangan bengkok, kaki pincang
• Filosofi: Kecacatan fisik bukan penghalang berbuat baik

PETRUK (Si Dermawan)
• Nama asli: Kanthong Bolong
• Ciri: Hidung panjang, tubuh tinggi kurus
• Filosofi: Berbagi tanpa pamrih

BAGONG (Si Jujur)
• Status: Putra bungsu Semar
• Ciri: Tubuh gemuk, wajah polos
• Filosofi: Keberanian berkata benar

PERAN DALAM PEWAYANGAN:
Punakawan muncul dalam adegan "Goro-goro" sebagai selingan humor sekaligus kritik sosial. Melalui candaan, mereka menyampaikan pesan moral dan sindiran terhadap ketidakadilan.`
  }
];

// ===== DOM ELEMENTS =====
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const charSelection = document.getElementById('char-selection');
const charOptions = document.getElementById('char-options');
const startExploreBtn = document.getElementById('start-explore-btn');
const gameHud = document.getElementById('game-hud');
const playerAvatar = document.getElementById('player-avatar');
const playerNameEl = document.getElementById('player-name');
const locationNameEl = document.getElementById('location-name');
const menuBtn = document.getElementById('menu-btn');
const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const changeCharBtn = document.getElementById('change-char-btn');
const exitBtn = document.getElementById('exit-btn');
const interactionPrompt = document.getElementById('interaction-prompt');
const infoPanel = document.getElementById('info-panel');
const closeInfoBtn = document.getElementById('close-info-btn');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

// ===== THREE.JS SETUP =====
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0008); // Reduced fog for larger world

// Perspective camera for 3D world - extended far plane
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 15, 100);

// ===== LIGHTING =====
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -300;
sunLight.shadow.camera.right = 300;
sunLight.shadow.camera.top = 300;
sunLight.shadow.camera.bottom = -300;
scene.add(sunLight);

// Hemisphere light for natural outdoor lighting
const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.5);
scene.add(hemiLight);

// ===== MATERIALS =====
const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B8B7A,
  roughness: 0.9,
  metalness: 0.1
});

const darkStoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x5a5a4a,
  roughness: 0.95,
  metalness: 0.05
});

const redStoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B4513,
  roughness: 0.85,
  metalness: 0.1
});

const grassMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a7c4e,
  roughness: 1.0
});

const pathMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B7355,
  roughness: 0.8
});

const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x2E8B8B,
  roughness: 0.1,
  metalness: 0.3,
  transparent: true,
  opacity: 0.8
});

// ===== COLLISION SYSTEM =====
function addCollisionBox(x, z, width, depth, height = 50) {
  collisionBoxes.push({
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
    height: height
  });
}

function checkCollision(x, z, radius = 1.5) {
  for (const box of collisionBoxes) {
    // Find closest point on box to player
    const closestX = Math.max(box.minX, Math.min(x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    
    // Calculate distance
    const distX = x - closestX;
    const distZ = z - closestZ;
    const distance = Math.sqrt(distX * distX + distZ * distZ);
    
    if (distance < radius) {
      return { collision: true, box, closestX, closestZ, distX, distZ, distance };
    }
  }
  return { collision: false };
}

// ===== CREATE WORLD =====
function createWorld() {
  // Ground plane (grass) - much larger
  const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  const ground = new THREE.Mesh(groundGeometry, grassMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add terrain variation
  const vertices = ground.geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 1];
    vertices[i + 2] = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 3 + Math.random() * 0.5;
  }
  ground.geometry.attributes.position.needsUpdate = true;
  ground.geometry.computeVertexNormals();

  // Create all landmarks
  createBorobudurTemple(0, 0);
  createPrambananTemple(200, 200);
  createLempuyangTemple(-200, 200);
  createDanauBatur(0, -250);

  // Create paths connecting landmarks
  createAllPaths();

  // Create trees (avoiding landmarks)
  createTrees();

  // Create POI markers
  createPOIMarkers();
}

// ===== BOROBUDUR TEMPLE =====
function createBorobudurTemple(offsetX, offsetZ) {
  const templeGroup = new THREE.Group();
  templeGroup.position.set(offsetX, 0, offsetZ);

  // Base platform (Kamadhatu)
  const baseSize = 60;
  const baseHeight = 2;
  const baseGeom = new THREE.BoxGeometry(baseSize, baseHeight, baseSize);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = baseHeight / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  templeGroup.add(base);
  
  // Add collision for base
  addCollisionBox(offsetX, offsetZ, baseSize + 4, baseSize + 4);

  // Create stepped pyramid levels (Rupadhatu)
  const levels = 5;
  for (let i = 0; i < levels; i++) {
    const levelSize = baseSize - (i + 1) * 8;
    const levelHeight = 3;
    const levelGeom = new THREE.BoxGeometry(levelSize, levelHeight, levelSize);
    const level = new THREE.Mesh(levelGeom, stoneMaterial);
    level.position.y = baseHeight + (i + 1) * levelHeight - levelHeight / 2;
    level.castShadow = true;
    level.receiveShadow = true;
    templeGroup.add(level);

    // Add small stupas on each level
    const stupaCount = 8 - i;
    for (let j = 0; j < stupaCount; j++) {
      const angle = (j / stupaCount) * Math.PI * 2;
      const radius = levelSize / 2 - 2;
      const stupa = createStupa(1.5);
      stupa.position.set(
        Math.cos(angle) * radius,
        baseHeight + (i + 1) * levelHeight,
        Math.sin(angle) * radius
      );
      templeGroup.add(stupa);
    }
  }

  // Create circular platforms (Arupadhatu)
  const circularLevels = 3;
  const topY = baseHeight + levels * 3;
  for (let i = 0; i < circularLevels; i++) {
    const radius = 15 - i * 4;
    const circleGeom = new THREE.CylinderGeometry(radius, radius, 1.5, 32);
    const circle = new THREE.Mesh(circleGeom, stoneMaterial);
    circle.position.y = topY + i * 2;
    circle.castShadow = true;
    circle.receiveShadow = true;
    templeGroup.add(circle);

    // Add perforated stupas
    const perfStupaCount = 16 - i * 4;
    for (let j = 0; j < perfStupaCount; j++) {
      const angle = (j / perfStupaCount) * Math.PI * 2;
      const stupaRadius = radius - 2;
      const perfStupa = createPerforatedStupa(2);
      perfStupa.position.set(
        Math.cos(angle) * stupaRadius,
        topY + i * 2 + 1,
        Math.sin(angle) * stupaRadius
      );
      templeGroup.add(perfStupa);
    }
  }

  // Main stupa at top
  const mainStupa = createMainStupa();
  mainStupa.position.y = topY + circularLevels * 2 + 2;
  templeGroup.add(mainStupa);

  scene.add(templeGroup);
}

// ===== PRAMBANAN TEMPLE =====
function createPrambananTemple(offsetX, offsetZ) {
  const templeGroup = new THREE.Group();
  templeGroup.position.set(offsetX, 0, offsetZ);

  // Base platform
  const platformSize = 80;
  const platformGeom = new THREE.BoxGeometry(platformSize, 2, platformSize);
  const platform = new THREE.Mesh(platformGeom, darkStoneMaterial);
  platform.position.y = 1;
  platform.receiveShadow = true;
  templeGroup.add(platform);
  
  // Add collision for platform
  addCollisionBox(offsetX, offsetZ, platformSize + 4, platformSize + 4);

  // Main temples (Trimurti)
  const templePositions = [
    { x: 0, z: 0, height: 47, name: 'Siwa' },      // Center - tallest
    { x: -15, z: 0, height: 33, name: 'Brahma' },  // South
    { x: 15, z: 0, height: 33, name: 'Wisnu' },    // North
  ];

  templePositions.forEach(pos => {
    const temple = createPrambananSpire(pos.height);
    temple.position.set(pos.x, 2, pos.z);
    templeGroup.add(temple);
  });

  // Wahana temples (smaller, facing main temples)
  const wahanaPositions = [
    { x: 0, z: 15, height: 22 },   // Nandi (facing Siwa)
    { x: -15, z: 15, height: 18 }, // Angsa (facing Brahma)
    { x: 15, z: 15, height: 18 },  // Garuda (facing Wisnu)
  ];

  wahanaPositions.forEach(pos => {
    const temple = createPrambananSpire(pos.height);
    temple.position.set(pos.x, 2, pos.z);
    templeGroup.add(temple);
  });

  // Smaller perwara temples around
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 35;
    const smallTemple = createPrambananSpire(8);
    smallTemple.position.set(
      Math.cos(angle) * radius,
      2,
      Math.sin(angle) * radius
    );
    templeGroup.add(smallTemple);
  }

  scene.add(templeGroup);
}

function createPrambananSpire(height) {
  const group = new THREE.Group();

  // Base
  const baseSize = height * 0.3;
  const baseGeom = new THREE.BoxGeometry(baseSize, height * 0.15, baseSize);
  const base = new THREE.Mesh(baseGeom, redStoneMaterial);
  base.position.y = height * 0.075;
  base.castShadow = true;
  group.add(base);

  // Body with relief panels
  const bodyGeom = new THREE.BoxGeometry(baseSize * 0.8, height * 0.4, baseSize * 0.8);
  const body = new THREE.Mesh(bodyGeom, redStoneMaterial);
  body.position.y = height * 0.35;
  body.castShadow = true;
  group.add(body);

  // Roof tiers
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const tierSize = baseSize * (0.7 - i * 0.1);
    const tierHeight = height * 0.08;
    const tierGeom = new THREE.ConeGeometry(tierSize / 2, tierHeight, 4);
    const tier = new THREE.Mesh(tierGeom, redStoneMaterial);
    tier.position.y = height * 0.55 + i * tierHeight * 0.8;
    tier.rotation.y = Math.PI / 4;
    tier.castShadow = true;
    group.add(tier);
  }

  // Top finial
  const finialGeom = new THREE.ConeGeometry(0.5, height * 0.1, 8);
  const finial = new THREE.Mesh(finialGeom, redStoneMaterial);
  finial.position.y = height * 0.95;
  finial.castShadow = true;
  group.add(finial);

  return group;
}

// ===== LEMPUYANG TEMPLE =====
function createLempuyangTemple(offsetX, offsetZ) {
  const templeGroup = new THREE.Group();
  templeGroup.position.set(offsetX, 0, offsetZ);

  // Steps leading up
  const stepsCount = 10;
  for (let i = 0; i < stepsCount; i++) {
    const stepGeom = new THREE.BoxGeometry(12, 0.5, 3);
    const step = new THREE.Mesh(stepGeom, stoneMaterial);
    step.position.set(0, i * 0.5, 20 - i * 2);
    step.receiveShadow = true;
    step.castShadow = true;
    templeGroup.add(step);
  }

  // Main platform
  const platformGeom = new THREE.BoxGeometry(40, 1, 30);
  const platform = new THREE.Mesh(platformGeom, stoneMaterial);
  platform.position.set(0, stepsCount * 0.5, -5);
  platform.receiveShadow = true;
  templeGroup.add(platform);
  
  // Add collision
  addCollisionBox(offsetX, offsetZ - 5, 44, 34);

  // Gates of Heaven (Candi Bentar)
  const gateHeight = 15;
  const gateWidth = 4;
  const gateDepth = 3;

  // Left gate
  const leftGateGroup = createGatePart(gateHeight, gateWidth, gateDepth);
  leftGateGroup.position.set(-5, stepsCount * 0.5 + gateHeight / 2, -5);
  templeGroup.add(leftGateGroup);

  // Right gate
  const rightGateGroup = createGatePart(gateHeight, gateWidth, gateDepth);
  rightGateGroup.position.set(5, stepsCount * 0.5 + gateHeight / 2, -5);
  rightGateGroup.scale.x = -1;
  templeGroup.add(rightGateGroup);

  // Meru towers on sides
  const meruLeft = createMeru(8);
  meruLeft.position.set(-18, stepsCount * 0.5 + 0.5, -10);
  templeGroup.add(meruLeft);

  const meruRight = createMeru(8);
  meruRight.position.set(18, stepsCount * 0.5 + 0.5, -10);
  templeGroup.add(meruRight);

  // Guardian statues
  const guardianLeft = createGuardianStatue();
  guardianLeft.position.set(-12, stepsCount * 0.5 + 0.5, 5);
  templeGroup.add(guardianLeft);

  const guardianRight = createGuardianStatue();
  guardianRight.position.set(12, stepsCount * 0.5 + 0.5, 5);
  guardianRight.scale.x = -1;
  templeGroup.add(guardianRight);

  scene.add(templeGroup);
}

function createGatePart(height, width, depth) {
  const group = new THREE.Group();

  // Main body - tapered
  for (let i = 0; i < 5; i++) {
    const tierWidth = width - i * 0.3;
    const tierHeight = height / 5;
    const tierGeom = new THREE.BoxGeometry(tierWidth, tierHeight, depth - i * 0.2);
    const tier = new THREE.Mesh(tierGeom, stoneMaterial);
    tier.position.y = -height / 2 + tierHeight / 2 + i * tierHeight;
    tier.position.x = -tierWidth / 4;
    tier.castShadow = true;
    group.add(tier);
  }

  // Decorative top
  const topGeom = new THREE.ConeGeometry(width / 2, height * 0.2, 4);
  const top = new THREE.Mesh(topGeom, stoneMaterial);
  top.position.y = height / 2 + height * 0.1;
  top.position.x = -width / 4;
  top.rotation.y = Math.PI / 4;
  top.castShadow = true;
  group.add(top);

  return group;
}

function createMeru(height) {
  const group = new THREE.Group();

  // Base
  const baseGeom = new THREE.BoxGeometry(4, 2, 4);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = 1;
  base.castShadow = true;
  group.add(base);

  // Tiered roofs (ijuk style)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 1 });
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const roofSize = 3.5 - i * 0.4;
    const roofGeom = new THREE.ConeGeometry(roofSize, 1.5, 4);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = 3 + i * 1.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
  }

  return group;
}

function createGuardianStatue() {
  const group = new THREE.Group();

  // Base
  const baseGeom = new THREE.BoxGeometry(2, 1, 2);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = 0.5;
  group.add(base);

  // Body
  const bodyGeom = new THREE.CylinderGeometry(0.8, 1, 3, 8);
  const body = new THREE.Mesh(bodyGeom, stoneMaterial);
  body.position.y = 2.5;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeom = new THREE.SphereGeometry(0.7, 8, 8);
  const head = new THREE.Mesh(headGeom, stoneMaterial);
  head.position.y = 4.5;
  head.castShadow = true;
  group.add(head);

  return group;
}

// ===== DANAU BATUR =====
function createDanauBatur(offsetX, offsetZ) {
  const lakeGroup = new THREE.Group();
  lakeGroup.position.set(offsetX, 0, offsetZ);

  // Lake (large circular)
  const lakeRadius = 60;
  const lakeGeom = new THREE.CircleGeometry(lakeRadius, 64);
  const lake = new THREE.Mesh(lakeGeom, waterMaterial);
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = 0.1;
  lakeGroup.add(lake);

  // Caldera rim (mountains around)
  const rimSegments = 24;
  for (let i = 0; i < rimSegments; i++) {
    const angle = (i / rimSegments) * Math.PI * 2;
    const rimRadius = lakeRadius + 15 + Math.random() * 10;
    const mountainHeight = 15 + Math.random() * 20;
    
    const mountainGeom = new THREE.ConeGeometry(12, mountainHeight, 6);
    const mountainMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color().setHSL(0.3, 0.3, 0.3 + Math.random() * 0.1),
      roughness: 0.9 
    });
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.set(
      Math.cos(angle) * rimRadius,
      mountainHeight / 2 - 5,
      Math.sin(angle) * rimRadius
    );
    mountain.castShadow = true;
    lakeGroup.add(mountain);
  }

  // Gunung Batur (active volcano) - one prominent peak
  const volcanoGeom = new THREE.ConeGeometry(25, 45, 8);
  const volcanoMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.85 });
  const volcano = new THREE.Mesh(volcanoGeom, volcanoMat);
  volcano.position.set(40, 17, -30);
  volcano.castShadow = true;
  lakeGroup.add(volcano);
  
  // Add collision for volcano
  addCollisionBox(offsetX + 40, offsetZ - 30, 50, 50);

  // Crater at top
  const craterGeom = new THREE.CylinderGeometry(8, 5, 5, 8, 1, true);
  const craterMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
  const crater = new THREE.Mesh(craterGeom, craterMat);
  crater.position.set(40, 40, -30);
  lakeGroup.add(crater);

  // Smoke particles (simple representation)
  const smokeGeom = new THREE.SphereGeometry(3, 8, 8);
  const smokeMat = new THREE.MeshBasicMaterial({ 
    color: 0xcccccc, 
    transparent: true, 
    opacity: 0.4 
  });
  for (let i = 0; i < 5; i++) {
    const smoke = new THREE.Mesh(smokeGeom, smokeMat.clone());
    smoke.position.set(
      40 + (Math.random() - 0.5) * 5,
      42 + i * 3,
      -30 + (Math.random() - 0.5) * 5
    );
    smoke.userData.isSmoke = true;
    smoke.userData.baseY = smoke.position.y;
    lakeGroup.add(smoke);
  }

  // Pura Ulun Danu Batur (temple on rim)
  const puraGroup = new THREE.Group();
  puraGroup.position.set(-50, 5, 40);

  const puraBase = new THREE.BoxGeometry(15, 2, 10);
  const puraBaseMesh = new THREE.Mesh(puraBase, stoneMaterial);
  puraBaseMesh.position.y = 1;
  puraGroup.add(puraBaseMesh);

  const puraMeru = createMeru(12);
  puraMeru.position.set(0, 2, 0);
  puraGroup.add(puraMeru);

  lakeGroup.add(puraGroup);
  
  // Add collision for pura
  addCollisionBox(offsetX - 50, offsetZ + 40, 20, 15);

  // Small boats on lake
  for (let i = 0; i < 5; i++) {
    const boat = createBoat();
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 30;
    boat.position.set(
      Math.cos(angle) * radius,
      0.3,
      Math.sin(angle) * radius
    );
    boat.rotation.y = angle + Math.PI / 2;
    boat.userData.isBoat = true;
    boat.userData.angle = angle;
    boat.userData.radius = radius;
    lakeGroup.add(boat);
  }

  scene.add(lakeGroup);
}

function createBoat() {
  const group = new THREE.Group();

  const boatMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
  
  // Hull
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-2, 0);
  hullShape.quadraticCurveTo(-2.5, 0.5, -2, 1);
  hullShape.lineTo(2, 1);
  hullShape.quadraticCurveTo(2.5, 0.5, 2, 0);
  hullShape.lineTo(-2, 0);

  const extrudeSettings = { depth: 1, bevelEnabled: false };
  const hullGeom = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
  const hull = new THREE.Mesh(hullGeom, boatMat);
  hull.rotation.x = -Math.PI / 2;
  hull.position.y = 0.2;
  group.add(hull);

  return group;
}

function createStupa(scale = 1) {
  const group = new THREE.Group();

  // Base
  const baseGeom = new THREE.BoxGeometry(1.2 * scale, 0.3 * scale, 1.2 * scale);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = 0.15 * scale;
  base.castShadow = true;
  group.add(base);

  // Body (bell shape)
  const bodyGeom = new THREE.SphereGeometry(0.5 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const body = new THREE.Mesh(bodyGeom, stoneMaterial);
  body.position.y = 0.3 * scale;
  body.castShadow = true;
  group.add(body);

  // Top spire
  const spireGeom = new THREE.ConeGeometry(0.15 * scale, 0.6 * scale, 8);
  const spire = new THREE.Mesh(spireGeom, stoneMaterial);
  spire.position.y = 1 * scale;
  spire.castShadow = true;
  group.add(spire);

  return group;
}

function createPerforatedStupa(scale = 1) {
  const group = new THREE.Group();

  // Base
  const baseGeom = new THREE.CylinderGeometry(0.8 * scale, 1 * scale, 0.3 * scale, 16);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = 0.15 * scale;
  base.castShadow = true;
  group.add(base);

  // Perforated bell (use wireframe for now, can be improved with lattice geometry)
  const bellGeom = new THREE.SphereGeometry(1 * scale, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.7);
  const bellMat = stoneMaterial.clone();
  const bell = new THREE.Mesh(bellGeom, bellMat);
  bell.position.y = 0.5 * scale;
  bell.castShadow = true;
  group.add(bell);

  // Diamond-shaped holes (represented by darker insets)
  const holeGeom = new THREE.PlaneGeometry(0.3 * scale, 0.4 * scale);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
  const holesCount = 8;
  for (let i = 0; i < holesCount; i++) {
    const angle = (i / holesCount) * Math.PI * 2;
    const hole = new THREE.Mesh(holeGeom, holeMat);
    hole.position.set(
      Math.cos(angle) * 0.95 * scale,
      0.8 * scale,
      Math.sin(angle) * 0.95 * scale
    );
    hole.rotation.y = -angle + Math.PI / 2;
    hole.rotation.z = Math.PI / 4;
    group.add(hole);
  }

  // Top
  const topGeom = new THREE.ConeGeometry(0.2 * scale, 0.5 * scale, 8);
  const top = new THREE.Mesh(topGeom, stoneMaterial);
  top.position.y = 1.8 * scale;
  top.castShadow = true;
  group.add(top);

  return group;
}

function createMainStupa() {
  const group = new THREE.Group();

  // Large base
  const baseGeom = new THREE.CylinderGeometry(4, 5, 2, 32);
  const base = new THREE.Mesh(baseGeom, stoneMaterial);
  base.position.y = 1;
  base.castShadow = true;
  group.add(base);

  // Bell
  const bellGeom = new THREE.SphereGeometry(3.5, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bell = new THREE.Mesh(bellGeom, stoneMaterial);
  bell.position.y = 2;
  bell.castShadow = true;
  group.add(bell);

  // Spire rings
  for (let i = 0; i < 9; i++) {
    const ringGeom = new THREE.TorusGeometry(1.5 - i * 0.12, 0.15, 8, 16);
    const ring = new THREE.Mesh(ringGeom, stoneMaterial);
    ring.position.y = 5.5 + i * 0.5;
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    group.add(ring);
  }

  // Top finial
  const finialGeom = new THREE.SphereGeometry(0.5, 16, 16);
  const finial = new THREE.Mesh(finialGeom, stoneMaterial);
  finial.position.y = 10.5;
  finial.castShadow = true;
  group.add(finial);

  return group;
}

function createAllPaths() {
  // Create paths connecting all landmarks
  const pathConnections = [
    // From Borobudur center
    { start: { x: 0, z: 40 }, end: { x: 0, z: 100 } },
    { start: { x: 40, z: 0 }, end: { x: 100, z: 100 } },      // To Prambanan
    { start: { x: -40, z: 0 }, end: { x: -100, z: 100 } },    // To Lempuyang
    { start: { x: 0, z: -40 }, end: { x: 0, z: -150 } },      // To Danau Batur
    
    // Cross paths
    { start: { x: 100, z: 100 }, end: { x: 200, z: 200 } },   // Continue to Prambanan
    { start: { x: -100, z: 100 }, end: { x: -200, z: 200 } }, // Continue to Lempuyang
    { start: { x: 0, z: -150 }, end: { x: 0, z: -250 } },     // Continue to Danau Batur
    
    // Connecting paths between landmarks
    { start: { x: 200, z: 200 }, end: { x: -200, z: 200 } },  // Prambanan to Lempuyang
    { start: { x: 200, z: 200 }, end: { x: 100, z: -150 } },  // Prambanan to Danau Batur
    { start: { x: -200, z: 200 }, end: { x: -100, z: -150 } }, // Lempuyang to Danau Batur
  ];

  pathConnections.forEach(path => {
    const dx = path.end.x - path.start.x;
    const dz = path.end.z - path.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    
    const pathGeom = new THREE.PlaneGeometry(6, length);
    const pathMesh = new THREE.Mesh(pathGeom, pathMaterial);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.rotation.z = -angle;
    pathMesh.position.set(
      (path.start.x + path.end.x) / 2,
      0.05,
      (path.start.z + path.end.z) / 2
    );
    pathMesh.receiveShadow = true;
    scene.add(pathMesh);
  });
}

function createTrees() {
  const treePositions = [];
  
  // Landmark positions to avoid
  const exclusionZones = [
    { x: 0, z: 0, radius: 80 },       // Borobudur
    { x: 200, z: 200, radius: 100 },  // Prambanan
    { x: -200, z: 200, radius: 60 },  // Lempuyang
    { x: 0, z: -250, radius: 100 },   // Danau Batur
  ];

  // Generate random tree positions
  for (let i = 0; i < 200; i++) {
    const x = (Math.random() - 0.5) * 900;
    const z = (Math.random() - 0.5) * 900;
    
    // Check if position is in any exclusion zone
    let inExclusionZone = false;
    for (const zone of exclusionZones) {
      const dist = Math.sqrt((x - zone.x) ** 2 + (z - zone.z) ** 2);
      if (dist < zone.radius) {
        inExclusionZone = true;
        break;
      }
    }
    
    if (!inExclusionZone) {
      treePositions.push({ x, z });
    }
  }

  treePositions.forEach(pos => {
    const tree = createTree();
    tree.position.set(pos.x, 0, pos.z);
    scene.add(tree);
  });
}

function createTree() {
  const group = new THREE.Group();

  // Trunk
  const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 1 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 2;
  trunk.castShadow = true;
  group.add(trunk);

  // Foliage (multiple spheres for natural look)
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 });
  
  const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), foliageMat);
  foliage1.position.set(0, 5, 0);
  foliage1.castShadow = true;
  group.add(foliage1);

  const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), foliageMat);
  foliage2.position.set(1, 6, 0.5);
  foliage2.castShadow = true;
  group.add(foliage2);

  const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), foliageMat);
  foliage3.position.set(-0.8, 6.5, -0.3);
  foliage3.castShadow = true;
  group.add(foliage3);

  // Random scale variation
  const scale = 0.8 + Math.random() * 0.6;
  group.scale.set(scale, scale, scale);

  return group;
}

function createPOIMarkers() {
  pointsOfInterest.forEach(poi => {
    // Create a glowing marker
    const markerGroup = new THREE.Group();
    markerGroup.userData = { poi };

    // Pillar
    const pillarGeom = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ 
      color: 0xffcc00, 
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.y = 1;
    markerGroup.add(pillar);

    // Floating orb
    const orbGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffcc00,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.8
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    orb.position.y = 2.5;
    orb.userData.isOrb = true;
    markerGroup.add(orb);

    // Point light
    const light = new THREE.PointLight(0xffcc00, 1, 10);
    light.position.y = 2.5;
    markerGroup.add(light);

    markerGroup.position.set(poi.position.x, 0, poi.position.z);
    scene.add(markerGroup);
  });
}

// ===== PLAYER (2D SPRITE IN 3D WORLD) =====
class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 0, 80);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.speed = 18;
    this.runSpeed = 30;
    this.jumpForce = 12;
    this.gravity = 30;
    this.isGrounded = true;
    this.isMoving = false;
    this.isRunning = false;
    
    // Animation
    this.currentAnim = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameSpeed = 0.12;
    
    // Textures
    this.idleTextures = [];
    this.walkTextures = [];
    
    // Create sprite
    this.mesh = null;
    this.material = null;
  }

  async loadTextures(charName) {
    const charData = characterData[charName];
    if (!charData) return;

    const loader = new THREE.TextureLoader();
    
    // Load idle textures
    this.idleTextures = await Promise.all(
      charData.idle.map(path => {
        return new Promise(resolve => {
          loader.load(path, tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            resolve(tex);
          }, undefined, () => resolve(null));
        });
      })
    );
    this.idleTextures = this.idleTextures.filter(t => t !== null);

    // Load walk textures
    this.walkTextures = await Promise.all(
      charData.walk.map(path => {
        return new Promise(resolve => {
          loader.load(path, tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            resolve(tex);
          }, undefined, () => resolve(null));
        });
      })
    );
    this.walkTextures = this.walkTextures.filter(t => t !== null);

    // Create sprite material and mesh
    if (this.idleTextures.length > 0) {
      this.material = new THREE.SpriteMaterial({
        map: this.idleTextures[0],
        transparent: true
      });
      
      this.mesh = new THREE.Sprite(this.material);
      this.mesh.scale.set(4, 5, 1);
      this.mesh.position.copy(this.position);
      this.mesh.position.y += 2.5;
      scene.add(this.mesh);
    }
  }

  update(delta, keys, cameraAngle) {
    if (!this.mesh) return;

    // Movement input
    let moveX = 0;
    let moveZ = 0;
    this.isMoving = false;
    this.isRunning = keys['ShiftLeft'] || keys['ShiftRight'];

    // Get input direction (relative to screen)
    if (keys['KeyW'] || keys['ArrowUp']) { moveZ = -1; this.isMoving = true; }
    if (keys['KeyS'] || keys['ArrowDown']) { moveZ = 1; this.isMoving = true; }
    if (keys['KeyA'] || keys['ArrowLeft']) { moveX = -1; this.isMoving = true; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveX = 1; this.isMoving = true; }

    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      const factor = 1 / Math.sqrt(2);
      moveX *= factor;
      moveZ *= factor;
    }

    // Transform movement direction based on camera orientation
    if (this.isMoving) {
      // Camera angle is the horizontal rotation of the camera
      const sin = Math.sin(cameraAngle);
      const cos = Math.cos(cameraAngle);
      
      // Transform input to world space based on camera direction
      // W = forward (negative Z in camera space) -> towards where camera is looking
      // S = backward (positive Z in camera space)
      // A = left (negative X in camera space)
      // D = right (positive X in camera space)
      const worldX = moveX * cos + moveZ * sin;
      const worldZ = -moveX * sin + moveZ * cos;
      
      const currentSpeed = this.isRunning ? this.runSpeed : this.speed;
      this.velocity.x = worldX * currentSpeed;
      this.velocity.z = worldZ * currentSpeed;

      // Face the direction of movement
      if (Math.abs(worldX) > 0.01 || Math.abs(worldZ) > 0.01) {
        this.rotation = Math.atan2(worldX, worldZ);
      }
    } else {
      // Decelerate smoothly when no input
      this.velocity.x *= 0.85;
      this.velocity.z *= 0.85;
      
      // Stop completely if very slow
      if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.1) this.velocity.z = 0;
    }

    // Jump
    if ((keys['Space']) && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }

    // ===== COLLISION DETECTION =====
    const playerRadius = 2.5;
    
    // Try X movement first
    let newX = this.position.x + this.velocity.x * delta;
    let newZ = this.position.z;
    
    if (checkCollision(newX, newZ, playerRadius).collision) {
      // X blocked, keep original X
      newX = this.position.x;
      this.velocity.x = 0;
    }
    
    // Then try Z movement
    newZ = this.position.z + this.velocity.z * delta;
    
    if (checkCollision(newX, newZ, playerRadius).collision) {
      // Z blocked, keep original Z
      newZ = this.position.z;
      this.velocity.z = 0;
    }
    
    // Final check - if still colliding, don't move at all
    if (checkCollision(newX, newZ, playerRadius).collision) {
      newX = this.position.x;
      newZ = this.position.z;
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // Apply final position
    this.position.x = newX;
    this.position.y += this.velocity.y * delta;
    this.position.z = newZ;

    // Ground check
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // World bounds - larger world
    const worldBound = 480;
    this.position.x = THREE.MathUtils.clamp(this.position.x, -worldBound, worldBound);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -worldBound, worldBound);

    // Update mesh position
    this.mesh.position.copy(this.position);
    this.mesh.position.y += 2.5;

    // Animation
    this.updateAnimation(delta);
  }

  updateAnimation(delta) {
    const textures = this.isMoving ? this.walkTextures : this.idleTextures;
    if (textures.length === 0) return;

    // Adjust frame speed for running
    const speed = this.isMoving && this.isRunning ? this.frameSpeed * 0.6 : this.frameSpeed;

    this.frameTimer += delta;
    if (this.frameTimer >= speed) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % textures.length;
      this.material.map = textures[this.frameIndex];
      this.material.needsUpdate = true;
    }

    // Reset frame index when animation changes
    const newAnim = this.isMoving ? 'walk' : 'idle';
    if (newAnim !== this.currentAnim) {
      this.currentAnim = newAnim;
      this.frameIndex = 0;
      this.frameTimer = 0;
    }
  }

  setCharacter(charName) {
    if (this.mesh) {
      scene.remove(this.mesh);
    }
    this.loadTextures(charName);
  }
}

// ===== CAMERA CONTROLLER =====
class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.distance = 20;
    this.minDistance = 8;
    this.maxDistance = 40;
    this.rotationX = 0;
    this.rotationY = Math.PI * 0.2; // Slight elevation
    this.minRotationY = 0.1;
    this.maxRotationY = Math.PI / 2 - 0.1;
    this.mouseSensitivity = 0.003;
    this.smoothing = 0.1;
    this.targetPosition = new THREE.Vector3();
  }

  update(playerPosition) {
    // Calculate camera position
    const x = playerPosition.x + this.distance * Math.sin(this.rotationX) * Math.cos(this.rotationY);
    const y = playerPosition.y + this.distance * Math.sin(this.rotationY) + 5;
    const z = playerPosition.z + this.distance * Math.cos(this.rotationX) * Math.cos(this.rotationY);

    // Smooth camera movement
    this.camera.position.lerp(new THREE.Vector3(x, y, z), this.smoothing);

    // Look at player
    this.targetPosition.copy(playerPosition);
    this.targetPosition.y += 3;
    this.camera.lookAt(this.targetPosition);
  }

  handleMouseMove(movementX, movementY) {
    this.rotationX -= movementX * this.mouseSensitivity;
    this.rotationY += movementY * this.mouseSensitivity;
    this.rotationY = THREE.MathUtils.clamp(this.rotationY, this.minRotationY, this.maxRotationY);
  }

  handleWheel(deltaY) {
    this.distance += deltaY * 0.01;
    this.distance = THREE.MathUtils.clamp(this.distance, this.minDistance, this.maxDistance);
  }

  getHorizontalAngle() {
    return this.rotationX;
  }
}

// ===== INPUT HANDLING =====
const keys = {};
let mouseMovement = { x: 0, y: 0 };

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  // Handle pause
  if (e.code === 'Escape' && gameState.status === 'playing') {
    togglePause();
  }
  
  // Handle interaction
  if (e.code === 'KeyE' && gameState.status === 'playing') {
    handleInteraction();
  }
  
  // Handle loading screen
  if (e.code === 'Enter' && gameState.status === 'loading') {
    showCharacterSelection();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

canvas.addEventListener('click', () => {
  if (gameState.status === 'playing' && !gameState.isPointerLocked) {
    canvas.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  gameState.isPointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (e) => {
  if (gameState.isPointerLocked && gameState.status === 'playing') {
    mouseMovement.x = e.movementX;
    mouseMovement.y = e.movementY;
  }
});

canvas.addEventListener('wheel', (e) => {
  if (gameState.status === 'playing' && cameraController) {
    cameraController.handleWheel(e.deltaY);
  }
});

// ===== UI FUNCTIONS =====
function showCharacterSelection() {
  loadingScreen.style.display = 'none';
  charSelection.style.display = 'flex';
  gameState.status = 'charSelect';
  
  // Populate character options
  charOptions.innerHTML = '';
  Object.entries(characterData).forEach(([key, char]) => {
    const card = document.createElement('div');
    card.className = 'char-card' + (key === gameState.selectedCharacter ? ' selected' : '');
    card.innerHTML = `
      <img src="${char.idle[0]}" alt="${char.name}" />
      <div class="name">${char.name}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      gameState.selectedCharacter = key;
    });
    charOptions.appendChild(card);
  });
}

function startGame() {
  charSelection.style.display = 'none';
  gameHud.style.display = 'block';
  gameState.status = 'playing';
  
  // Update HUD
  const charData = characterData[gameState.selectedCharacter];
  if (playerAvatar) playerAvatar.src = charData.idle[0];
  if (playerNameEl) playerNameEl.textContent = charData.name;
  
  // Load player character
  player.setCharacter(gameState.selectedCharacter);
  
  // Request pointer lock
  setTimeout(() => {
    canvas.requestPointerLock();
  }, 100);
}

function togglePause() {
  if (gameState.status === 'playing') {
    gameState.status = 'paused';
    pauseMenu.style.display = 'flex';
    document.exitPointerLock();
  } else if (gameState.status === 'paused') {
    gameState.status = 'playing';
    pauseMenu.style.display = 'none';
    canvas.requestPointerLock();
  }
}

function handleInteraction() {
  // Check for nearby POI
  const nearbyPOI = findNearbyPOI();
  if (nearbyPOI) {
    showInfoPanel(nearbyPOI);
  }
}

function findNearbyPOI() {
  const interactionDistance = 8;
  
  for (const poi of pointsOfInterest) {
    const dx = player.position.x - poi.position.x;
    const dz = player.position.z - poi.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < interactionDistance) {
      return poi;
    }
  }
  return null;
}

function showInfoPanel(poi) {
  infoTitle.textContent = poi.title;
  infoDescription.textContent = poi.description;
  infoPanel.style.display = 'block';
  gameState.status = 'paused';
  document.exitPointerLock();
}

function closeInfoPanelFn() {
  infoPanel.style.display = 'none';
  gameState.status = 'playing';
  canvas.requestPointerLock();
}

function updateInteractionPrompt() {
  const nearbyPOI = findNearbyPOI();
  if (nearbyPOI && gameState.status === 'playing') {
    interactionPrompt.style.display = 'block';
  } else {
    interactionPrompt.style.display = 'none';
  }
}

function updateMinimap() {
  if (!minimapCtx) return;
  
  const size = 150;
  const scale = 0.15; // Adjusted for larger world
  
  // Clear
  minimapCtx.fillStyle = 'rgba(0, 30, 0, 0.9)';
  minimapCtx.fillRect(0, 0, size, size);
  
  // Draw landmarks
  const landmarkColors = {
    borobudur: '#8B8B7A',
    prambanan: '#8B4513',
    lempuyang: '#6B6B5A',
    batur: '#2E8B8B'
  };
  
  Object.entries(landmarks).forEach(([key, landmark]) => {
    const x = size/2 + landmark.position.x * scale;
    const z = size/2 + landmark.position.z * scale;
    if (x > 5 && x < size - 5 && z > 5 && z < size - 5) {
      minimapCtx.fillStyle = landmarkColors[key] || '#888888';
      minimapCtx.beginPath();
      minimapCtx.arc(x, z, key === 'batur' ? 8 : 6, 0, Math.PI * 2);
      minimapCtx.fill();
      
      // Label
      minimapCtx.fillStyle = '#ffffff';
      minimapCtx.font = '7px Arial';
      minimapCtx.textAlign = 'center';
      minimapCtx.fillText(landmark.name.split(' ')[0], x, z - 8);
    }
  });
  
  // Draw POI markers
  minimapCtx.fillStyle = '#ffcc00';
  pointsOfInterest.forEach(poi => {
    const x = size/2 + poi.position.x * scale;
    const z = size/2 + poi.position.z * scale;
    if (x > 0 && x < size && z > 0 && z < size) {
      minimapCtx.beginPath();
      minimapCtx.arc(x, z, 2, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  });
  
  // Draw player position
  const playerX = size/2 + player.position.x * scale;
  const playerZ = size/2 + player.position.z * scale;
  
  // Player direction indicator
  minimapCtx.save();
  minimapCtx.translate(playerX, playerZ);
  minimapCtx.rotate(player.rotation);
  minimapCtx.fillStyle = '#00ff00';
  minimapCtx.beginPath();
  minimapCtx.moveTo(0, -6);
  minimapCtx.lineTo(-4, 4);
  minimapCtx.lineTo(4, 4);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.restore();
}

// ===== EVENT LISTENERS =====
if (startExploreBtn) {
  startExploreBtn.addEventListener('click', startGame);
}

if (menuBtn) {
  menuBtn.addEventListener('click', togglePause);
}

if (resumeBtn) {
  resumeBtn.addEventListener('click', togglePause);
}

if (changeCharBtn) {
  changeCharBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'none';
    gameHud.style.display = 'none';
    showCharacterSelection();
  });
}

if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    location.reload();
  });
}

if (closeInfoBtn) {
  closeInfoBtn.addEventListener('click', closeInfoPanelFn);
}

// ===== INITIALIZE =====
const player = new Player();
let cameraController = null;

// Create world
createWorld();

// Debug: visualize collision boxes (set to true to see them)
const DEBUG_COLLISION = false;
if (DEBUG_COLLISION) {
  collisionBoxes.forEach(box => {
    const width = box.maxX - box.minX;
    const depth = box.maxZ - box.minZ;
    const centerX = (box.minX + box.maxX) / 2;
    const centerZ = (box.minZ + box.maxZ) / 2;
    
    const debugGeom = new THREE.BoxGeometry(width, 5, depth);
    const debugMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true
    });
    const debugBox = new THREE.Mesh(debugGeom, debugMat);
    debugBox.position.set(centerX, 2.5, centerZ);
    scene.add(debugBox);
  });
  console.log('Collision boxes:', collisionBoxes);
}

// Initialize camera controller
cameraController = new CameraController(camera, player.position);

// Loading complete
setTimeout(() => {
  if (loadingText) loadingText.textContent = 'Tekan ENTER untuk mulai';
}, 1500);

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  if (gameState.status === 'playing') {
    // Update player
    player.update(delta, keys, cameraController.getHorizontalAngle());
    
    // Update camera
    if (cameraController) {
      cameraController.handleMouseMove(mouseMovement.x, mouseMovement.y);
      cameraController.update(player.position);
    }
    
    // Reset mouse movement
    mouseMovement.x = 0;
    mouseMovement.y = 0;
    
    // Update UI
    updateInteractionPrompt();
    updateMinimap();
    
    // Animate POI orbs
    scene.traverse(obj => {
      if (obj.userData && obj.userData.isOrb) {
        obj.position.y = 2.5 + Math.sin(clock.elapsedTime * 2) * 0.3;
      }
      // Animate smoke from volcano
      if (obj.userData && obj.userData.isSmoke) {
        obj.position.y = obj.userData.baseY + Math.sin(clock.elapsedTime * 0.5 + obj.position.x) * 2;
        obj.material.opacity = 0.3 + Math.sin(clock.elapsedTime + obj.position.z) * 0.15;
      }
      // Animate boats on lake
      if (obj.userData && obj.userData.isBoat) {
        const newAngle = obj.userData.angle + clock.elapsedTime * 0.02;
        obj.position.x = Math.cos(newAngle) * obj.userData.radius;
        obj.position.z = Math.sin(newAngle) * obj.userData.radius;
        obj.position.y = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.1;
        obj.rotation.y = newAngle + Math.PI / 2;
      }
    });
  }
  
  renderer.render(scene, camera);
}

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
