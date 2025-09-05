// gradient-script.js — WebGL Gradient Shader System
import { vertexShader, fluidShader, displayShader } from "./shaders.js";

let scene, camera, renderer, fluidTarget1, fluidTarget2, displayMaterial;
let mouse = { x: 0, y: 0, prevX: 0, prevY: 0, isDown: false };
let isInitialized = false;
let isStarted = false;
let animationId;

// Shader uniforms with default values
const uniforms = {
  fluidUniforms: {
    iTime: { value: 0 },
    iResolution: { value: [window.innerWidth, window.innerHeight] },
    iMouse: { value: [0, 0, 0, 0] },
    iFrame: { value: 0 },
    iPreviousFrame: { value: null },
    uBrushSize: { value: 50 },
    uBrushStrength: { value: 1.0 },
    uFluidDecay: { value: 0.995 },
    uTrailLength: { value: 0.98 },
    uStopDecay: { value: 0.85 },
  },
  displayUniforms: {
    iTime: { value: 0 },
    iResolution: { value: [window.innerWidth, window.innerHeight] },
    iFluid: { value: null },
    uDistortionAmount: { value: 0.8 },
    uColor1: { value: [0.2, 0.1, 0.8] },
    uColor2: { value: [0.8, 0.2, 0.4] },
    uColor3: { value: [0.1, 0.8, 0.6] },
    uColor4: { value: [0.9, 0.5, 0.1] },
    uColorIntensity: { value: 1.2 },
    uSoftness: { value: 3.0 },
  },
};

function createShaderMaterial(vertexShader, fragmentShader, uniforms) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
}

function setupMouseListeners() {
  const canvas = renderer.domElement;

  function updateMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX - rect.left;
    mouse.y = rect.height - (e.clientY - rect.top);
  }

  canvas.addEventListener("mousemove", updateMouse);
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    updateMouse(e.touches[0]);
  });

  canvas.addEventListener("mousedown", () => (mouse.isDown = true));
  canvas.addEventListener("mouseup", () => (mouse.isDown = false));
  canvas.addEventListener("touchstart", () => (mouse.isDown = true));
  canvas.addEventListener("touchend", () => (mouse.isDown = false));
}

function initThreeJS() {
  const container = document.querySelector(".gradient-canvas");

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create render targets for fluid simulation
  const renderTargetOptions = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
  };

  fluidTarget1 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    renderTargetOptions,
  );
  fluidTarget2 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    renderTargetOptions,
  );

  // Create materials
  const fluidMaterial = createShaderMaterial(
    vertexShader,
    fluidShader,
    uniforms.fluidUniforms,
  );
  displayMaterial = createShaderMaterial(
    vertexShader,
    displayShader,
    uniforms.displayUniforms,
  );

  // Create geometry and meshes
  const geometry = new THREE.PlaneGeometry(2, 2);
  const fluidMesh = new THREE.Mesh(geometry, fluidMaterial);
  const displayMesh = new THREE.Mesh(geometry, displayMaterial);

  scene.add(displayMesh);

  // Store fluid mesh for render loop
  scene.userData.fluidMesh = fluidMesh;
  scene.userData.fluidScene = new THREE.Scene();
  scene.userData.fluidScene.add(fluidMesh);

  setupMouseListeners();
  handleResize();

  console.log("🌈 Gradient WebGL initialized");
}

function updateUniforms(deltaTime) {
  // Update time
  uniforms.fluidUniforms.iTime.value += deltaTime;
  uniforms.displayUniforms.iTime.value += deltaTime;

  // Update frame counter
  uniforms.fluidUniforms.iFrame.value++;

  // Update mouse
  if (mouse.isDown) {
    uniforms.fluidUniforms.iMouse.value = [
      mouse.x,
      mouse.y,
      mouse.prevX,
      mouse.prevY,
    ];
  } else {
    uniforms.fluidUniforms.iMouse.value = [mouse.x, mouse.y, 0, 0];
  }
}

function render() {
  if (!isStarted) return;

  const deltaTime = 0.016; // ~60fps
  updateUniforms(deltaTime);

  // Render fluid simulation
  uniforms.fluidUniforms.iPreviousFrame.value = fluidTarget2.texture;
  renderer.setRenderTarget(fluidTarget1);
  renderer.render(scene.userData.fluidScene, camera);

  // Swap render targets
  [fluidTarget1, fluidTarget2] = [fluidTarget2, fluidTarget1];

  // Render final display
  uniforms.displayUniforms.iFluid.value = fluidTarget2.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  animationId = requestAnimationFrame(render);
}

function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  if (fluidTarget1) {
    fluidTarget1.setSize(width, height);
    fluidTarget2.setSize(width, height);
  }

  // Update resolution uniforms
  uniforms.fluidUniforms.iResolution.value = [width, height];
  uniforms.displayUniforms.iResolution.value = [width, height];
}

// Public API
export function initGradient() {
  if (isInitialized) return;

  // Load Three.js if not already loaded
  if (typeof THREE === "undefined") {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
    script.onload = () => {
      initThreeJS();
      isInitialized = true;
    };
    document.head.appendChild(script);
  } else {
    initThreeJS();
    isInitialized = true;
  }

  window.addEventListener("resize", handleResize);
}

export function startGradient() {
  if (!isInitialized || isStarted) return;

  isStarted = true;

  // Fade in gradient elements
  gsap.to(".gradient-canvas", {
    opacity: 1,
    duration: 1,
    ease: "power2.out",
  });

  gsap.to([".hero-logo", "nav"], {
    opacity: 1,
    visibility: "visible",
    duration: 1.5,
    delay: 0.5,
    ease: "power2.out",
  });

  render();
  console.log("🌈 Gradient started");
}

export function stopGradient() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isStarted = false;
}
