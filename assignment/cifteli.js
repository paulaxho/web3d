// sword_script.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, controls, model;
let autoRotate = false;
let wireframeMode = false;
let initialCameraPosition;

init();
animate();

function init() {
  const container = document.getElementById('cifteliModel');

  // Scene & background
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5);
  initialCameraPosition = camera.position.clone();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = autoRotate;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Load GLB model
  const loader = new GLTFLoader();
  loader.load(
    'models/cifteli.glb', 
    (gltf) => {
      model = gltf.scene;
      centerModel(model);
      model.position.y += 0.8;
      model.position.x += 0.8;
      model.scale.set(4, 4, 4); 
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
      console.log('Cifteli model loaded successfully');
    },
    (xhr) => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`),
    (error) => console.error('Error loading model:', error)
  );

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  document.getElementById('rotateBtn').addEventListener('click', toggleRotate);
  document.getElementById('wireframeBtn').addEventListener('click', toggleWireframe);
  document.getElementById('resetBtn').addEventListener('click', resetView);

  const cameraPresets = {
    front: { pos: new THREE.Vector3(0, 1, 5), target: new THREE.Vector3(0, 0, 0) },
    side:  { pos: new THREE.Vector3(5, 1, 0), target: new THREE.Vector3(0, 0, 0) },
    top:   { pos: new THREE.Vector3(0, 10, 0), target: new THREE.Vector3(0, 0, 0) },
    iso:   { pos: new THREE.Vector3(3, 3, 3), target: new THREE.Vector3(0, 0, 0) },
  };

  function moveCamera(preset) {
    const { pos, target } = cameraPresets[preset];
    gsap.to(camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(target)
    });
  }

  document.getElementById('btnFront').addEventListener('click', () => moveCamera('front'));
  document.getElementById('btnSide').addEventListener('click',  () => moveCamera('side'));
  document.getElementById('btnTop').addEventListener('click',   () => moveCamera('top'));
  document.getElementById('btnIso').addEventListener('click',   () => moveCamera('iso'));
}

function centerModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('cifteliModel');
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function toggleRotate() {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  document.getElementById('rotateBtn').textContent =
    autoRotate ? 'Stop Rotation' : 'Start Rotation';
}

function toggleWireframe() {
  wireframeMode = !wireframeMode;
  document.getElementById('wireframeBtn').textContent =
    wireframeMode ? 'Show Normal' : 'Show Wireframe';
  if (model) {
    model.traverse(child => {
      if (child.isMesh) child.material.wireframe = wireframeMode;
    });
  }
}

function resetView() {
  camera.position.copy(initialCameraPosition);
  controls.target.set(0, 0, 0);
  controls.update();
}

// sound for çifteli
const audio = new Audio('media/cifteli-sound.mp3');
const playBtn = document.getElementById('playSoundBtn');

let isPlaying = false;

playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    audio.currentTime = 0;
    audio.play();
    playBtn.textContent = 'Stop Sound';
    isPlaying = true;
  } else {
    audio.pause();
    audio.currentTime = 0;
    playBtn.textContent = 'Play Sound';
    isPlaying = false;
  }
});

audio.addEventListener('ended', () => {
  playBtn.textContent = 'Play Sound';
  isPlaying = false;
});