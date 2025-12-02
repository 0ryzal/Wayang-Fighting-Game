import * as THREE from 'three';

// ==========================================
// 1. FACTORY ORNAMEN 3D (Procedural Meshes)
// ==========================================

// Material standar untuk batu candi (Abu-abu gelap & kasar)
const stoneMat = new THREE.MeshStandardMaterial({ 
  color: 0x666666, 
  roughness: 0.9, 
  metalness: 0.1,
  flatShading: true 
});

// Material untuk atap jerami/kayu (untuk map Bali/Danau)
const woodMat = new THREE.MeshStandardMaterial({ 
  color: 0x3d2817, 
  roughness: 1.0, 
  flatShading: true 
});

// A. STUPA (Untuk Map 2 - Borobudur)
function createStupa(x, z, scale = 1) {
  const group = new THREE.Group();
  
  // Alas (Kotak bertumpuk)
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), stoneMat); b1.position.y = 0.15;
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), stoneMat); b2.position.y = 0.45;
  // Badan (Silinder Gembung)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8), stoneMat); body.position.y = 0.9;
  // Puncak (Cone)
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 8), stoneMat); top.position.y = 1.6;

  group.add(b1, b2, body, top);
  
  // Aktifkan bayangan untuk semua anak mesh
  group.traverse(o => { if(o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
  
  group.position.set(x, -3.8, z); // Nempel tanah
  group.scale.set(scale, scale, scale);
  return group;
}

// B. CANDI BENTAR / GERBANG TERBELAH (Untuk Map 3)
function createCandiBentar(x, z, scale = 1) {
  const group = new THREE.Group();
  
  function createSide(isLeft) {
    const sideGroup = new THREE.Group();
    // Tumpukan kotak yang makin kecil ke atas
    for(let i=0; i<6; i++) {
      const w = 0.8 - (i * 0.1);
      const h = 0.4;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stoneMat);
      box.position.y = i * h;
      // Geser sedikit biar rata tengah di sisi dalam (efek terbelah)
      box.position.x = isLeft ? -w/4 : w/4; 
      sideGroup.add(box);
    }
    return sideGroup;
  }

  const left = createSide(true); left.position.x = -0.5;
  const right = createSide(false); right.position.x = 0.5;
  
  group.add(left, right);
  group.traverse(o => { if(o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
  group.position.set(x, -3.8, z);
  group.scale.set(scale, scale*1.5, scale);
  return group;
}

// C. PRAMBANAN STYLE (Untuk Map 4 - Tinggi Ramping)
function createPrambanan(x, z, scale = 1) {
  const group = new THREE.Group();
  
  // Kaki
  const base = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), stoneMat); base.position.y = 0.5;
  // Badan Utama (Tinggi)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), stoneMat); body.position.y = 2;
  // Atap Bertingkat
  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 6), stoneMat); roof1.position.y = 3.2;
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), stoneMat); roof2.position.y = 3.6;

  group.add(base, body, roof1, roof2);
  group.traverse(o => { if(o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
  
  group.position.set(x, -3.8, z);
  group.scale.set(scale, scale, scale);
  return group;
}

// D. MERU / PAGODA (Untuk Map 5 - Atap Ijuk Bertumpuk)
function createMeru(x, z, scale = 1) {
  const group = new THREE.Group();
  
  // Tiang dasar
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), stoneMat); base.position.y = 0.5;
  group.add(base);

  // Atap bertumpuk (Meru) - 5 tingkat
  for(let i=0; i<5; i++) {
    const size = 1.2 - (i * 0.15);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(size, 0.4, 4), woodMat); // Pakai material kayu/ijuk
    roof.position.y = 1.2 + (i * 0.5);
    roof.rotation.y = Math.PI / 4; // Biar miring kayak atap
    group.add(roof);
  }

  group.traverse(o => { if(o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
  group.position.set(x, -3.8, z);
  group.scale.set(scale, scale, scale);
  return group;
}

// E. OBOR (Untuk Map 1 atau Umum)
function createObor(x, z) {
  const group = new THREE.Group();
  const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), new THREE.MeshStandardMaterial({color: 0x333333}));
  tiang.position.y = 1;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), new THREE.MeshStandardMaterial({color: 0x552200}));
  head.position.y = 2;
  
  // Cahaya api lokal
  const fire = new THREE.PointLight(0xffaa00, 2, 4);
  fire.position.set(0, 2.2, 0);

  group.add(tiang, head, fire);
  group.traverse(o => { if(o.isMesh) { o.castShadow = true; }});
  group.position.set(x, -3.8, z);
  return group;
}

// ==========================================
// 2. MAIN SETUP
// ==========================================

const canvas = document.getElementById('scene');
// Enable ShadowMap pada renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;
const viewHeight = 10;
const camera = new THREE.OrthographicCamera(
  -viewHeight * aspect / 2,
  viewHeight * aspect / 2,
  viewHeight / 2,
  -viewHeight / 2,
  0.1,
  100
);
camera.position.z = 10;

// Lighting Setup (Pengganti Basic Light)
// 1. Ambient Light (Cahaya dasar, default 0 biar gelap dulu)
const ambientLight = new THREE.AmbientLight(0xffffff, 0); 
scene.add(ambientLight);

// 2. Directional Light (Matahari/Bulan pembentuk bayangan)
const dirLight = new THREE.DirectionalLight(0xffffff, 0);
dirLight.position.set(5, 8, 5); // Posisi cahaya dari atas kanan depan
dirLight.castShadow = true;

// Optimasi Shadow Map
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 20;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

// Variables for lighting animation
let targetIntensity = 0;
let targetAmbient = 0;


const listener = new THREE.AudioListener();
camera.add(listener);

// Music: menu (idle) and fight
const audioLoader = new THREE.AudioLoader();
const menuMusic = new THREE.Audio(listener);
const fightMusic = new THREE.Audio(listener);
let musicReady = { menu: false, fight: false };
audioLoader.load('./music/idle.mp3', (buffer) => { try { menuMusic.setBuffer(buffer); menuMusic.setLoop(true); menuMusic.setVolume(0.45); musicReady.menu = true; } catch(e){} });
audioLoader.load('./music/fight.mp3', (buffer) => { try { fightMusic.setBuffer(buffer); fightMusic.setLoop(true); fightMusic.setVolume(0.5); musicReady.fight = true; } catch(e){} });

function stopMusic(audio) {
  try {
    if (audio && audio.isPlaying) audio.stop();
  } catch (e) {}
}

function playMusic(name) {
  try {
    if (name === 'menu') {
      if (fightMusic && fightMusic.isPlaying) stopMusic(fightMusic);
      if (menuMusic && !menuMusic.isPlaying && musicReady.menu) {
        try {
          // start muted then fade-in for nicer UX
          menuMusic.setVolume(0);
          const p = menuMusic.play();
          if (p && p.catch) p.catch(() => {});
          // ramp volume to desired level
          const target = 0.45;
          const steps = 12;
          let cur = 0;
          const step = target / steps;
          const iv = setInterval(() => {
            cur += step;
            try { menuMusic.setVolume(Math.min(cur, target)); } catch(e){}
            if (cur >= target) clearInterval(iv);
          }, 70);
        } catch(e){}
      }
    } else if (name === 'fight') {
      if (menuMusic && menuMusic.isPlaying) stopMusic(menuMusic);
      if (fightMusic && !fightMusic.isPlaying && musicReady.fight) {
        const p = fightMusic.play();
        if (p && p.catch) p.catch(() => {});
      }
    }
  } catch (e) {}
}

function updateMusicForState() {
  // fight music only during active fight
  if (gameState.status === 'fight') {
    playMusic('fight');
  } else {
    // otherwise use menu/idle music
    playMusic('menu');
  }
}

function createTone(freq, durationMs = 140, type = 'sine', gain = 0.25) {
  const ctx = listener.context;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * (durationMs / 1000));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.max(0, 1 - (i / length));
    const phase = 2 * Math.PI * freq * t;
    let v = Math.sin(phase);
    if (type === 'square') v = Math.sign(v);
    else if (type === 'triangle') v = 2 * Math.asin(Math.sin(phase)) / Math.PI;
    data[i] = v * env * gain;
  }
  const audio = new THREE.Audio(listener);
  audio.setBuffer(buffer);
  audio.setLoop(false);
  return audio;
}

const sfx = {
  punch: () => { const a = createTone(320, 120, 'triangle', 0.35); a.play(); },
  block: () => { const a = createTone(180, 90, 'square', 0.28); a.play(); },
  win: () => { const a = createTone(520, 300, 'sine', 0.3); a.play(); },
  jump: () => { const a = createTone(440, 160, 'sine', 0.25); a.play(); }
};

let selectedMap = './map/latar.jpg';

// Gunakan StandardMaterial agar bisa bereaksi thd cahaya dan menerima bayangan
const backgroundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(24 * aspect, 24), // Lebar diperbesar agar cover area
  new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 1, 
    metalness: 0 
  })
);
backgroundMesh.position.z = -6; // Mundur agar ornamen 3D muat
backgroundMesh.receiveShadow = true; // Background menerima bayangan dari ornamen
scene.add(backgroundMesh);

// Utility: safe DOM removal helper to avoid repeating try/catch removal patterns
function safeRemove(node) {
  try {
    if (!node) return;
    if (typeof node.remove === 'function') node.remove();
    else if (node.parentNode) node.parentNode.removeChild(node);
  } catch (e) {
    try { node && node.parentNode && node.parentNode.removeChild(node); } catch (err) {}
  }
}

function loadBackground(path) {
  new THREE.TextureLoader().load(path, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    
    // Gunakan LinearFilter untuk hasil lebih smooth tanpa blur berlebihan
    tex.minFilter = THREE.LinearMipmapLinearFilter; 
    tex.magFilter = THREE.LinearFilter;
    
    tex.generateMipmaps = true;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    backgroundMesh.material.map = tex;
    backgroundMesh.material.needsUpdate = true;
  });
}
loadBackground(selectedMap);

// Lantai penerima bayangan
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 5),
  new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 })
);
floorMesh.position.y = -3.8;
floorMesh.position.z = -1;
floorMesh.receiveShadow = true; // Lantai menerima bayangan
scene.add(floorMesh);

// ==========================================
// 3. MAP CONFIGURATION & LOGIC
// ==========================================

const decorationGroup = new THREE.Group();
scene.add(decorationGroup);

// Konfigurasi Tiap Map (Warna Lampu + Tipe Ornamen)
const mapConfigs = {
  1: { // latar.jpg (Wayang/Gold)
    lightColor: 0xffdd55, // Kuning Emas
    intensity: 1.2,
    ambient: 0.5,
    ornament: 'obor'
  },
  2: { // latar2.png (Borobudur/Sunset)
    lightColor: 0xffaa66, // Oranye Sore
    intensity: 1.5,
    ambient: 0.3,
    ornament: 'stupa'
  },
  3: { // latar3.png (Candi Bentar/Siang Biru)
    lightColor: 0xffffff, // Putih Terang
    intensity: 1.1,
    ambient: 0.6,
    ornament: 'bentar'
  },
  4: { // latar4.png (Prambanan/Siang)
    lightColor: 0xffffcc, // Kuning Pucat
    intensity: 1.2,
    ambient: 0.5,
    ornament: 'prambanan'
  },
  5: { // latar5.png (Danau/Meru/Misty)
    lightColor: 0xaaccff, // Biru Kebiruan (Misty)
    intensity: 1.0,
    ambient: 0.4,
    ornament: 'meru'
  }
};

function loadMapDecorations(mapIndex) {
  // 1. Bersihkan ornamen lama
  while(decorationGroup.children.length > 0){ 
    const obj = decorationGroup.children[0];
    decorationGroup.remove(obj);
    if(obj.geometry) obj.geometry.dispose();
    if(obj.material) obj.material.dispose();
  }

  const config = mapConfigs[mapIndex] || mapConfigs[1];

  // 2. Set Warna Lampu
  dirLight.color.setHex(config.lightColor);
  
  // 3. Set Target Intensitas (untuk animasi fade-in nanti)
  targetIntensity = config.intensity;
  targetAmbient = config.ambient;
  
  // Reset lampu ke 0 dulu biar nanti transisi halus
  dirLight.intensity = 0;
  ambientLight.intensity = 0;

  // 4. Pasang Ornamen sesuai Map
  if (config.ornament === 'stupa') {
    decorationGroup.add(createStupa(-7, -2, 1.5));
    decorationGroup.add(createStupa(-5, -4, 1.2));
    decorationGroup.add(createStupa(6, -2, 1.5));
    decorationGroup.add(createStupa(8, -4, 1.0));
  } 
  else if (config.ornament === 'bentar') {
    decorationGroup.add(createCandiBentar(-6, -3, 1.5));
    decorationGroup.add(createCandiBentar(6, -3, 1.5));
  }
  else if (config.ornament === 'prambanan') {
    decorationGroup.add(createPrambanan(-7, -3, 1.2));
    decorationGroup.add(createPrambanan(7, -3, 1.2));
    // Tambah candi kecil di jauh belakang
    const small = createPrambanan(0, -6, 0.8);
    small.position.y = -4; // Turunin dikit
    decorationGroup.add(small);
  }
  else if (config.ornament === 'meru') {
    decorationGroup.add(createMeru(-6, -2, 1.3));
    decorationGroup.add(createMeru(6, -2, 1.3));
    decorationGroup.add(createMeru(-8, -4, 1.0));
  }
  else { // Obor / Default
    decorationGroup.add(createObor(-5, -2));
    decorationGroup.add(createObor(5, -2));
  }
}

class Fighter2D {
  constructor(idleFrames, punchFrames, walkFrames, startX, facingRight, playerIndex) {
    this.playerIndex = playerIndex;
    this.facingRight = facingRight;
    this.startX = startX;
    this.currentAnim = 'idle';
    this.attackTimer = 0;
    this.cooldown = 0;
    this.blocking = false;
    this.blockEffectTimer = 0;
    this.hitFlashTimer = 0; // timer untuk efek flash putih saat terkena hit
    this.x = startX;
    this.y = -3;
    this.baseY = -3;
    this.velocityY = 0;
    this.onGround = true;
    this.isWalking = false; // track jika karakter sedang jalan
    
    // Animation frame tracking
    this.idleFrameIndex = 0;
    this.idleFrameTimer = 0;
    this.idleFrameSpeed = 0.15; // waktu per frame dalam detik
    
    // Punch animation frame tracking
    this.punchFrameIndex = 0;
    this.punchFrameTimer = 0;
    this.punchFrameSpeed = 0.1; // waktu per frame punch
    
    // Walk animation frame tracking
    this.walkFrameIndex = 0;
    this.walkFrameTimer = 0;
    this.walkFrameSpeed = 0.08; // waktu per frame walk
    
    // Load idle animation frames
    this.idleTextures = [];
    const loader = new THREE.TextureLoader();
    idleFrames.forEach((path) => {
      const tex = loader.load(path, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.LinearFilter;
        t.minFilter = THREE.LinearFilter;
      });
      this.idleTextures.push(tex);
    });
    
    // Load punch animation frames
    this.punchTextures = [];
    punchFrames.forEach((path) => {
      const tex = loader.load(path, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.LinearFilter;
        t.minFilter = THREE.LinearFilter;
      });
      this.punchTextures.push(tex);
    });
    
    // Load walk animation frames
    this.walkTextures = [];
    walkFrames.forEach((path) => {
      const tex = loader.load(path, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.LinearFilter;
        t.minFilter = THREE.LinearFilter;
      });
      this.walkTextures.push(tex);
    });
    
    const spriteMaterial = new THREE.MeshBasicMaterial({
      map: this.idleTextures[0],
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.1
    });
    
    // Sprite height 4 units, aspect ratio akan di-set otomatis
    this.spriteHeight = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), spriteMaterial);
    this.mesh.position.set(startX, this.y + 0.5, 0);
    scene.add(this.mesh);
  }
  
  update(delta) {
    if (this.cooldown > 0) this.cooldown -= delta;
    if (this.attackTimer > 0) this.attackTimer -= delta;
    if (this.blockEffectTimer > 0) this.blockEffectTimer -= delta;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= delta;
    
    if (!this.onGround) {
      this.velocityY -= 30 * delta;
      this.y += this.velocityY * delta;
      if (this.y <= this.baseY) {
        this.y = this.baseY;
        this.velocityY = 0;
        this.onGround = true;
      }
    }
    
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y + 1;
    
    // Switch texture berdasarkan state
    if (this.attackTimer > 0) {
      // Animasi punch
      this.punchFrameTimer += delta;
      if (this.punchFrameTimer >= this.punchFrameSpeed) {
        this.punchFrameTimer = 0;
        this.punchFrameIndex = (this.punchFrameIndex + 1) % this.punchTextures.length;
      }
      this.mesh.material.map = this.punchTextures[this.punchFrameIndex];
      this.mesh.material.needsUpdate = true;
      // Mirror punch
      this.mesh.scale.x = this.facingRight ? 1 : -1;
    } else if (this.isWalking && this.onGround) {
      // Reset punch dan idle frame saat walk
      this.punchFrameIndex = 0;
      this.punchFrameTimer = 0;
      this.idleFrameIndex = 0;
      this.idleFrameTimer = 0;
      
      // Animasi walk
      this.walkFrameTimer += delta;
      if (this.walkFrameTimer >= this.walkFrameSpeed) {
        this.walkFrameTimer = 0;
        this.walkFrameIndex = (this.walkFrameIndex + 1) % this.walkTextures.length;
      }
      this.mesh.material.map = this.walkTextures[this.walkFrameIndex];
      this.mesh.material.needsUpdate = true;
      // Mirror walk
      this.mesh.scale.x = this.facingRight ? 1 : -1;
    } else {
      // Reset punch dan walk frame saat idle
      this.punchFrameIndex = 0;
      this.punchFrameTimer = 0;
      this.walkFrameIndex = 0;
      this.walkFrameTimer = 0;
      
      // Animasi idle
      this.idleFrameTimer += delta;
      if (this.idleFrameTimer >= this.idleFrameSpeed) {
        this.idleFrameTimer = 0;
        this.idleFrameIndex = (this.idleFrameIndex + 1) % this.idleTextures.length;
      }
      this.mesh.material.map = this.idleTextures[this.idleFrameIndex];
      this.mesh.material.needsUpdate = true;
      // Mirror idle
      this.mesh.scale.x = this.facingRight ? 1 : -1;
    }
    
    this.mesh.rotation.z = 0;
    
    if (this.blockEffectTimer > 0) {
      const pulse = Math.sin((this.blockEffectTimer / 0.25) * Math.PI) * 0.15;
      this.mesh.scale.y = 1 + pulse;
    } else {
      this.mesh.scale.y = 1;
    }
    
    if (this.blocking && this.attackTimer <= 0) {
      this.mesh.scale.y = 0.9;
      this.mesh.position.y = this.y + 0.8;
    }
    
    // Efek flash putih saat terkena hit
    if (this.hitFlashTimer > 0) {
      // Buat sprite sangat putih terang
      const flashIntensity = this.hitFlashTimer / 0.2;
      const brightness = 5 + flashIntensity * 10; // jauh lebih terang
      this.mesh.material.color.setRGB(brightness, brightness, brightness);
    } else {
      this.mesh.material.color.setRGB(1, 1, 1);
    }
    
    // Reset walking state setelah update
    this.isWalking = false;
  }
  
  takeHit() {
    this.hitFlashTimer = 0.2; // durasi flash putih lebih lama
  }
  
  attack() {
    if (this.cooldown > 0 || this.attackTimer > 0) return false;
    this.attackTimer = 0.3;
    this.cooldown = 0.5;
    sfx.punch();
    return true;
  }
  
  jump() {
    if (!this.onGround) return;
    this.velocityY = 12;
    this.onGround = false;
    sfx.jump();
  }
  
  reset() {
    this.x = this.startX;
    this.y = this.baseY;
    this.velocityY = 0;
    this.onGround = true;
    this.attackTimer = 0;
    this.cooldown = 0;
    this.blocking = false;
  }
  
  getHitbox() {
    return { x: this.x - 0.6, y: this.y - 0.5, width: 1.2, height: 3 };
  }
  
  getAttackBox() {
    const offsetX = this.facingRight ? 0.8 : -1.8;
    return { x: this.x + offsetX, y: this.y, width: 1, height: 2 };
  }
}

function boxCollision(box1, box2) {
  return box1.x < box2.x + box2.width &&
         box1.x + box1.width > box2.x &&
         box1.y < box2.y + box2.height &&
         box1.y + box1.height > box2.y;
}

const gameState = {
  status: 'menu',
  hp: [100, 100],
  maxHp: 100,
  timer: 99,
  round: 1,
  roundWins: [0, 0],
  timerEl: document.getElementById('timer-display'),
  hpEls: [document.getElementById('hp1'), document.getElementById('hp2')],
  scoreEls: [document.getElementById('score1'), document.getElementById('score2')],
  messageEl: document.getElementById('message'),
  hudEl: document.getElementById('hud'),
  menuEl: document.getElementById('menu')
};

const loadingEl = document.getElementById('loading-screen');
const backMenuBtn = document.getElementById('back-menu-btn');

const preFightEl = document.getElementById('pre-fight');
const mapPaths = ['./map/latar.jpg', './map/latar2.png', './map/latar3.png', './map/latar4.png', './map/latar5.png'];
let dynamicMapEl = null;

function showMapSelection() {
  if (dynamicMapEl) {
    dynamicMapEl.style.display = 'flex';
    return;
  }
  const el = document.createElement('div');
  el.id = 'map-selection-dyn';
  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.background = 'rgba(8,6,14,0.85)';
  el.style.backdropFilter = 'blur(6px)';
  el.style.zIndex = '2147483646';
  el.innerHTML = `
    <div style="background:rgba(0,0,0,0.5); padding:20px 22px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 30px 60px rgba(0,0,0,0.75); max-width:880px; width:90%;">
      <h2 style="margin:0 0 12px; letter-spacing:2px; text-align:center;">PILIH ARENA</h2>
      <div id="map-grid-dyn" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:14px;">
      </div>
      <p style="margin:12px 0 0; text-align:center; opacity:0.85;">Klik gambar untuk memilih arena dan mulai.</p>
    </div>
  `;
  document.body.appendChild(el);
  const grid = el.querySelector('#map-grid-dyn');
  mapPaths.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'map-choice';
    btn.setAttribute('data-index', (i + 1).toString());
    btn.style.padding = '0'; btn.style.border = 'none'; btn.style.background = 'none'; btn.style.cursor = 'pointer'; btn.style.borderRadius = '10px'; btn.style.overflow = 'hidden'; btn.style.border = '2px solid rgba(255,255,255,0.15)';
    const img = document.createElement('img');
    img.src = p;
    img.alt = 'Arena ' + (i + 1);
    img.style.width = '100%'; img.style.height = '120px'; img.style.objectFit = 'cover'; img.style.display = 'block';
    btn.appendChild(img);
    btn.addEventListener('click', (e) => { e.stopPropagation(); chooseMap(i + 1); });
    grid.appendChild(btn);
  });
  dynamicMapEl = el;
}

function hideMapSelection() {
  if (dynamicMapEl) {
    try { dynamicMapEl.remove(); } catch (e) { try { dynamicMapEl.parentNode && dynamicMapEl.parentNode.removeChild(dynamicMapEl); } catch(e){} }
    dynamicMapEl = null;
  }
}

function chooseMap(idx) {
  if (idx < 1 || idx > mapPaths.length) return;
  selectedMap = mapPaths[idx - 1];
  loadBackground(selectedMap);
  
  // [NEW] Load Ornamen & Lighting berdasarkan map
  loadMapDecorations(idx);

  // Close character selection immediately to avoid it showing during pre-fight
  closeCharacterSelectionUI();
  hideMapSelection();
  if (preFightEl) {
    preFightEl.style.display = 'flex';
    setTimeout(() => {
      preFightEl.style.display = 'none';
      startMatch();
    }, 3000);
  } else {
    startMatch();
  }
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Character/frame helper and selection state
const characterOptions = ['bagong', 'gareng', 'petruk', 'semar'];
const selectedCharacters = ['bagong', 'bagong']; // [player1, player2]
// Short cultural/story info shown in selection panel
const characterInfos = {
  bagong: {
    display: 'Bagong',
    title: 'Punokawan — Pelawak Bijak',
    desc: 'Bagong adalah salah satu punokawan dalam wayang yang dikenal jenaka namun bicara kebijaksanaan. Ia sering memberi komentar lucu untuk mencerahkan suasana dan bertindak sebagai penengah antar tokoh.',
  },
  gareng: {
    display: 'Gareng',
    title: 'Punokawan — Setia dan Kocak',
    desc: 'Gareng punya ciri khas fisik unik dan sering menjadi sumber humor. Meskipun jenaka, ia setia kepada kebaikan dan sering membantu tokoh utama dengan cara sederhana.',
  },
  petruk: {
    display: 'Petruk',
    title: 'Punokawan — Cerdik dan Santai',
    desc: 'Petruk terkenal dengan hidung panjangnya dan cerdas dalam berbicara. Ia kerap menggunakan sindiran halus dan trik untuk menyelesaikan masalah dalam cerita wayang.',
  },
  semar: {
    display: 'Semar',
    title: 'Punokawan — Rohani & Bijaksana',
    desc: 'Semar adalah tokoh tua yang bijaksana dan berperan sebagai bimbingan moral. Ia sering menasihati para ksatria dan bertindak sebagai suara nurani dalam lakon wayang.',
  }
};
// Pre-scanned frames index (auto-detected from project files)
const framesIndex = {
  bagong: {
    idle: [
      './textures/bagong/idle/idle 1.png',
      './textures/bagong/idle/idle 2.png',
      './textures/bagong/idle/idle 3.png',
      './textures/bagong/idle/idle 4.png'
    ],
    punch: [
      './textures/bagong/punch/punch 1.png',
      './textures/bagong/punch/punch 2.png'
    ],
    walk: [
      './textures/bagong/walk/walk 1.png',
      './textures/bagong/walk/walk 2.png',
      './textures/bagong/walk/walk 3.png',
      './textures/bagong/walk/walk 4.png',
      './textures/bagong/walk/walk 5.png',
      './textures/bagong/walk/walk 6.png'
    ]
  },
  gareng: {
    idle: [
      './textures/gareng/idle/grng idle 1.png',
      './textures/gareng/idle/grng idle 2.png',
      './textures/gareng/idle/grng idle 3.png',
      './textures/gareng/idle/grng idle 4.png',
      './textures/gareng/idle/grng idle 5.png'
    ],
    punch: ['./textures/gareng/punch/grng punch.png'],
    walk: [
      './textures/gareng/walk/grng walk 1.png',
      './textures/gareng/walk/grng walk 2.png',
      './textures/gareng/walk/grng walk 3.png',
      './textures/gareng/walk/grng walk 4.png',
      './textures/gareng/walk/grng walk 5.png'
    ]
  },
  petruk: {
    idle: [
      './textures/petruk/idle/petrul idle 1.png',
      './textures/petruk/idle/petrul idle 2.png',
      './textures/petruk/idle/petrul idle 3.png',
      './textures/petruk/idle/petrul idle 4.png'
    ],
    punch: ['./textures/petruk/punch/petruk punch.png'],
    walk: [
      './textures/petruk/walk/petruk walk 1.png',
      './textures/petruk/walk/petruk walk 2.png',
      './textures/petruk/walk/petruk walk 3.png',
      './textures/petruk/walk/petruk walk 4.png',
      './textures/petruk/walk/petruk walk 5.png'
    ]
  },
  semar: {
    idle: [
      './textures/semar/idle/semar idle 1.png',
      './textures/semar/idle/semar idle 2.png',
      './textures/semar/idle/semar idle 3.png',
      './textures/semar/idle/semar idle 4.png'
    ],
    punch: ['./textures/semar/punch/semar punch.png'],
    walk: [
      './textures/semar/walk/semar walk 1.png',
      './textures/semar/walk/semar walk 2.png',
      './textures/semar/walk/semar walk 3.png',
      './textures/semar/walk/semar walk 4.png',
      './textures/semar/walk/semar walk 5.png',
      './textures/semar/walk/semar walk 6.png'
    ]
  }
};

function getFramesFor(name) {
  if (framesIndex[name]) return framesIndex[name];
  // fallback: try the generic pattern
  const idle = [];
  for (let i = 1; i <= 4; i++) idle.push(`./textures/${name}/idle/idle ${i}.png`);
  const punch = [`./textures/${name}/punch/punch 1.png`, `./textures/${name}/punch/punch 2.png`];
  const walk = [];
  for (let i = 1; i <= 6; i++) walk.push(`./textures/${name}/walk/walk ${i}.png`);
  return { idle, punch, walk };
}

// Preload thumbnail images (first idle frame) and show small overlay while loading
const thumbnailsCache = {};
let thumbnailsLoaded = false;
// icon availability cache (per-character icon.png)
const iconsAvailable = {};

function iconPathFor(name) {
  return `./textures/${name}/${name} icon.png`;
}

function preloadIcons() {
  const names = Object.keys(framesIndex);
  names.forEach((name) => {
    const img = new Image();
    img.onload = () => { iconsAvailable[name] = true; };
    img.onerror = () => { iconsAvailable[name] = false; };
    img.src = iconPathFor(name);
  });
}

function showThumbnailLoader() {
  if (document.getElementById('thumb-loader')) return;
  const el = document.createElement('div');
  el.id = 'thumb-loader';
  el.className = 'thumb-loader';
  el.innerHTML = `<div class="card"><div class="spinner"></div><div class="text">MEMUAT KARAKTER...</div></div>`;
  document.body.appendChild(el);
}

function hideThumbnailLoader() {
  const el = document.getElementById('thumb-loader');
  if (el) el.remove();
}

function preloadThumbnails() {
  if (thumbnailsLoaded) return Promise.resolve(thumbnailsCache);
  showThumbnailLoader();
  const names = Object.keys(framesIndex);
  let pending = names.length;
  return new Promise((resolve) => {
    names.forEach((name) => {
      const src = (framesIndex[name] && framesIndex[name].idle && framesIndex[name].idle[0]) || (`./textures/${name}/idle/idle 1.png`);
      const img = new Image();
      img.onload = () => {
        thumbnailsCache[name] = img;
        pending -= 1;
        if (pending <= 0) {
          thumbnailsLoaded = true;
          hideThumbnailLoader();
          resolve(thumbnailsCache);
        }
      };
      img.onerror = () => {
        // create a tiny placeholder canvas image to avoid repeated 404s
        const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 128;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#222'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#666'; ctx.font = '14px sans-serif'; ctx.fillText(name, 6, 20);
        const dataUrl = canvas.toDataURL();
        const placeholder = new Image(); placeholder.src = dataUrl;
        thumbnailsCache[name] = placeholder;
        pending -= 1;
        if (pending <= 0) {
          thumbnailsLoaded = true;
          hideThumbnailLoader();
          resolve(thumbnailsCache);
        }
      };
      img.src = src;
    });
  });
}

// Start preloading thumbnails immediately so UI is responsive when opened
preloadThumbnails().then(() => {
  // if char-selection already present, update existing thumbs src to cached images
  const p1 = document.getElementById('p1-options');
  const p2 = document.getElementById('p2-options');
  if (p1) Array.from(p1.querySelectorAll('img')).forEach(img => {
    const name = img.alt || img.title;
    if (thumbnailsCache[name]) img.src = thumbnailsCache[name].src;
  });
  if (p2) Array.from(p2.querySelectorAll('img')).forEach(img => {
    const name = img.alt || img.title;
    if (thumbnailsCache[name]) img.src = thumbnailsCache[name].src;
  });
  // enable start button when thumbnails ready
  const startBtnEl = document.getElementById('start-btn');
  if (startBtnEl) {
    startBtnEl.disabled = false;
    startBtnEl.textContent = 'MULAI PERTARUNGAN';
  }
  updateHUDCharacters();
  // Ensure correct music for initial state (menu)
  updateMusicForState();
});

// also try to preload icon.png availability for each character
preloadIcons();

// Fallback: if thumbnails preload somehow hangs or start button remains disabled,
// enable Start after a short timeout so the user can proceed and report asset issues.
let startUnlocked = false;
setTimeout(() => {
  try {
    const startBtnEl = document.getElementById('start-btn');
    if (startBtnEl && startBtnEl.disabled) {
      startBtnEl.disabled = false;
      startBtnEl.textContent = 'MULAI PERTARUNGAN';
    }
    // allow global click to start even if UI still shows loading
    startUnlocked = true;
    console.warn('[UI] start fallback unlocked');
  } catch (e) { /* ignore */ }
}, 6000);

// Fighters will be created when a round starts (after character selection)
let fighters = [];
let fighter1 = null;
let fighter2 = null;

// ---------- Character selection UI & flow ----------
function createCharacterSelectionUI() {
  // Populate or create the character selection UI.
  let el = document.getElementById('char-selection');
  let created = false;
    if (!el) { 
    created = true;
    el = document.createElement('div');
    el.id = 'char-selection';
    el.className = '';
    el.innerHTML = `
      <div class="panel">
        <div class="char-info left" aria-hidden="true"></div>

        <div style="min-width:240px" class="p1-col">
          <h3>Player 1</h3>
          <div id="p1-options" class="choices"></div>
        </div>

        <div class="actions">
          <button id="char-confirm">Confirm</button>
          <button id="char-cancel">Cancel</button>
        </div>

        <div style="min-width:240px" class="p2-col">
          <h3>Player 2</h3>
          <div id="p2-options" class="choices"></div>
        </div>

        <div class="char-info right" aria-hidden="true"></div>
      </div>
    `;
    document.body.appendChild(el);
  }

  const p1Options = el.querySelector('#p1-options') || (function(){ const d = document.createElement('div'); d.id='p1-options'; d.className='choices'; el.querySelector('.panel').prepend(d); return d; })();
  const p2Options = el.querySelector('#p2-options') || (function(){ const d = document.createElement('div'); d.id='p2-options'; d.className='choices'; el.querySelector('.panel').children[1].appendChild(d); return d; })();

  // populate thumbnails only if empty
  if (p1Options.children.length === 0 && p2Options.children.length === 0) {
    function makeOption(name, playerIndex) {
      const wrapper = document.createElement('div');
      wrapper.className = 'char-option';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '6px';

      const img = document.createElement('img');
      img.src = (framesIndex[name] && framesIndex[name].idle && framesIndex[name].idle[0]) || getFramesFor(name).idle[0];
      img.alt = name;
      img.title = name;
      img.className = 'char-thumb';
      img.dataset.char = name;

      const label = document.createElement('div');
      label.className = 'char-name';
      label.textContent = (characterInfos[name] && characterInfos[name].display) ? characterInfos[name].display : name;
      label.style.fontSize = '13px';
      label.style.letterSpacing = '1px';
      label.style.color = 'rgba(255,255,255,0.9)';

      wrapper.appendChild(img);
      wrapper.appendChild(label);

      // click: select and update HUD/selection
      img.addEventListener('click', () => {
        selectedCharacters[playerIndex] = name;
        const container = playerIndex === 0 ? p1Options : p2Options;
        Array.from(container.querySelectorAll('img')).forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        // update info panel to show story for selected character
        const info = el.querySelector('.char-info');
        if (info) updateCharacterInfo(info, name);
      });

      // hover: preview info (update left or right based on playerIndex)
      img.addEventListener('mouseenter', () => {
        const info = el.querySelector(playerIndex === 0 ? '.char-info.left' : '.char-info.right');
        if (info) updateCharacterInfo(info, name);
      });
      img.addEventListener('mouseleave', () => {
        const info = el.querySelector(playerIndex === 0 ? '.char-info.left' : '.char-info.right');
        if (info) {
          const current = selectedCharacters[playerIndex] || null;
          if (current) updateCharacterInfo(info, current);
        }
      });

      return wrapper;
    }

    characterOptions.forEach((name) => {
      p1Options.appendChild(makeOption(name, 0));
      p2Options.appendChild(makeOption(name, 1));
    });

    // default highlight
    const p1Imgs = p1Options.querySelectorAll('img');
    const p2Imgs = p2Options.querySelectorAll('img');
    if (p1Imgs[0]) p1Imgs[0].classList.add('selected');
    if (p2Imgs[0]) p2Imgs[0].classList.add('selected');
  }

  // Add or ensure info panels on both sides to show story/details
  let infoLeft = el.querySelector('.char-info.left');
  let infoRight = el.querySelector('.char-info.right');
  function makeInfoContent(panelEl) {
    panelEl.innerHTML = `
      <div class="char-info-inner">
        <img class="char-info-img" src="" alt="portrait" />
        <div class="char-info-text">
          <div class="char-info-name"></div>
          <div class="char-info-title"></div>
          <p class="char-info-desc"></p>
        </div>
      </div>
    `;
  }
  if (infoLeft) makeInfoContent(infoLeft);
  if (infoRight) makeInfoContent(infoRight);

  function updateCharacterInfo(panelEl, name) {
    const info = characterInfos[name] || { display: name, title: '', desc: '' };
    const imgEl = panelEl.querySelector('.char-info-img');
    const nameEl = panelEl.querySelector('.char-info-name');
    const titleEl = panelEl.querySelector('.char-info-title');
    const descEl = panelEl.querySelector('.char-info-desc');
    if (imgEl) {
      if (iconsAvailable[name]) imgEl.src = iconPathFor(name);
      else if (thumbnailsCache[name]) imgEl.src = thumbnailsCache[name].src;
      else if (framesIndex[name] && framesIndex[name].idle && framesIndex[name].idle[0]) imgEl.src = framesIndex[name].idle[0];
      else imgEl.src = '';
    }
    if (nameEl) nameEl.textContent = info.display || name;
    if (titleEl) titleEl.textContent = info.title || '';
    if (descEl) descEl.textContent = info.desc || '';
  }

  // Initialize both info panels with current selections
  try { if (infoLeft) updateCharacterInfo(infoLeft, selectedCharacters[0] || characterOptions[0]); } catch (e) {}
  try { if (infoRight) updateCharacterInfo(infoRight, selectedCharacters[1] || characterOptions[0]); } catch (e) {}

  // wire buttons (only add listeners once)
  if (!el.dataset.wired) {
    const confirmBtn = el.querySelector('#char-confirm');
    const cancelBtn = el.querySelector('#char-cancel');
    
    if (confirmBtn) confirmBtn.addEventListener('click', () => { 
        // Hide/remove the character selection first to avoid stacking/z-index races
        const cs = document.getElementById('char-selection');
        if (cs) {
          try { cs.remove(); } catch (e) { try { cs.parentNode && cs.parentNode.removeChild(cs); } catch(e){} }
        }

        // If opened from pause, apply changes and go back to paused flow
        if (gameState.status === 'paused') {
          applyCharacterChangeDuringPause();
          // Re-show pause menu so user can continue (ensure state consistency)
          try { showPauseMenu(); } catch (e) {}
        } else {
          // For normal flow, show dynamic map selection
          try { showMapSelection(); } catch (err) { console.warn('[UI] showMapSelection failed', err); }
        }
        }
    );
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      // Close selection. If opened from pause, re-open pause menu; otherwise return to main menu.
      closeCharacterSelectionUI();
      if (gameState.status === 'paused') {
        try { showPauseMenu(); } catch (e) {}
      } else {
        // Use returnToMenu() to ensure full menu state reset and music update.
        try { returnToMenu(); } catch (e) {
          if (gameState.menuEl) gameState.menuEl.style.display = 'block';
        }
      }
    });
    el.dataset.wired = '1';
  }
}

function updateHUDCharacters() {
  const p1Thumb = document.getElementById('p1-thumb');
  const p2Thumb = document.getElementById('p2-thumb');
  const name1 = selectedCharacters[0] || 'bagong';
  const name2 = selectedCharacters[1] || 'bagong';
  if (p1Thumb) {
    // prefer icon if available, fall back to thumbnail or first idle frame
    if (iconsAvailable[name1]) p1Thumb.src = iconPathFor(name1);
    else if (thumbnailsCache[name1]) p1Thumb.src = thumbnailsCache[name1].src;
    else if (framesIndex[name1] && framesIndex[name1].idle && framesIndex[name1].idle[0]) p1Thumb.src = framesIndex[name1].idle[0];
  }
  if (p2Thumb) {
    if (iconsAvailable[name2]) p2Thumb.src = iconPathFor(name2);
    else if (thumbnailsCache[name2]) p2Thumb.src = thumbnailsCache[name2].src;
    else if (framesIndex[name2] && framesIndex[name2].idle && framesIndex[name2].idle[0]) p2Thumb.src = framesIndex[name2].idle[0];
  }
}

function applyCharacterChangeDuringPause() {
  // Replace fighter sprites but preserve game state (hp, timer, round)
  if (!fighter1 && !fighter2) return;

  const prev1 = fighter1 ? { x: fighter1.x, y: fighter1.y, facingRight: fighter1.facingRight } : { x: -3, y: -3, facingRight: true };
  const prev2 = fighter2 ? { x: fighter2.x, y: fighter2.y, facingRight: fighter2.facingRight } : { x: 3, y: -3, facingRight: false };

  // Remove old meshes
  try { if (fighter1 && fighter1.mesh) scene.remove(fighter1.mesh); } catch (e) {}
  try { if (fighter2 && fighter2.mesh) scene.remove(fighter2.mesh); } catch (e) {}

  // Create new fighter instances using selectedCharacters
  const p1Frames = getFramesFor(selectedCharacters[0]);
  const p2Frames = getFramesFor(selectedCharacters[1]);
  fighter1 = new Fighter2D(p1Frames.idle, p1Frames.punch, p1Frames.walk, prev1.x, prev1.facingRight, 0);
  fighter2 = new Fighter2D(p2Frames.idle, p2Frames.punch, p2Frames.walk, prev2.x, prev2.facingRight, 1);
  fighter1.x = prev1.x; fighter1.y = prev1.y; fighter1.facingRight = prev1.facingRight;
  fighter2.x = prev2.x; fighter2.y = prev2.y; fighter2.facingRight = prev2.facingRight;
  fighters = [fighter1, fighter2];
  updateHUDCharacters();
}

function openCharacterSelectionUI() {
  createCharacterSelectionUI();
  const el = document.getElementById('char-selection');
  if (el) {
    el.classList.remove('overlay-hidden');
    el.style.display = 'flex';
  }
}

function closeCharacterSelectionUI() {
  // Remove any duplicate char-selection nodes to be robust
  const els = Array.from(document.querySelectorAll('#char-selection'));
  els.forEach((node) => {
    try { node.remove(); } catch (e) { try { node.parentNode && node.parentNode.removeChild(node); } catch(e){} }
  });
}

// ---------- Pause menu ----------
function showPauseMenu() {
  let el = document.getElementById('pause-menu');
  if (el) {
    el.style.display = 'flex';
    if (!el.dataset.wired) {
      el.querySelector('#pause-continue')?.addEventListener('click', () => { hidePauseMenu(); });
      el.querySelector('#pause-select')?.addEventListener('click', () => { hidePauseMenu(); openCharacterSelectionUI(); });
      el.querySelector('#pause-exit')?.addEventListener('click', () => { hidePauseMenu(); returnToMenu(); try { window.location.href = './index.html'; } catch(e){} });
      el.dataset.wired = '1';
    }
    return;
  }
  // fallback: create dynamically if not present
  const created = document.createElement('div');
  created.id = 'pause-menu';
  created.className = 'overlay-center';
  created.innerHTML = `
    <div class="overlay-card">
      <h2>PAUSED</h2>
      <button id="pause-continue">Continue</button>
      <button id="pause-select">Select Character</button>
      <button id="pause-exit">Exit to Main Menu</button>
    </div>
  `;
  document.body.appendChild(created);
  created.querySelector('#pause-continue')?.addEventListener('click', () => { hidePauseMenu(); });
  created.querySelector('#pause-select')?.addEventListener('click', () => { hidePauseMenu(); openCharacterSelectionUI(); });
  created.querySelector('#pause-exit')?.addEventListener('click', () => { hidePauseMenu(); returnToMenu(); try { window.location.href = './index.html'; } catch(e){} });
  try { updateMusicForState(); } catch (e) {}
}

function hidePauseMenu() {
  const el = document.getElementById('pause-menu');
  if (el) el.style.display = 'none';
  try { updateMusicForState(); } catch (e) {}
}

// ---------- Home menu ----------
function showHomeMenu() {
  // Pause game jika sedang fight
  if (gameState.status === 'fight') {
    gameState.prevStatus = gameState.status;
    gameState.status = 'paused';
  }
  
  let el = document.getElementById('home-menu');
  if (el) {
    el.style.display = 'flex';
    if (!el.dataset.wired) {
      el.querySelector('#home-rematch')?.addEventListener('click', () => { hideHomeMenu(); rematchGame(); });
      el.querySelector('#home-quit')?.addEventListener('click', () => { hideHomeMenu(); returnToMenu(); try { window.location.href = './index.html'; } catch(e){} });
      el.querySelector('#home-cancel')?.addEventListener('click', () => { hideHomeMenu(); });
      el.dataset.wired = '1';
    }
    return;
  }
}

function hideHomeMenu() {
  const el = document.getElementById('home-menu');
  if (el) el.style.display = 'none';
  // Resume game
  if (gameState.status === 'paused' && gameState.prevStatus) {
    gameState.status = gameState.prevStatus;
  }
}

function rematchGame() {
  // Reset game state untuk rematch
  gameState.round = 1;
  gameState.roundWins = [0, 0];
  gameState.hp = [100, 100];
  gameState.timer = 99;
  
  // Update score display
  if (gameState.scoreEls[0]) gameState.scoreEls[0].textContent = '☆☆';
  if (gameState.scoreEls[1]) gameState.scoreEls[1].textContent = '☆☆';
  
  // Start new match
  startMatch();
}

// Setup home button
const homeBtn = document.getElementById('ingame-home-btn');
if (homeBtn) {
  homeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState.status === 'fight' || gameState.status === 'paused') {
      showHomeMenu();
    }
  });
}

// ---------- End-match menu ----------
function showEndMenu(winnerText) {
  let el = document.getElementById('end-menu');
  if (el) {
    const h = el.querySelector('#end-winner');
    if (h) h.textContent = winnerText;
    el.style.display = 'flex';
    if (!el.dataset.wired) {
      el.querySelector('#end-restart')?.addEventListener('click', () => { el.style.display='none'; startMatch(); });
      el.querySelector('#end-restart-change')?.addEventListener('click', () => { el.style.display='none'; openCharacterSelectionUI(); });
      el.querySelector('#end-exit')?.addEventListener('click', () => { el.style.display='none'; returnToMenu(); try { window.location.href = './index.html'; } catch(e){} });
      el.dataset.wired = '1';
    }
    return;
  }
  // fallback: create dynamically
  const created = document.createElement('div');
  created.id = 'end-menu';
  created.className = 'overlay-center';
  created.innerHTML = `
    <div class="overlay-card">
      <h2>${winnerText}</h2>
      <div style="display:flex;gap:8px;">
        <button id="end-restart">Restart</button>
        <button id="end-restart-change">Restart (Change Characters)</button>
        <button id="end-exit">Exit to Menu</button>
      </div>
    </div>
  `;
  document.body.appendChild(created);
  created.querySelector('#end-restart')?.addEventListener('click', () => { created.remove(); startMatch(); });
  created.querySelector('#end-restart-change')?.addEventListener('click', () => { created.remove(); openCharacterSelectionUI(); });
  created.querySelector('#end-exit')?.addEventListener('click', () => { created.remove(); returnToMenu(); try { window.location.href = './index.html'; } catch(e){} });
}

function hideEndMenu() { const el = document.getElementById('end-menu'); if (el) el.style.display = 'none'; }

let loadingReady = false;
setTimeout(() => {
  loadingReady = true;
  const txtEl = document.getElementById('loading-text');
  if (txtEl) txtEl.textContent = '';
}, 1000);

// Hilangkan start dengan klik: untuk mulai wajib ENTER
window.addEventListener('click', () => { /* no-op */ });

// Make loading-screen act as a decorative start background (click-through)
if (loadingEl) {
  // ensure background visible behind menu
  loadingEl.classList.remove('hidden');
  loadingEl.classList.add('start-bg');
}

// Put the page in minimal start-screen mode by default: show only background and hint
try { document.body.classList.add('start-minimal'); } catch (e) {}

// Click tooltip helper (transient)
function showClickTooltip(text = 'Memuat...', ms = 1100) {
  let tip = document.getElementById('click-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'click-tooltip';
    tip.className = 'click-tooltip';
    document.body.appendChild(tip);
  }
  tip.textContent = text;
  tip.classList.add('visible');
  // reset hide timer
  if (tip._hideTimer) clearTimeout(tip._hideTimer);
  tip._hideTimer = setTimeout(() => {
    tip.classList.remove('visible');
    tip._hideTimer = null;
  }, ms);
}

// Sembunyikan tombol Mulai Pertarungan jika ada
(function(){
  const startBtn = document.getElementById('start-btn');
  if (startBtn) { try { startBtn.style.display = 'none'; } catch(e){} }
})();

// Sound toggle (Wayang-themed mute/unmute)
const soundToggle = document.getElementById('sound-toggle');
let audioMuted = false;
if (soundToggle) {
  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    audioMuted = !audioMuted;
    try {
      if (audioMuted) {
        stopMusic(menuMusic); stopMusic(fightMusic);
        soundToggle.textContent = '🔇';
      } else {
        // resume appropriate music for current state
        updateMusicForState();
        soundToggle.textContent = '🔊';
      }
    } catch (e) {}
  });
}

const sparks = [];
function spawnSpark(x, y) {
  const geo = new THREE.CircleGeometry(0.15, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 1);
  scene.add(mesh);
  sparks.push({ mesh, life: 0.25 });
}

function updateSparks(delta) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life -= delta;
    s.mesh.scale.multiplyScalar(1 + delta * 5);
    s.mesh.material.opacity = Math.max(0, s.life / 0.25);
    if (s.life <= 0) {
      scene.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
      sparks.splice(i, 1);
    }
  }
}

function startMatch() {
  gameState.roundWins = [0, 0];
  gameState.round = 1;
  // Ensure any overlays from selection flow are removed
  closeCharacterSelectionUI();
  hideMapSelection();
  if (loadingEl) { try { loadingEl.classList.add('hidden'); loadingEl.style.display = 'none'; } catch(e){} }
  if (gameState.menuEl) gameState.menuEl.style.display = 'none';
  if (gameState.hudEl) gameState.hudEl.style.display = 'block';
  if (backMenuBtn) backMenuBtn.style.display = 'none';
  updateScoreDisplay();
  startRound();
}

function startRound() {
  // Cleanup existing fighters if they exist
  if (fighter1) {
    try { scene.remove(fighter1.mesh); } catch (e) {}
  }
  if (fighter2) {
    try { scene.remove(fighter2.mesh); } catch (e) {}
  }

  // Make sure selection UI and other overlays are fully removed before fight starts
  closeCharacterSelectionUI();
  hideMapSelection();
  if (loadingEl) { try { loadingEl.classList.add('hidden'); loadingEl.style.display = 'none'; } catch(e){} }

  // Create new fighters based on selected characters
  const p1Frames = getFramesFor(selectedCharacters[0]);
  const p2Frames = getFramesFor(selectedCharacters[1]);
  fighter1 = new Fighter2D(p1Frames.idle, p1Frames.punch, p1Frames.walk, -3, true, 0);
  fighter2 = new Fighter2D(p2Frames.idle, p2Frames.punch, p2Frames.walk, 3, false, 1);
  fighters = [fighter1, fighter2];

  // If icon.png exists for a character, use it as a simplified in-fight portrait sprite
  try {
    if (iconsAvailable[selectedCharacters[0]]) {
      const tex = new THREE.TextureLoader().load(iconPathFor(selectedCharacters[0]));
      fighter1.mesh.material.map = tex;
      fighter1.mesh.material.needsUpdate = true;
      // adjust sprite size for icon (make smaller and square-ish)
      fighter1.mesh.scale.set(1.2, 1.2, 1);
    }
  } catch (e) {}
  try {
    if (iconsAvailable[selectedCharacters[1]]) {
      const tex = new THREE.TextureLoader().load(iconPathFor(selectedCharacters[1]));
      fighter2.mesh.material.map = tex;
      fighter2.mesh.material.needsUpdate = true;
      fighter2.mesh.scale.set(1.2, 1.2, 1);
    }
  } catch (e) {}

  // Update HUD portraits to reflect selected characters
  updateHUDCharacters();

  gameState.status = 'fight';
  // switch to fight music
  try { updateMusicForState(); } catch (e) {}
  gameState.hp = [100, 100];
  gameState.timer = 99;
  fighter1.x = -3;
  fighter1.facingRight = true;
  fighter2.x = 3;
  fighter2.facingRight = false;
  updateHPBars();
  showMessage('RONDE ' + gameState.round);
  setTimeout(() => hideMessage(), 1300);
}

function hideMessage() {
  if (gameState.messageEl) gameState.messageEl.style.display = 'none';
}

function showMessage(text) {
  if (gameState.messageEl) {
    gameState.messageEl.textContent = text;
    gameState.messageEl.style.display = 'block';
  }
}

function updateHPBars() {
  if (gameState.hpEls[0]) gameState.hpEls[0].style.width = ((gameState.hp[0] / gameState.maxHp) * 100) + '%';
  if (gameState.hpEls[1]) gameState.hpEls[1].style.width = ((gameState.hp[1] / gameState.maxHp) * 100) + '%';
}

function updateScoreDisplay() {
  const stars = (wins) => '\u2605'.repeat(wins) + '\u2606'.repeat(2 - wins);
  if (gameState.scoreEls[0]) gameState.scoreEls[0].textContent = stars(gameState.roundWins[0]);
  if (gameState.scoreEls[1]) gameState.scoreEls[1].textContent = stars(gameState.roundWins[1]);
}

function applyDamage(targetIndex, blocking) {
  if (blocking) {
    fighters[targetIndex].blockEffectTimer = 0.25;
    sfx.block();
    return;
  }
  const dmg = 12;
  gameState.hp[targetIndex] = Math.max(0, gameState.hp[targetIndex] - dmg);
  fighters[targetIndex].takeHit(); // trigger efek flash putih
  updateHPBars();
  if (gameState.hp[targetIndex] === 0) {
    resolveWinner(targetIndex === 0 ? 2 : 1);
  }
}

function resolveWinner(forcedWinner) {
  if (gameState.status !== 'fight') return;
  gameState.status = 'ended';
  let winnerText = '';
  let roundWinnerIndex = -1;
  
  if (forcedWinner) {
    roundWinnerIndex = forcedWinner - 1;
    winnerText = 'P' + forcedWinner + ' MENANG RONDE ' + gameState.round + '!';
  } else {
    const diff = gameState.hp[0] - gameState.hp[1];
    if (diff === 0) {
      winnerText = 'SERI RONDE ' + gameState.round + '!';
    } else if (diff > 0) {
      roundWinnerIndex = 0;
      winnerText = 'P1 MENANG RONDE ' + gameState.round + '!';
    } else {
      roundWinnerIndex = 1;
      winnerText = 'P2 MENANG RONDE ' + gameState.round + '!';
    }
  }
  
  if (roundWinnerIndex >= 0) {
    gameState.roundWins[roundWinnerIndex] += 1;
    updateScoreDisplay();
  }
  
  const p1Wins = gameState.roundWins[0];
  const p2Wins = gameState.roundWins[1];
  const matchEnded = p1Wins === 2 || p2Wins === 2;
  
  if (matchEnded) {
    const finalWinner = p1Wins === 2 ? 1 : 2;
    showMessage(winnerText + ' P' + finalWinner + ' MENANG MATCH!');
    gameState.status = 'match-ended';
    sfx.win();
    if (backMenuBtn) backMenuBtn.style.display = 'block';
    // Show end menu overlay
    showEndMenu(winnerText + ' P' + finalWinner + ' MENANG MATCH!');
  } else {
    showMessage(winnerText + ' Tekan ENTER untuk lanjut ke Ronde ' + (gameState.round + 1) + '.');
  }
}

function returnToMenu() {
  gameState.status = 'menu';
  if (gameState.hudEl) gameState.hudEl.style.display = 'none';
  hideMapSelection();
  if (gameState.menuEl) gameState.menuEl.style.display = 'block';
  try { document.body.classList.remove('start-minimal'); } catch (e) {}
  if (backMenuBtn) backMenuBtn.style.display = 'none';
  hidePauseMenu();
  hideEndMenu();
  closeCharacterSelectionUI();
  hideMessage();
  try { updateMusicForState(); } catch (e) {}
}

if (backMenuBtn) {
  backMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); returnToMenu(); });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    // ENTER dari loading: buka pemilihan karakter
    if (loadingReady && loadingEl && loadingEl.style.display !== 'none') {
      loadingEl.classList.add('hidden');
      setTimeout(() => { loadingEl.style.display = 'none'; }, 450);
      try { document.body.classList.remove('start-minimal'); } catch (e) {}
      if (gameState.menuEl) gameState.menuEl.style.display = 'none';
      openCharacterSelectionUI();
      return;
    }
    // ENTER dari menu: buka pemilihan karakter
    if (gameState.status === 'menu') {
      try { document.body.classList.remove('start-minimal'); } catch (e) {}
      if (gameState.menuEl) gameState.menuEl.style.display = 'none';
      openCharacterSelectionUI();
      return;
    }
    // Alur setelah ronde/match
    if (gameState.status === 'match-ended') {
      startMatch();
    } else if (gameState.status === 'ended') {
      gameState.round += 1;
      startRound();
    }
  }
});

// Pause toggle with Escape
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (gameState.status === 'fight') {
      gameState.prevStatus = gameState.status;
      gameState.status = 'paused';
      showPauseMenu();
    } else if (gameState.status === 'paused') {
      gameState.status = gameState.prevStatus || 'fight';
      hidePauseMenu();
    }
  }
});

function update(delta) {
  if (gameState.status !== 'fight') return;
  
  gameState.timer = Math.max(0, gameState.timer - delta);
  if (gameState.timerEl) {
    gameState.timerEl.textContent = Math.floor(gameState.timer).toString().padStart(2, '0');
  }
  
  if (gameState.timer === 0) {
    resolveWinner();
    return;
  }
  
  const speed = 5;
  const bound = 7;
  
  // Fighter 1 controls
  if (keys['KeyA']) {
    fighter1.x -= speed * delta;
    fighter1.isWalking = true;
  }
  if (keys['KeyD']) {
    fighter1.x += speed * delta;
    fighter1.isWalking = true;
  }
  if (keys['KeyW']) fighter1.jump();
  fighter1.blocking = !!keys['KeyS'];
  if (keys['Space']) fighter1.attack();
  
  // Fighter 2 controls
  if (keys['ArrowLeft']) {
    fighter2.x -= speed * delta;
    fighter2.isWalking = true;
  }
  if (keys['ArrowRight']) {
    fighter2.x += speed * delta;
    fighter2.isWalking = true;
  }
  if (keys['ArrowUp']) fighter2.jump();
  fighter2.blocking = !!(keys['ControlLeft'] || keys['ArrowDown']);
  if (keys['Slash']) fighter2.attack();
  
  fighter1.x = THREE.MathUtils.clamp(fighter1.x, -bound, bound);
  fighter2.x = THREE.MathUtils.clamp(fighter2.x, -bound, bound);
  
  fighter1.facingRight = fighter1.x < fighter2.x;
  fighter2.facingRight = fighter2.x < fighter1.x;
  
  fighter1.update(delta);
  fighter2.update(delta);
  
  if (fighter1.attackTimer > 0.15 && fighter1.attackTimer < 0.25) {
    const attackBox = fighter1.getAttackBox();
    const hitbox = fighter2.getHitbox();
    if (boxCollision(attackBox, hitbox)) {
      spawnSpark(fighter2.x, fighter2.y + 1);
      applyDamage(1, fighter2.blocking);
      fighter1.attackTimer = 0.1;
    }
  }
  
  if (fighter2.attackTimer > 0.15 && fighter2.attackTimer < 0.25) {
    const attackBox = fighter2.getAttackBox();
    const hitbox = fighter1.getHitbox();
    if (boxCollision(attackBox, hitbox)) {
      spawnSpark(fighter1.x, fighter1.y + 1);
      applyDamage(0, fighter1.blocking);
      fighter2.attackTimer = 0.1;
    }
  }
}

// ==========================================
// 5. ANIMASI LIGHTING (Masukan ke tick)
// ==========================================

function updateLighting(delta) {
  // Hanya nyalakan lampu jika sedang fight atau pause
  if (gameState.status === 'fight' || gameState.status === 'paused') {
    // Lerp (Interpolasi linear) agar lampu nyala pelan-pelan
    dirLight.intensity += (targetIntensity - dirLight.intensity) * delta * 2.0;
    ambientLight.intensity += (targetAmbient - ambientLight.intensity) * delta * 2.0;
  } else {
    // Jika di menu, redupkan
    dirLight.intensity += (0 - dirLight.intensity) * delta * 5.0;
    ambientLight.intensity += (0.5 - ambientLight.intensity) * delta * 2.0; // Biar menu tetep kelihatan
  }
}

const clock = new THREE.Clock();
function tick() {
  const delta = clock.getDelta();
  update(delta);
  updateSparks(delta);
  
  // [NEW] Update lighting animation
  updateLighting(delta);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

window.addEventListener('resize', () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.left = -viewHeight * newAspect / 2;
  camera.right = viewHeight * newAspect / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});