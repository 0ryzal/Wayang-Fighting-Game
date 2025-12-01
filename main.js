import * as THREE from 'three';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

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

const listener = new THREE.AudioListener();
camera.add(listener);

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

let selectedMap = './latar.jpg';
const backgroundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20 * aspect, 20),
  new THREE.MeshBasicMaterial({ color: 0x222222 })
);
backgroundMesh.position.z = -5;
scene.add(backgroundMesh);

function loadBackground(path) {
  new THREE.TextureLoader().load(path, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    backgroundMesh.material.map = tex;
    backgroundMesh.material.needsUpdate = true;
  });
}
loadBackground(selectedMap);

const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 0.5),
  new THREE.MeshBasicMaterial({ color: 0x3a2a1a })
);
floorMesh.position.y = -4;
floorMesh.position.z = -1;
scene.add(floorMesh);

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

const mapButtons = [1, 2, 3, 4, 5].map(i => document.getElementById('map' + i));
const mapPaths = ['./latar.jpg', './latar2.jpg', './latar3.jpg', './latar4.jpg', './latar5.jpg'];

function setActiveMap(idx) {
  if (idx < 1 || idx > mapPaths.length) return;
  selectedMap = mapPaths[idx - 1];
  mapButtons.forEach((btn, i) => { if (btn) btn.classList.toggle('active', i === idx - 1); });
  loadBackground(selectedMap);
}

mapButtons.forEach((btn, i) => {
  if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); setActiveMap(i + 1); });
});

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Idle animation frames
const idleFrames = [
  './textures/semar/idle/idle 1.png',
  './textures/semar/idle/idle 2.png',
  './textures/semar/idle/idle 3.png',
  './textures/semar/idle/idle 4.png'
];

// Punch animation frames
const punchFrames = [
  './textures/semar/punch/punch 1.png',
  './textures/semar/punch/punch 2.png'
];

// Walk animation frames
const walkFrames = [
  './textures/semar/walk/walk 1.png',
  './textures/semar/walk/walk 2.png',
  './textures/semar/walk/walk 3.png',
  './textures/semar/walk/walk 4.png',
  './textures/semar/walk/walk 5.png',
  './textures/semar/walk/walk 6.png'
];

const fighter1 = new Fighter2D(idleFrames, punchFrames, walkFrames, -3, true, 0);
const fighter2 = new Fighter2D(idleFrames, punchFrames, walkFrames, 3, false, 1);
const fighters = [fighter1, fighter2];

let loadingReady = false;
setTimeout(() => {
  loadingReady = true;
  const txtEl = document.getElementById('loading-text');
  if (txtEl) txtEl.textContent = '';
}, 1000);

window.addEventListener('click', () => {
  if (loadingReady && loadingEl && loadingEl.style.display !== 'none') {
    loadingEl.classList.add('hidden');
    setTimeout(() => { loadingEl.style.display = 'none'; }, 450);
    startMatch();
  }
});

const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.disabled = false;
  startBtn.textContent = 'MULAI PERTARUNGAN';
  startBtn.addEventListener('click', () => startMatch());
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
  if (gameState.menuEl) gameState.menuEl.style.display = 'none';
  if (gameState.hudEl) gameState.hudEl.style.display = 'block';
  if (backMenuBtn) backMenuBtn.style.display = 'none';
  updateScoreDisplay();
  startRound();
}

function startRound() {
  gameState.status = 'fight';
  gameState.hp = [100, 100];
  gameState.timer = 99;
  fighter1.reset();
  fighter1.x = -3;
  fighter1.facingRight = true;
  fighter2.reset();
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
    showMessage(winnerText + ' P' + finalWinner + ' MENANG MATCH! Tekan ENTER untuk mulai lagi.');
    gameState.status = 'match-ended';
    sfx.win();
    if (backMenuBtn) backMenuBtn.style.display = 'block';
  } else {
    showMessage(winnerText + ' Tekan ENTER untuk lanjut ke Ronde ' + (gameState.round + 1) + '.');
  }
}

function returnToMenu() {
  gameState.status = 'menu';
  if (gameState.hudEl) gameState.hudEl.style.display = 'none';
  if (loadingEl) {
    loadingEl.style.display = 'flex';
    loadingEl.classList.remove('hidden');
    const txt = document.getElementById('loading-text');
    if (txt) txt.textContent = 'PILIH LATAR & KLIK UNTUK MULAI';
  }
  if (backMenuBtn) backMenuBtn.style.display = 'none';
  hideMessage();
}

if (backMenuBtn) {
  backMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); returnToMenu(); });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    if (gameState.status === 'match-ended') {
      startMatch();
    } else if (gameState.status === 'ended') {
      gameState.round += 1;
      startRound();
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

const clock = new THREE.Clock();
function tick() {
  const delta = clock.getDelta();
  update(delta);
  updateSparks(delta);
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
