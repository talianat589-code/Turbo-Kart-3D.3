
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';

document.querySelector('#app').innerHTML = `
  <main class="game">
    <header class="hud">
      <div>
        <span class="eyebrow">RACING EXPERIENCE</span>
        <h1>TURBO <span>KART</span></h1>
      </div>
      <div class="speed-box">
        <strong id="speed">000</strong>
        <span>KM/H</span>
      </div>
    </header>

    <div class="race-info">
      <span>VUELTA <b id="lap">1 / 3</b></span>
      <span id="status">LISTO PARA CORRER</span>
    </div>

    <div id="viewport"></div>

    <div class="garage">
      <span class="eyebrow">TU VEHÍCULO</span>
      <strong id="kart-name">VOLT X1</strong>
      <button id="change-kart">CAMBIAR KART ↗</button>
    </div>

    <div class="race-message" id="message">¡ACELERA Y TOMA LA DELANTERA!</div>

    <div class="mobile-controls">
      <div class="steering">
        <button class="control steer" data-key="left" aria-label="Girar a la izquierda">◀</button>
        <button class="control steer" data-key="right" aria-label="Girar a la derecha">▶</button>
      </div>
      <div class="driving">
        <button class="control brake" data-key="brake">FRENO</button>
        <button class="control boost" id="boost">⚡ TURBO</button>
        <button class="control accelerate" data-key="gas">ACELERAR<br>▲</button>
      </div>
    </div>

    <footer>TOCA LOS CONTROLES PARA CONDUCIR</footer>
  </main>
`;

const viewport = document.querySelector('#viewport');
const speedLabel = document.querySelector('#speed');
const statusLabel = document.querySelector('#status');
const kartName = document.querySelector('#kart-name');
const message = document.querySelector('#message');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9dc8df);
scene.fog = new THREE.Fog(0x9dc8df, 65, 230);

const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 350);
camera.position.set(0, 6, 11);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
viewport.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe5f4ff, 0x42513a, 2.1));

const sun = new THREE.DirectionalLight(0xfff0d5, 2.5);
sun.position.set(-20, 35, 15);
scene.add(sun);

function material(color, roughness = 0.65, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness
  });
}

const grassMat = material(0x527a49);
const asphaltMat = material(0x343a42, 0.93);
const whiteMat = material(0xf1f1e8);
const redMat = material(0xe33a42);
const tireMat = material(0x15191e, 0.95);
const metalMat = material(0x778b9d, 0.28, 0.8);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  grassMat
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
scene.add(ground);

// Circuito ovalado
const track = new THREE.Group();
scene.add(track);

const outerRadiusX = 24;
const outerRadiusZ = 15;
const innerRadiusX = 13;
const innerRadiusZ = 6;

const trackShape = new THREE.Shape();
trackShape.absellipse(0, 0, outerRadiusX, outerRadiusZ, 0, Math.PI * 2, false, 0);

const hole = new THREE.Path();
hole.absellipse(0, 0, innerRadiusX, innerRadiusZ, 0, Math.PI * 2, true, 0);
trackShape.holes.push(hole);

const trackMesh = new THREE.Mesh(
  new THREE.ShapeGeometry(trackShape, 100),
  asphaltMat
);
trackMesh.rotation.x = -Math.PI / 2;
trackMesh.position.y = 0;
track.add(trackMesh);

function makeLine(rx, rz, color, thickness = 0.12) {
  const points = [];
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(a) * rx,
      0.035,
      Math.sin(a) * rz
    ));
  }
  const line = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      240,
      thickness,
      5,
      false
    ),
    material(color)
  );
  track.add(line);
}

makeLine(outerRadiusX, outerRadiusZ, 0xf0f1f2, 0.18);
makeLine(innerRadiusX, innerRadiusZ, 0xf0f1f2, 0.18);
makeLine(18.5, 10.5, 0xf6f6f2, 0.055);

// Zona central
const island = new THREE.Mesh(
  new THREE.CircleGeometry(1, 48),
  grassMat
);
island.scale.set(12.8, 5.8, 1);
island.rotation.x = -Math.PI / 2;
island.position.y = -0.04;
scene.add(island);

// Árboles de bajo coste para el primer escenario
function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.2, 1.5, 7),
    material(0x61422e)
  );
  trunk.position.y = 0.75;
  tree.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 2.3, 7),
    material(0x28543b)
  );
  crown.position.y = 2.1;
  tree.add(crown);

  scene.add(tree);
}

for (let i = 0; i < 44; i++) {
  const a = (i / 44) * Math.PI * 2;
  createTree(
    Math.cos(a) * 32,
    Math.sin(a) * 23,
    0.8 + (i % 3) * 0.16
  );
}

// Karts originales con diferentes carrocerías
function createKart(color, accent, futuristic = false) {
  const kart = new THREE.Group();
  const bodyMat = material(color, 0.27, 0.55);
  const accentMat = material(accent, 0.25, 0.35);

  function box(w, h, d, mat, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), mat
    );
    mesh.position.set(x, y, z);
    kart.add(mesh);
    return mesh;
  }

  // Chasis y carrocería
  box(1.45, 0.28, 2.15, tireMat, 0, 0.42, 0);
  box(1.6, 0.32, futuristic ? 1.65 : 1.8, bodyMat, 0, 0.58, 0);

  // Nariz delantera
  const nose = box(0.95, 0.24, 0.68, bodyMat, 0, 0.59, -1.13);
  nose.rotation.x = -0.12;

  // Cabina y asiento
  box(0.7, 0.42, 0.58, tireMat, 0, 0.78, 0.22);
  box(0.9, 0.12, 0.35, accentMat, 0, 1.0, 0.32);

  // Luces frontales
  for (const x of [-0.55, 0.55]) {
    box(0.3, 0.1, 0.07, material(0xbdeeff, 0.2, 0.2),
      x, 0.65, -1.47);
  }

  // Ruedas
  for (const x of [-0.88, 0.88]) {
    for (const z of [-0.72, 0.72]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16),
        tireMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.34, z);
      kart.add(wheel);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.235, 12),
        metalMat
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      kart.add(hub);
    }
  }

  // Alerón deportivo
  box(1.45, 0.12, 0.24, accentMat, 0, 0.91, 1.0);

  if (futuristic) {
    box(1.75, 0.055, 0.13,
      material(0x26e9ff, 0.25, 0.25), 0, 0.62, 0.94);
  }

  // El frente del vehículo apunta hacia -Z
  scene.add(kart);
  return kart;
}

const player = createKart(0x1769ff, 0x35e6ff, true);
const rival = createKart(0xff4a32, 0xffd34d, false);

player.position.set(0, 0, 10.5);
rival.position.set(-4, 0, 10.5);


// Cargar el modelo 3D externo del jugador.
// Si el archivo no carga, el kart provisional permanece visible.
const playerModelLoader = new GLTFLoader();

playerModelLoader.load(
  '/models/raceCarWhite.glb',

  (gltf) => {
    const model = gltf.scene;

    model.updateMatrixWorld(true);

    // Calcular dimensiones y centro del modelo.
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // Ajustar el tamaño al espacio del vehículo.
    const largestSide = Math.max(size.x, size.z);

    const scale = largestSide > 0
      ? Math.min(
          2.7 / largestSide,
          1.25 / Math.max(size.y, 0.01)
        )
      : 1;

    model.scale.setScalar(scale);

    // Centrar el modelo y apoyarlo sobre el suelo.
    model.position.set(
      -center.x * scale,
      -bounds.min.y * scale + 0.04,
      -center.z * scale
    );

    // Incorporarlo al vehículo del jugador.
    player.add(model);

    // Ocultar el kart provisional únicamente
    // después de confirmar que el modelo se cargó.
    player.children.forEach((child) => {
      if (child !== model) {
        child.visible = false;
      }
    });

    player.userData.externalModel = model;

    message.textContent = 'MODELO 3D DEL JUGADOR CARGADO';

    console.info(
      'Turbo Kart 3D: modelo GLB cargado correctamente.'
    );
  },

  undefined,

  (error) => {
    console.error(
      'No se pudo cargar el modelo GLB. Se conserva el kart provisional.',
      error
    );

    message.textContent = 'KART ORIGINAL LISTO';
  }
);


let kartIndex = 0;
const kartOptions = [
  { name: 'VOLT X1', color: 0x1769ff, accent: 0x35e6ff, future: true },
  { name: 'STORM GT', color: 0xdb2444, accent: 0xffd34d, future: false },
  { name: 'NOVA E-R', color: 0x9a52e8, accent: 0x47ffb0, future: true },
  { name: 'PHANTOM RS', color: 0x242b38, accent: 0xff7744, future: false }
];

// Estado de controles táctiles
const keys = { left: false, right: false, gas: false, brake: false };
let speed = 0;
let steering = 0;
let turbo = 100;
let boostActive = false;
let drift = false;
let elapsed = 0;
let rivalAngle = Math.PI / 2;
const clock = new THREE.Clock();

function applyKartStyle(kart, color, accent) {
  // Cambia los materiales de carrocería y detalles.
  kart.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const c = obj.material.color;
    if (c.getHex() === player.userData.bodyColor) c.setHex(color);
    if (c.getHex() === player.userData.accentColor) c.setHex(accent);
  });
  player.userData.bodyColor = color;
  player.userData.accentColor = accent;
}

player.userData.bodyColor = 0x1769ff;
player.userData.accentColor = 0x35e6ff;

document.querySelector('#change-kart').addEventListener('click', () => {
  kartIndex = (kartIndex + 1) % kartOptions.length;
  const option = kartOptions[kartIndex];
  applyKartStyle(player, option.color, option.accent);
  kartName.textContent = option.name;
  message.textContent = 'KART SELECCIONADO: ' + option.name;
});

document.querySelectorAll('[data-key]').forEach((button) => {
  const key = button.dataset.key;

  const start = (event) => {
    event.preventDefault();
    keys[key] = true;
    button.classList.add('pressed');
  };

  const end = (event) => {
    event.preventDefault();
    keys[key] = false;
    button.classList.remove('pressed');
  };

  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', end);
  button.addEventListener('pointercancel', end);
  button.addEventListener('pointerleave', end);
  button.addEventListener('contextmenu', (e) => e.preventDefault());
});

const boostButton = document.querySelector('#boost');

function setBoost(value) {
  boostActive = value;
  boostButton.classList.toggle('pressed', value);
}

boostButton.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  setBoost(true);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((event) => {
  boostButton.addEventListener(event, () => setBoost(false));
});

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowleft', 'a'].includes(k)) keys.left = true;
  if (['arrowright', 'd'].includes(k)) keys.right = true;
  if (['arrowup', 'w'].includes(k)) keys.gas = true;
  if (['arrowdown', 's'].includes(k)) keys.brake = true;
  if (k === 'shift') setBoost(true);
});
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowleft', 'a'].includes(k)) keys.left = false;
  if (['arrowright', 'd'].includes(k)) keys.right = false;
  if (['arrowup', 'w'].includes(k)) keys.gas = false;
  if (['arrowdown', 's'].includes(k)) keys.brake = false;
  if (k === 'shift') setBoost(false);
});

function resize() {
  const w = viewport.clientWidth || window.innerWidth;
  const h = viewport.clientHeight || window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);
  elapsed += dt;

  if (keys.gas) speed += 13 * dt;
  else speed -= 2.8 * dt;

  if (keys.brake) speed -= 20 * dt;

  if (boostActive && turbo > 0 && speed > 2) {
    speed += 16 * dt;
    turbo = Math.max(0, turbo - 24 * dt);
  } else {
    turbo = Math.min(100, turbo + 7 * dt);
  }

  speed = THREE.MathUtils.clamp(speed, 0, 38);

  const targetSteer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
  steering = THREE.MathUtils.lerp(steering, targetSteer, Math.min(1, dt * 7));
  drift = Math.abs(steering) > 0.65 && speed > 10;

  player.rotation.y += steering * dt * (0.65 + speed * 0.025);
  player.position.x -= Math.sin(player.rotation.y) * speed * dt;
  player.position.z -= Math.cos(player.rotation.y) * speed * dt;

  // Mantener el vehículo en la zona de la pista
  const limit = 21;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limit, limit);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -12.5, 12.5);

  // Rival automático recorriendo el óvalo
  rivalAngle += dt * (0.48 + speed * 0.005);
  rival.position.set(
    Math.cos(rivalAngle) * 18.5,
    0,
    Math.sin(rivalAngle) * 10.5
  );
  rival.rotation.y = -rivalAngle - Math.PI / 2;

  // Cámara suave detrás del kart
  const behind = new THREE.Vector3(0, 4.5, 8.5);
  behind.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
  const cameraTarget = player.position.clone().add(behind);
  camera.position.lerp(cameraTarget, Math.min(1, dt * 3.5));

  const lookTarget = player.position.clone();
  lookTarget.y += 1.0;
  camera.lookAt(lookTarget);

  speedLabel.textContent = String(Math.round(speed * 5)).padStart(3, '0');
  statusLabel.textContent = drift ? 'DERRAPE ACTIVO' : boostActive && turbo > 0 ? 'TURBO ACTIVADO' : 'EN CARRERA';

  const messageText = document.querySelector('#message');
  messageText.textContent = boostActive && turbo > 0
    ? '⚡ TURBO ACTIVADO'
    : drift
      ? 'DERRAPE'
      : '¡ACELERA Y TOMA LA DELANTERA!';

  renderer.render(scene, camera);
}

animate();
