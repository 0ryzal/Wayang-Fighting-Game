import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.04);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 4, 13);
scene.add(camera);
// Audio setup (WebAudio via Three.AudioListener)
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
    else if (type === 'triangle') v = 2*Math.asin(Math.sin(phase))/Math.PI;
    else if (type === 'saw') v = 2*(t*freq - Math.floor(0.5 + t*freq));
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

resizeRenderer();

// lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const keyLight = new THREE.DirectionalLight(0xfff6da, 1.2);
keyLight.position.set(8, 12, 6);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x4dabff, 0.8);
rimLight.position.set(-6, 10, -4);
scene.add(rimLight);

// arena floor
const floorTex = new THREE.TextureLoader().load('https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=60');
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(3, 3);
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, metalness: 0.2, roughness: 0.9 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Fullscreen background gunakan scene.background dengan path relatif aman,
// dan fallback ke plane jika gagal memuat.
{
  const loaderTex = new THREE.TextureLoader();
  const bgPath = './latar.jpg';
  loaderTex.load(bgPath, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex; // memenuhi viewport
  }, undefined, () => {
    console.warn('Gagal memuat latar.jpg, menggunakan fallback plane');
    const tex2 = loaderTex.load(bgPath, (t2) => {
      t2.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 30),
        new THREE.MeshBasicMaterial({ map: t2, depthWrite: false })
      );
      plane.position.set(0, 10, -20);
      scene.add(plane);
    });
  });
}

const loader = new GLTFLoader();
const fighters = [];

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
// Klik di mana saja setelah siap untuk langsung masuk arena (skip menu)
let loadingReady = false;
window.addEventListener('click', ()=> {
  if (loadingReady && loadingEl && loadingEl.style.display !== 'none') {
    loadingEl.classList.add('hidden');
    setTimeout(()=>{ loadingEl.style.display='none'; }, 450);
    // Langsung mulai match tanpa menu
    if (fighters.length >= 2) {
      startMatch();
    } else {
      showMessage('Model belum siap, mohon tunggu...');
    }
  }
});

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Debug overlay (toggle dengan F3) membantu memeriksa posisi Y agar tidak tenggelam
const debugEl = document.createElement('div');
debugEl.id = 'debug-overlay';
debugEl.style.cssText = 'position:fixed;left:8px;top:8px;padding:6px 10px;background:rgba(0,0,0,0.55);color:#0ff;font:12px monospace;z-index:9999;border:1px solid #088;display:none;max-width:260px;white-space:pre-line;';
document.body.appendChild(debugEl);
let debugEnabled = false;
window.addEventListener('keydown', (e)=>{
  if (e.code === 'F3') {
    debugEnabled = !debugEnabled;
    debugEl.style.display = debugEnabled ? 'block' : 'none';
  }
});

const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
  if (fighters.length === 0) {
    showMessage('Model wayang belum selesai dimuat. Mohon tunggu beberapa detik.');
    return;
  }
  startMatch();
});

typeText(gameState.messageEl, '');

const modelUrl = new URL('./scene.gltf', window.location.href);

loader.load(
  modelUrl.href,
  (gltf) => {
    const base = gltf.scene;
    base.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        // Gunakan DoubleSide supaya wayang (geometri tipis) tidak hilang saat membalik arah
        if (obj.material) obj.material.side = THREE.DoubleSide;
      }
    });

    const bbox = new THREE.Box3().setFromObject(base);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const scale = 4 / size.y;
    base.scale.setScalar(scale);

    // Setelah scaling, geser seluruh model agar bagian paling bawah tepat di y=0
    bbox.setFromObject(base);
    base.position.y -= bbox.min.y; // sekarang min.y = 0

    // Spawn dua fighter: P1 (kiri) dan P2 (kanan) sama-sama cermin horizontal
    createFighter(base, -6, 0, true);
    createFighter(base, 6, Math.PI, true);

    startBtn.disabled = false;
    startBtn.removeAttribute('disabled');
    startBtn.textContent = 'MULAI PERTARUNGAN';
    hideMessage();
    if (loadingEl) {
      const txtEl = loadingEl.querySelector('#loading-text');
      if (txtEl) txtEl.textContent = 'SIAP - KLIK UNTUK MULAI';
      loadingReady = true;
    }
  },
  undefined,
  (err) => {
    console.error('Gagal memuat scene.gltf', err);
    showMessage('Gagal memuat model wayang. Pastikan file scene.gltf / scene.bin tersedia.');
    startBtn.textContent = 'MUATAN GAGAL';
    if (loadingEl) {
      const txtEl = loadingEl.querySelector('#loading-text');
      if (txtEl) txtEl.textContent = 'GAGAL MEMUAT MODEL';
      loadingReady = false;
    }
  }
);

function createFighter(model, initialX, facing, mirrorX = false) {
  const group = new THREE.Group();
  const mesh = model.clone(true);
  if (mirrorX) {
    mesh.scale.x *= -1; // mirror secara horizontal
    mesh.updateMatrixWorld(true);
  }
  group.add(mesh);
  group.position.set(initialX, 0, 0);
  scene.add(group);

  fighters.push({
    group,
    mesh,
    facing,
    mirrored: mirrorX,
    attackTimer: 0,
    cooldown: 0,
    idlePhase: Math.random() * Math.PI * 2,
    blocking: false,
    baseY: 0,
    airY: 0,
    verticalVelocity: 0,
    onGround: true,
    attackBox: new THREE.Box3(),
    bodyBox: new THREE.Box3()
  });
}

function startMatch() {
  // Reset total match
  gameState.roundWins = [0,0];
  gameState.round = 1;
  gameState.menuEl.style.display = 'none';
  gameState.hudEl.style.display = 'block';
  updateScoreDisplay();
  startRound();
}

function startRound() {
  gameState.status = 'fight';
  gameState.hp = [100, 100];
  gameState.timer = 99;
  fighters.forEach((f, idx) => {
    f.group.position.set(idx === 0 ? -3.5 : 3.5, f.baseY, 0);
    f.group.rotation.y = idx === 0 ? 0 : Math.PI;
    f.attackTimer = 0;
    f.cooldown = 0;
    f.verticalVelocity = 0; // untuk lompat
    f.airY = 0;
    f.onGround = true;
    f.blockEffectTimer = 0;
  });
  updateHPBars();
  showMessage(`RONDE ${gameState.round}`);
  setTimeout(()=> hideMessage(), 1300);
}

function hideMessage() {
  gameState.messageEl.style.display = 'none';
}

function showMessage(text) {
  gameState.messageEl.textContent = text;
  gameState.messageEl.style.display = 'block';
}

function updateHPBars() {
  gameState.hpEls[0].style.width = `${(gameState.hp[0] / gameState.maxHp) * 100}%`;
  gameState.hpEls[1].style.width = `${(gameState.hp[1] / gameState.maxHp) * 100}%`;
}

function update(delta) {
  if (fighters.length < 2) return;

  if (gameState.status === 'fight') {
    gameState.timer = Math.max(0, gameState.timer - delta);
    gameState.timerEl.textContent = Math.floor(gameState.timer).toString().padStart(2, '0');

    if (gameState.timer === 0) {
      resolveWinner();
    }
  }

  updateMovement(delta);
  updateCombat(delta);
  animateFighters(delta);
}

// Spark hit effect system
const sparks = [];
function spawnSpark(position) {
  const geo = new THREE.SphereGeometry(0.06, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true });
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(position);
  scene.add(m);
  sparks.push({ mesh: m, life: 0.22 });
}

function updateSparks(delta) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life -= delta;
    s.mesh.scale.multiplyScalar(1 + delta * 4);
    s.mesh.material.opacity = Math.max(0, s.life / 0.22);
    if (s.life <= 0) {
      scene.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
      sparks.splice(i, 1);
    }
  }
}

const speed = 4;
const attackDuration = 0.28;
const attackCooldown = 0.45;
const attackReach = 1.2;
const gravity = 20;
const jumpVelocity = 18; // jauh lebih tinggi (apex ~8u di atas tanah)

function updateMovement(delta) {
  if (gameState.status !== 'fight') return;

  const moveAmount = speed * delta;
  const p1 = fighters[0];
  const p2 = fighters[1];

  const p1Dir = (keys['KeyD'] && !keys['KeyA']) ? 1 : (keys['KeyA'] && !keys['KeyD']) ? -1 : 0;
  const p2Dir = (keys['ArrowRight'] && !keys['ArrowLeft']) ? 1 : (keys['ArrowLeft'] && !keys['ArrowRight']) ? -1 : 0;

  // P1 move
  if (p1Dir === -1) p1.group.position.x -= moveAmount;
  if (p1Dir === 1) p1.group.position.x += moveAmount;
  // P2 move
  if (p2Dir === -1) p2.group.position.x -= moveAmount;
  if (p2Dir === 1) p2.group.position.x += moveAmount;

  const bound = 8;
  fighters.forEach((f) => {
    f.group.position.x = THREE.MathUtils.clamp(f.group.position.x, -bound, bound);
  });

  // face based on current movement; if idle, face opponent
  if (p1Dir !== 0) {
    p1.group.rotation.y = p1Dir > 0 ? 0 : Math.PI;
  } else {
    p1.group.rotation.y = p1.group.position.x <= p2.group.position.x ? 0 : Math.PI;
  }

  if (p2Dir !== 0) {
    p2.group.rotation.y = p2Dir > 0 ? 0 : Math.PI;
  } else {
    p2.group.rotation.y = p2.group.position.x >= p1.group.position.x ? Math.PI : 0;
  }

  // blocking state
  p1.blocking = !!keys['KeyQ'];
  p2.blocking = !!keys['ControlLeft'] || !!keys['ControlRight'];

  // attacks
  if (keys['KeyE']) triggerAttack(0);
  if (keys['ArrowDown'] || keys['ArrowDown']) triggerAttack(1);

  // Jump input
  if (keys['KeyW'] && p1.onGround) {
    p1.verticalVelocity = jumpVelocity;
    p1.onGround = false;
    sfx.jump();
  }
  if ((keys['ArrowUp']) && p2.onGround) {
    p2.verticalVelocity = jumpVelocity;
    p2.onGround = false;
    sfx.jump();
  }
}

function triggerAttack(index) {
  if (gameState.status !== 'fight') return;
  const fighter = fighters[index];
  if (fighter.cooldown > 0) return;
  fighter.attackTimer = attackDuration;
  fighter.cooldown = attackCooldown;
  sfx.punch();
}

function updateCombat(delta) {
  fighters.forEach((f, idx) => {
    if (f.cooldown > 0) f.cooldown -= delta;
    if (f.attackTimer > 0) f.attackTimer = Math.max(0, f.attackTimer - delta);
    // bodyBox dihitung ulang setelah kemungkinan penyesuaian posisi di animateFighters
    f.bodyBox.setFromObject(f.group);
    const dir = idx === 0 ? 1 : -1;
    const boxCenter = f.group.position.clone();
    boxCenter.x += dir * attackReach;
    f.attackBox.set(
      new THREE.Vector3(boxCenter.x - 0.4, 0, -0.5),
      new THREE.Vector3(boxCenter.x + 0.4, 3.5, 0.5)
    );
  });

  // collision P1 hitting P2
  if (fighters[0].attackTimer > 0 && fighters[0].attackBox.intersectsBox(fighters[1].bodyBox)) {
    // spawn spark at attackBox center
    const center = new THREE.Vector3();
    fighters[1].bodyBox.getCenter(center);
    spawnSpark(center);
    applyDamage(1, fighters[1].blocking);
    fighters[0].attackTimer = 0;
  }

  if (fighters[1].attackTimer > 0 && fighters[1].attackBox.intersectsBox(fighters[0].bodyBox)) {
    const center = new THREE.Vector3();
    fighters[0].bodyBox.getCenter(center);
    spawnSpark(center);
    applyDamage(0, fighters[0].blocking);
    fighters[1].attackTimer = 0;
  }
}

function applyDamage(targetIndex, blocking) {
  if (blocking) {
    // Blok sukses: tidak ada pengurangan HP sama sekali
    const f = fighters[targetIndex];
    f.blockEffectTimer = 0.25; // efek visual blok
    sfx.block();
    return;
  }
  const dmg = 12;
  gameState.hp[targetIndex] = Math.max(0, gameState.hp[targetIndex] - dmg);
  updateHPBars();
  if (gameState.hp[targetIndex] === 0) {
    resolveWinner(targetIndex === 0 ? 2 : 1);
  }
}

function animateFighters(delta) {
  fighters.forEach((f, idx) => {
    f.idlePhase += delta * 2.5;
    // Bobbing hanya ke atas (hilangkan komponen negatif agar kaki tidak menembus lantai)
    const bobRaw = Math.sin(f.idlePhase) * 0.1;
    const bob = bobRaw < 0 ? 0 : bobRaw;
    // Physics lompat (integrasi posisi akumulatif)
    if (!f.onGround) {
      f.verticalVelocity -= gravity * delta; // percepatan gravitasi
      f.airY += f.verticalVelocity * delta;  // integrasi posisi
      if (f.airY <= 0) {
        f.airY = 0;
        f.verticalVelocity = 0;
        f.onGround = true;
      }
    }
    f.group.position.y = f.baseY + bob + f.airY;

    // Penyesuaian dinamis: jika setelah transform bbox.min.y < 0, geser ke atas
    const tempBox = new THREE.Box3().setFromObject(f.group);
    if (f.onGround && tempBox.min.y < 0) {
      f.group.position.y += -tempBox.min.y;
      f.baseY = f.group.position.y; // perbarui baseY agar bobbing tetap konsisten
    }

    const punchLean = f.attackTimer > 0 ? (idx === 0 ? -0.35 : 0.35) : 0;
    f.mesh.rotation.z = THREE.MathUtils.lerp(f.mesh.rotation.z, punchLean, 0.25);

    const punchOffset = f.attackTimer > 0 ? (idx === 0 ? 0.25 : -0.25) : 0;
    f.mesh.position.z = THREE.MathUtils.lerp(f.mesh.position.z, punchOffset, 0.25);

    // Efek visual blok (scale pulse + tint emissive jika ada)
    if (f.blockEffectTimer && f.blockEffectTimer > 0) {
      f.blockEffectTimer -= delta;
      const pulse = Math.sin((f.blockEffectTimer / 0.25) * Math.PI) * 0.12;
      f.group.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      f.mesh.traverse(obj => {
        if (obj.isMesh && obj.material && obj.material.emissive) {
          obj.material.emissive.setHex(0x2266ff);
        }
      });
      if (f.blockEffectTimer <= 0) {
        f.group.scale.set(1,1,1);
        f.mesh.traverse(obj => {
          if (obj.isMesh && obj.material && obj.material.emissive) {
            obj.material.emissive.setHex(0x000000);
          }
        });
      }
    }
  });

  if (debugEnabled) {
    const lines = fighters.map((f,i)=>{
      const penetration = f.bodyBox ? Math.min(0, f.bodyBox.min.y).toFixed(2) : 'n/a';
      return `P${i+1} x:${f.group.position.x.toFixed(2)} y:${f.group.position.y.toFixed(2)} baseY:${f.baseY.toFixed(2)} atk:${f.attackTimer.toFixed(2)} cd:${f.cooldown.toFixed(2)} block:${f.blocking} pen:${penetration}`;
    });
    debugEl.textContent = lines.join('\n');
  }
}

function resolveWinner(forcedWinner) {
  if (gameState.status !== 'fight') return;
  gameState.status = 'ended';

  let winnerText = '';
  let roundWinnerIndex = -1;
  if (forcedWinner) {
    roundWinnerIndex = forcedWinner - 1;
    winnerText = `P${forcedWinner} MENANG RONDE ${gameState.round}!`;
  } else {
    const diff = gameState.hp[0] - gameState.hp[1];
    if (diff === 0) {
      winnerText = `SERII RONDE ${gameState.round}!`; // seri tidak menambah kemenangan
    } else if (diff > 0) {
      roundWinnerIndex = 0;
      winnerText = `P1 MENANG RONDE ${gameState.round}!`;
    } else {
      roundWinnerIndex = 1;
      winnerText = `P2 MENANG RONDE ${gameState.round}!`;
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
    showMessage(`${winnerText}\nP${finalWinner} MENANG MATCH! Tekan ENTER untuk mulai lagi.`);
    gameState.status = 'match-ended';
    sfx.win();
  } else {
    showMessage(`${winnerText} Tekan ENTER untuk lanjut ke Ronde ${gameState.round + 1}.`);
  }
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

const clock = new THREE.Clock();
function tick() {
  const delta = clock.getDelta();
  update(delta);
  updateSparks(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

window.addEventListener('resize', resizeRenderer);
function resizeRenderer() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function typeText(el, txt) {
  el.textContent = txt;
}

function updateScoreDisplay() {
  const stars = (wins) => '★'.repeat(wins) + '☆'.repeat(2 - wins);
  gameState.scoreEls[0].textContent = stars(gameState.roundWins[0]);
  gameState.scoreEls[1].textContent = stars(gameState.roundWins[1]);
}
