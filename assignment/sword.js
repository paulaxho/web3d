import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, controls, model, mixer;
let autoRotate = false;
let wireframeMode = false;
let initialCameraPosition;
let clock = new THREE.Clock();
let swordOpened = false;
let sound;


init();
animate();

function init() {
  const container = document.getElementById('swordModel');

  // Scene & camera setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);
  initialCameraPosition = camera.position.clone();

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

  // Load default sword model
  const loader = new GLTFLoader();
  loader.load(
    'models/sword_tamam.glb',
    (gltf) => {
      model = gltf.scene;
      centerModel(model);
      model.scale.set(5, 5, 5);
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
    },
    undefined,
    (error) => console.error('Error loading sword:', error)
  );

  // Buttons
  window.addEventListener('resize', onWindowResize);
  document.getElementById('rotateBtn').addEventListener('click', toggleRotate);
  document.getElementById('wireframeBtn').addEventListener('click', toggleWireframe);
  document.getElementById('resetBtn').addEventListener('click', resetView);
  document.getElementById('openSword').addEventListener('click', openSwordAnimation);

  // Camera views
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
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('swordModel');
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

function openSwordAnimation() {
    const button = document.getElementById('openSword');
    const loader = new GLTFLoader();
  
    if (!swordOpened) {
      // Remove current model
      if (model) scene.remove(model);
      if (sound) sound.pause();
  
      // Load animated sword
      loader.load('models/sword_opening.glb', (gltf) => {
        model = gltf.scene;
        centerModel(model);
        model.scale.set(5, 5, 5);
        scene.add(model);
  
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
  
        // Play sound
        sound = new Audio('media/sword_sound.wav');
        sound.play();
  
        swordOpened = true;
        button.textContent = 'Close Sword';
      });
    } else {
      // Remove animated model
      if (model) scene.remove(model);
      if (sound) sound.pause();
  
      // Load static sword again
      loader.load('models/sword_tamam.glb', (gltf) => {
        model = gltf.scene;
        centerModel(model);
        model.scale.set(5, 5, 5);
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        mixer = null;
        swordOpened = false;
        button.textContent = 'Open Sword';
      });
    }
  }
