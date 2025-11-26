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

// candi background
const bgTex = new THREE.TextureLoader().load('https://images.unsplash.com/photo-1541689592653-09a0f4a95b24?auto=format&fit=crop&w=1900&q=80');
bgTex.colorSpace = THREE.SRGBColorSpace;
const bgPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 18),
  new THREE.MeshBasicMaterial({ map: bgTex, depthWrite: false })
);
bgPlane.position.set(0, 6, -12);
scene.add(bgPlane);

const loader = new GLTFLoader();
const fighters = [];

const gameState = {
  status: 'menu',
  hp: [100, 100],
  maxHp: 100,
  timer: 99,
  timerEl: document.getElementById('timer-display'),
  hpEls: [document.getElementById('hp1'), document.getElementById('hp2')],
  messageEl: document.getElementById('message'),
  hudEl: document.getElementById('hud'),
  menuEl: document.getElementById('menu')
};

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

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
        obj.material.side = THREE.FrontSide;
      }
    });

    const bbox = new THREE.Box3().setFromObject(base);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const scale = 4 / size.y;
    base.scale.setScalar(scale);

    createFighter(base, -6, 0);
    createFighter(base, 6, Math.PI);

    startBtn.disabled = false;
    startBtn.removeAttribute('disabled');
    startBtn.textContent = 'MULAI PERTARUNGAN';
    hideMessage();
  },
  undefined,
  (err) => {
    console.error('Gagal memuat scene.gltf', err);
    showMessage('Gagal memuat model wayang. Pastikan file scene.gltf / scene.bin tersedia.');
    startBtn.textContent = 'MUATAN GAGAL';
  }
);

function createFighter(model, initialX, facing) {
  const group = new THREE.Group();
  const mesh = model.clone(true);
  group.add(mesh);
  group.position.set(initialX, 0, 0);
  scene.add(group);

  fighters.push({
    group,
    mesh,
    facing,
    attackTimer: 0,
    cooldown: 0,
    idlePhase: Math.random() * Math.PI * 2,
    blocking: false,
    attackBox: new THREE.Box3(),
    bodyBox: new THREE.Box3()
  });
}

function startMatch() {
  gameState.status = 'fight';
  gameState.hp = [100, 100];
  gameState.timer = 99;
  gameState.menuEl.style.display = 'none';
  gameState.hudEl.style.display = 'block';
  hideMessage();
  fighters.forEach((f, idx) => {
    f.group.position.set(idx === 0 ? -3.5 : 3.5, 0, 0);
    f.group.rotation.y = idx === 0 ? 0 : Math.PI;
    f.attackTimer = 0;
    f.cooldown = 0;
  });
  updateHPBars();
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

const speed = 4;
const attackDuration = 0.28;
const attackCooldown = 0.45;
const attackReach = 1.2;

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
  if (keys['ShiftLeft'] || keys['ShiftRight']) triggerAttack(1);
}

function triggerAttack(index) {
  if (gameState.status !== 'fight') return;
  const fighter = fighters[index];
  if (fighter.cooldown > 0) return;
  fighter.attackTimer = attackDuration;
  fighter.cooldown = attackCooldown;
}

function updateCombat(delta) {
  fighters.forEach((f, idx) => {
    if (f.cooldown > 0) f.cooldown -= delta;
    if (f.attackTimer > 0) f.attackTimer = Math.max(0, f.attackTimer - delta);

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
    applyDamage(1, fighters[1].blocking);
    fighters[0].attackTimer = 0;
  }

  if (fighters[1].attackTimer > 0 && fighters[1].attackBox.intersectsBox(fighters[0].bodyBox)) {
    applyDamage(0, fighters[0].blocking);
    fighters[1].attackTimer = 0;
  }
}

function applyDamage(targetIndex, blocking) {
  const dmg = blocking ? 4 : 12;
  gameState.hp[targetIndex] = Math.max(0, gameState.hp[targetIndex] - dmg);
  updateHPBars();
  if (gameState.hp[targetIndex] === 0) {
    resolveWinner(targetIndex === 0 ? 2 : 1);
  }
}

function animateFighters(delta) {
  fighters.forEach((f, idx) => {
    f.idlePhase += delta * 2.5;
    const bob = Math.sin(f.idlePhase) * 0.1;
    f.mesh.position.y = bob;

    const punchLean = f.attackTimer > 0 ? (idx === 0 ? -0.35 : 0.35) : 0;
    f.mesh.rotation.z = THREE.MathUtils.lerp(f.mesh.rotation.z, punchLean, 0.25);

    const punchOffset = f.attackTimer > 0 ? (idx === 0 ? 0.25 : -0.25) : 0;
    f.mesh.position.z = THREE.MathUtils.lerp(f.mesh.position.z, punchOffset, 0.25);
  });
}

function resolveWinner(forcedWinner) {
  if (gameState.status !== 'fight') return;
  gameState.status = 'ended';

  let winnerText = '';
  if (forcedWinner) {
    winnerText = `P${forcedWinner} MENANG!`;
  } else {
    const diff = gameState.hp[0] - gameState.hp[1];
    winnerText = diff === 0 ? 'SERII!' : diff > 0 ? 'P1 MENANG!' : 'P2 MENANG!';
  }

  showMessage(`${winnerText} Tekan ENTER untuk rematch.`);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && gameState.status === 'ended') {
    startMatch();
  }
});

const clock = new THREE.Clock();
function tick() {
  const delta = clock.getDelta();
  update(delta);
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
