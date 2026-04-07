// ═══════════════════════════════════════════════════════════════════════
// Unified Exoplanet System Renderer
// Ported from Project Tycho — data-driven architecture handles all 10 systems
// ═══════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ═══════════════════════════════════════════════════════════════
// SYSTEM DATA — all 10 exoplanet systems
// ═══════════════════════════════════════════════════════════════

export const SYSTEMS = {
  'toi-700': {
    name: 'TOI-700', id: 'toi-700', type: 'standard',
    starType: 'M2V Red Dwarf', distance: '101.4 ly', nPlanets: 4,
    notable: 'First Earth-size HZ planet found by TESS',
    description: 'TESS discovery (2020). Four planets, two in the habitable zone. TOI-700 d was the first Earth-size habitable zone planet found by TESS.',
    star: { radius: 1.0, color: [1.0, 0.35, 0.10], coronaInner: [1.0, 0.40, 0.12], coronaOuter: [0.7, 0.10, 0.02], lightColor: 0xff5522, lightIntensity: 2.0, ambientColor: 0x180808, ambientIntensity: 0.18, rotationSpeed: 0.00008 },
    camera: { position: [0, 10, 25], maxDistance: 300 },
    bloom: { strength: 1.0, threshold: 0.5 },
    planets: [
      { name: 'TOI-700 b', texture: 'mars.jpg', radius: 0.24, orbit: 3.5, speed: 0.004000, zone: 'hot' },
      { name: 'TOI-700 c', texture: 'neptune.jpg', radius: 0.45, orbit: 6.0, speed: 0.002488, zone: 'warm' },
      { name: 'TOI-700 e', texture: 'earth_daymap.jpg', radius: 0.22, orbit: 9.5, speed: 0.001407, zone: 'habitable' },
      { name: 'TOI-700 d', texture: 'earth_daymap.jpg', radius: 0.26, orbit: 13.5, speed: 0.001067, zone: 'habitable' },
    ],
  },

  'trappist-1': {
    name: 'TRAPPIST-1', id: 'trappist-1', type: 'standard',
    starType: 'M8V Ultra-cool Dwarf', distance: '40.7 ly', nPlanets: 7,
    notable: 'Seven rocky planets, three in the habitable zone',
    description: 'Ultra-cool red dwarf with 7 rocky planets in a tight orbital chain. Three (e, f, g) lie in the habitable zone. The most Earth-like worlds known.',
    star: { radius: 1.1, color: [1.0, 0.18, 0.02], coronaInner: [1.0, 0.35, 0.05], coronaOuter: [0.7, 0.08, 0.0], lightColor: 0xff5511, lightIntensity: 2.8, ambientColor: 0x180808, ambientIntensity: 0.18, rotationSpeed: 0.00015 },
    camera: { position: [0, 14, 32], maxDistance: 200 },
    bloom: { strength: 0.9, threshold: 0.5 },
    planets: [
      { name: 'TRAPPIST-1b', texture: 'mars.jpg', radius: 0.30, orbit: 4.0, speed: 0.00500, zone: 'hot' },
      { name: 'TRAPPIST-1c', texture: 'venus.jpg', radius: 0.30, orbit: 5.47, speed: 0.00312, zone: 'hot' },
      { name: 'TRAPPIST-1d', texture: 'mercury.jpg', radius: 0.21, orbit: 7.71, speed: 0.00186, zone: 'warm' },
      { name: 'TRAPPIST-1e', texture: 'earth_daymap.jpg', radius: 0.25, orbit: 10.1, speed: 0.00124, zone: 'habitable' },
      { name: 'TRAPPIST-1f', texture: 'neptune.jpg', radius: 0.28, orbit: 13.3, speed: 0.00082, zone: 'habitable' },
      { name: 'TRAPPIST-1g', texture: 'uranus.jpg', radius: 0.31, orbit: 16.2, speed: 0.00061, zone: 'habitable' },
      { name: 'TRAPPIST-1h', texture: 'moon.jpg', radius: 0.20, orbit: 21.4, speed: 0.00040, zone: 'cold' },
    ],
  },

  'proxima': {
    name: 'Proxima Centauri', id: 'proxima', type: 'flare',
    starType: 'M5.5Ve Flare Star', distance: '4.25 ly', nPlanets: 3,
    notable: 'Nearest star to the Sun — periodic stellar flares',
    description: 'The closest star to our Sun. M5.5Ve flare star with 3 planets. Proxima b sits in the habitable zone but faces intense stellar flares.',
    star: { radius: 1.3, color: [1.0, 0.28, 0.06], coronaInner: [1.0, 0.45, 0.12], coronaOuter: [0.8, 0.12, 0.02], lightColor: 0xff6622, lightIntensity: 2.5, ambientColor: 0x180808, ambientIntensity: 0.18, rotationSpeed: 0.00015 },
    flare: { baseColor: [1.0, 0.28, 0.06], flareColor: [1.0, 0.7, 0.5], baseLightIntensity: 2.5 },
    camera: { position: [0, 12, 30], maxDistance: 300 },
    bloom: { strength: 1.0, threshold: 0.5 },
    planets: [
      { name: 'Proxima d', texture: 'mercury.jpg', radius: 0.15, orbit: 2.8, speed: 0.0058, zone: 'hot' },
      { name: 'Proxima b', texture: 'earth_daymap.jpg', radius: 0.25, orbit: 5.0, speed: 0.0027, zone: 'habitable' },
      { name: 'Proxima c', texture: 'neptune.jpg', radius: 0.38, orbit: 22.0, speed: 0.00016, zone: 'cold' },
    ],
  },

  'kepler-90': {
    name: 'Kepler-90', id: 'kepler-90', type: 'standard',
    starType: 'G0V Sun-like', distance: '2,840 ly', nPlanets: 8,
    notable: 'Most planets of any known system — Kepler-90i found by AI',
    description: 'Sun-like star with 8 confirmed planets — tied with our solar system for the most. Kepler-90i was discovered using Google AI in 2017.',
    star: { radius: 2.0, color: [1.0, 0.92, 0.65], coronaInner: [1.0, 0.95, 0.7], coronaOuter: [1.0, 0.7, 0.2], lightColor: 0xfff0d0, lightIntensity: 2.8, ambientColor: 0x100e08, ambientIntensity: 0.15, rotationSpeed: 0.00005 },
    camera: { position: [0, 25, 70], maxDistance: 600 },
    bloom: { strength: 1.0, threshold: 0.6 },
    planets: [
      { name: 'Kepler-90b', texture: 'mercury.jpg', radius: 0.18, orbit: 3.5, speed: 0.005000, zone: 'hot' },
      { name: 'Kepler-90c', texture: 'mercury.jpg', radius: 0.16, orbit: 4.8, speed: 0.004020, zone: 'hot' },
      { name: 'Kepler-90i', texture: 'mars.jpg', radius: 0.18, orbit: 6.5, speed: 0.002424, zone: 'hot' },
      { name: 'Kepler-90d', texture: 'neptune.jpg', radius: 0.35, orbit: 12.0, speed: 0.000587, zone: 'warm' },
      { name: 'Kepler-90e', texture: 'uranus.jpg', radius: 0.33, orbit: 17.0, speed: 0.000381, zone: 'warm' },
      { name: 'Kepler-90f', texture: 'neptune.jpg', radius: 0.35, orbit: 22.0, speed: 0.000281, zone: 'warm' },
      { name: 'Kepler-90g', texture: 'jupiter.jpg', radius: 0.65, orbit: 35.0, speed: 0.000166, zone: 'cold' },
      { name: 'Kepler-90h', texture: 'saturn.jpg', radius: 0.80, orbit: 52.0, speed: 0.000106, zone: 'cold' },
    ],
  },

  'pegasi-51': {
    name: '51 Pegasi', id: 'pegasi-51', type: 'standard',
    starType: 'G2IV Sub-giant', distance: '50.45 ly', nPlanets: 1,
    notable: 'First exoplanet around a Sun-like star — Nobel Prize 2019',
    description: 'The first exoplanet discovered around a Sun-like star (1995). Its hot Jupiter "Dimidium" orbits in just 4.23 days. Nobel Prize in Physics 2019.',
    star: { radius: 2.0, color: [1.0, 0.90, 0.55], coronaInner: [1.0, 0.92, 0.55], coronaOuter: [1.0, 0.6, 0.15], lightColor: 0xfff5d0, lightIntensity: 2.5, ambientColor: 0x100e08, ambientIntensity: 0.15, rotationSpeed: 0.00004 },
    camera: { position: [0, 6, 14], maxDistance: 200 },
    bloom: { strength: 1.2, threshold: 0.5 },
    planets: [
      { name: '51 Peg b', texture: 'jupiter.jpg', radius: 0.80, orbit: 3.5, speed: 0.006000, zone: 'hot', tidallyLocked: true, hotJupiter: true },
    ],
  },

  'cancri-55': {
    name: '55 Cancri', id: 'cancri-55', type: 'standard',
    starType: 'G8V Sun-like', distance: '12.34 ly', nPlanets: 5,
    notable: 'Lava world Janssen + habitable zone gas giant',
    description: '5 planets including Janssen, an ultra-hot lava world at 1953 K, and Lipperhey in the habitable zone. One of the nearest multi-planet systems.',
    star: { radius: 1.8, color: [1.0, 0.82, 0.45], coronaInner: [1.0, 0.85, 0.4], coronaOuter: [1.0, 0.55, 0.1], lightColor: 0xffd080, lightIntensity: 2.5, ambientColor: 0x100c06, ambientIntensity: 0.15, rotationSpeed: 0.00005 },
    camera: { position: [0, 22, 55], maxDistance: 600 },
    bloom: { strength: 1.0, threshold: 0.6 },
    planets: [
      { name: '55 Cnc e', texture: 'mars.jpg', radius: 0.22, orbit: 3.5, speed: 0.006000, zone: 'lava' },
      { name: '55 Cnc b', texture: 'jupiter.jpg', radius: 0.72, orbit: 10.0, speed: 0.000302, zone: 'hot' },
      { name: '55 Cnc c', texture: 'neptune.jpg', radius: 0.48, orbit: 18.0, speed: 0.0000997, zone: 'warm' },
      { name: '55 Cnc f', texture: 'uranus.jpg', radius: 0.58, orbit: 36.0, speed: 0.0000170, zone: 'habitable' },
      { name: '55 Cnc d', texture: 'saturn.jpg', radius: 0.82, orbit: 65.0, speed: 0.000000847, zone: 'cold' },
    ],
  },

  'hr-8799': {
    name: 'HR 8799', id: 'hr-8799', type: 'standard',
    starType: 'A5V Blue-white', distance: '129 ly', nPlanets: 4,
    notable: 'First multi-planet system ever directly imaged',
    description: 'Young A-type star with 4 self-luminous super-Jupiters at wide orbits — the first multi-planet system ever photographed. Near 1:2:4:8 resonance.',
    star: { radius: 2.4, color: [0.82, 0.92, 1.0], coronaInner: [0.85, 0.95, 1.0], coronaOuter: [0.4, 0.65, 1.0], lightColor: 0xd0e8ff, lightIntensity: 3.5, ambientColor: 0x060810, ambientIntensity: 0.15, rotationSpeed: 0.00005 },
    camera: { position: [0, 20, 60], maxDistance: 500 },
    bloom: { strength: 1.4, threshold: 0.55 },
    hasDebrisDisk: true,
    planets: [
      { name: 'HR 8799e', texture: 'jupiter.jpg', radius: 0.72, orbit: 8, speed: 0.001200, selfLuminous: true },
      { name: 'HR 8799d', texture: 'saturn.jpg', radius: 0.72, orbit: 13, speed: 0.000541, selfLuminous: true },
      { name: 'HR 8799c', texture: 'neptune.jpg', radius: 0.68, orbit: 21, speed: 0.000284, selfLuminous: true },
      { name: 'HR 8799b', texture: 'uranus.jpg', radius: 0.62, orbit: 38, speed: 0.000118, selfLuminous: true },
    ],
  },

  'kepler-16': {
    name: 'Kepler-16', id: 'kepler-16', type: 'binary',
    starType: 'K + M Binary', distance: '245 ly', nPlanets: 1,
    notable: '"Tatooine" — circumbinary planet orbiting two stars',
    description: 'A circumbinary system nicknamed "Tatooine". Kepler-16A (K-type) and 16B (M-type) orbit each other, while a Saturn-mass planet orbits them both.',
    starA: { radius: 1.8, color: [1.0, 0.70, 0.25], coronaInner: [1.0, 0.75, 0.25], coronaOuter: [0.9, 0.35, 0.05], lightColor: 0xffaa44, lightIntensity: 3.2, lightDecay: 1.6 },
    starB: { radius: 0.72, color: [1.0, 0.22, 0.04], lightColor: 0xff3300, lightIntensity: 1.4, lightDecay: 2.0 },
    binary: { aDist: 1.14, bDist: 3.86, speed: 0.0020 },
    binaryPlanet: { name: 'Kepler-16b', texture: 'saturn.jpg', radius: 0.95, orbit: 15.7, speedRatio: 5.569, hasRings: true },
    camera: { position: [0, 18, 48], maxDistance: 400 },
    bloom: { strength: 1.8, threshold: 0.48 },
    colorGrade: { liftR: 1.02, liftG: 0.97, liftB: 0.90 },
  },

  'wasp-121': {
    name: 'WASP-121', id: 'wasp-121', type: 'escape',
    starType: 'F6V Warm White', distance: '881 ly', nPlanets: 1,
    notable: 'Ultra-hot Jupiter with atmospheric metal escape',
    description: 'Ultra-hot Jupiter tidally distorted by its F-type host star. Dayside reaches 2,500+ K with metals escaping in a comet-like tail.',
    star: { radius: 2.0, color: [0.95, 0.95, 1.0], coronaInner: [1.0, 0.98, 0.90], coronaOuter: [0.75, 0.80, 1.0], lightColor: 0xfff5e8, lightIntensity: 3.0, ambientColor: 0x101018, ambientIntensity: 0.15, rotationSpeed: 0.0002 },
    escapePlanet: { name: 'WASP-121b', texture: 'jupiter.jpg', radius: 0.85, orbit: 3.5, speed: 0.012 },
    camera: { position: [0, 8, 18], maxDistance: 200 },
    bloom: { strength: 1.2, threshold: 0.5 },
  },

  'lich': {
    name: 'PSR B1257+12', id: 'lich', type: 'pulsar',
    starType: 'Millisecond Pulsar', distance: '2,300 ly', nPlanets: 3,
    notable: 'First confirmed exoplanets ever — around a dead star',
    description: 'The first exoplanets ever confirmed (1992) orbit a millisecond pulsar — the remnant of a supernova. Rotating radiation beams sweep the system.',
    camera: { position: [0, 10, 28], maxDistance: 200 },
    bloom: { strength: 1.8, threshold: 0.35 },
    colorGrade: { liftR: 0.90, liftB: 1.10, vignetteIntensity: 0.50 },
    pulsarPlanets: [
      { name: 'Draugr', texture: 'moon.jpg', radius: 0.08, orbit: 3.5, speed: 0.00380 },
      { name: 'Poltergeist', texture: 'mercury.jpg', radius: 0.28, orbit: 7.0, speed: 0.00145 },
      { name: 'Phobetor', texture: 'mercury.jpg', radius: 0.27, orbit: 9.5, speed: 0.00098 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// SHADERS
// ═══════════════════════════════════════════════════════════════

const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 },
    vignetteIntensity: { value: 0.4 }, grainIntensity: { value: 0.06 },
    liftR: { value: 0.92 }, liftG: { value: 0.95 }, liftB: { value: 1.08 },
    gainR: { value: 1.05 }, gainG: { value: 1.0 }, gainB: { value: 0.92 },
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    precision mediump float;
    uniform sampler2D tDiffuse; uniform float time, vignetteIntensity, grainIntensity;
    uniform float liftR, liftG, liftB, gainR, gainG, gainB;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.r = color.r * gainR + (1.0 - color.r) * (liftR - 1.0) * 0.5;
      color.g = color.g * gainG + (1.0 - color.g) * (liftG - 1.0) * 0.5;
      color.b = color.b * gainB + (1.0 - color.b) * (liftB - 1.0) * 0.5;
      color.rgb = (color.rgb - 0.5) * 1.15 + 0.5;
      vec2 center = vUv - 0.5;
      float dist = length(center);
      color.rgb *= 1.0 - smoothstep(0.3, 0.85, dist) * vignetteIntensity;
      color.rgb += rand(vUv + fract(time)) * grainIntensity - grainIntensity * 0.5;
      gl_FragColor = color;
    }`,
};

const coronaVertexShader = `
  varying vec3 vNormal; varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }`;

function coronaFragmentShader(inner, outer, pow = 3.5, mul = 1.4) {
  return `
    precision mediump float;
    varying vec3 vNormal; varying vec3 vViewDir;
    void main() {
      float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0);
      float glow = pow(rim, ${pow.toFixed(1)}) * ${mul.toFixed(1)};
      vec3 inner = vec3(${inner.map(v => v.toFixed(2)).join(', ')});
      vec3 outer = vec3(${outer.map(v => v.toFixed(2)).join(', ')});
      gl_FragColor = vec4(mix(inner, outer, rim), glow * 0.65);
    }`;
}

const atmosphereVertexShader = `
  varying vec3 vNormal; varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

function atmosphereFragmentShader(innerColor, outerColor, intensity = 1.4, alphaMul = 0.3) {
  return `
    precision mediump float;
    varying vec3 vNormal; varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      float atmosphere = pow(rim, 3.5) * ${intensity.toFixed(1)};
      vec3 color = mix(vec3(${innerColor.join(', ')}), vec3(${outerColor.join(', ')}), rim);
      gl_FragColor = vec4(color, atmosphere * ${alphaMul.toFixed(2)});
    }`;
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && 'ontouchstart' in window);

function createComposer(renderer, scene, camera, w, h) {
  if (isMobile) {
    return {
      composer: { render() { renderer.render(scene, camera); }, setSize() {}, dispose() {} },
      bloomPass: { strength: 0, threshold: 0, radius: 0 },
      cinematicPass: { uniforms: { time: { value: 0 }, vignetteIntensity: { value: 0 }, grainIntensity: { value: 0 }, liftR: { value: 1 }, liftG: { value: 1 }, liftB: { value: 1 }, gainR: { value: 1 }, gainG: { value: 1 }, gainB: { value: 1 } } },
    };
  }
  const composer = new EffectComposer(renderer);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.4, 0.85);
  composer.addPass(bloomPass);
  const cinematicPass = new ShaderPass(CinematicShader);
  composer.addPass(cinematicPass);
  return { composer, bloomPass, cinematicPass };
}

function createCameraMovement(camera, controls, container) {
  const keys = new Set();
  const onKeyDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    if (!container.matches(':hover')) return;
    keys.add(e.key.toLowerCase());
  };
  const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), move = new THREE.Vector3();
  function update(dt) {
    if (keys.size === 0) return;
    const dist = camera.position.distanceTo(controls.target);
    const mult = keys.has('shift') ? 3.5 : 1.0;
    const speed = Math.max(dist * 0.85, 8) * dt * mult;
    camera.getWorldDirection(fwd); fwd.y = 0;
    if (fwd.lengthSq() < 0.0001) fwd.set(0, 0, -1);
    fwd.normalize();
    right.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    move.set(0, 0, 0);
    if (keys.has('w') || keys.has('arrowup')) move.addScaledVector(fwd, speed);
    if (keys.has('s') || keys.has('arrowdown')) move.addScaledVector(fwd, -speed);
    if (keys.has('a') || keys.has('arrowleft')) move.addScaledVector(right, -speed);
    if (keys.has('d') || keys.has('arrowright')) move.addScaledVector(right, speed);
    if (keys.has('q')) move.y -= speed * 0.6;
    if (keys.has('e')) move.y += speed * 0.6;
    if (move.lengthSq() > 0) { camera.position.add(move); controls.target.add(move); }
  }
  function dispose() { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); keys.clear(); }
  return { update, dispose };
}

// ═══════════════════════════════════════════════════════════════
// SystemView CLASS
// ═══════════════════════════════════════════════════════════════

export class SystemView {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.animFrameId = null;
    this.timeScale = 1.0;
    this.config = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.camMove = null;
    this.composer = null;
    this.cinematicPass = null;
    this.star = null;
    this.planets = [];
    this.clickableObjects = [];
    this.meshNameMap = new Map();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.focusTransition = null;
    this.lockedMesh = null;
    this.lastLockedPos = null;
    this.TRANSITION_DURATION = 2000;
    this.cbFocus = null;

    // Special system state
    this._flare = null;
    this._binary = null;
    this._escape = null;
    this._pulsar = null;

    // Bound handlers
    this._onClick = this._handleClick.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onResize = this.resize.bind(this);

    this._resizeObs = new ResizeObserver(() => this.resize());
    this._resizeObs.observe(container);
  }

  _dims() {
    return { w: this.container.clientWidth, h: this.container.clientHeight };
  }

  _mouseCoords(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // ── INIT ──────────────────────────────────────────────────────
  init(systemId) {
    this.dispose();
    const cfg = SYSTEMS[systemId];
    if (!cfg) return;
    this.config = cfg;

    const { w, h } = this._dims();
    this.renderer.setSize(w, h);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 2000);
    this.camera.position.set(...cfg.camera.position);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = cfg.camera.maxDistance;
    this.camMove = createCameraMovement(this.camera, this.controls, this.container);

    const loader = new THREE.TextureLoader();
    this.meshNameMap = new Map();
    this.clickableObjects = [];
    this.planets = [];
    this.focusTransition = null;
    this.lockedMesh = null;
    this.lastLockedPos = null;

    // Dispatch to type-specific init
    switch (cfg.type) {
      case 'binary': this._initBinary(loader); break;
      case 'escape': this._initEscape(loader); break;
      case 'pulsar': this._initPulsar(loader); break;
      default: this._initStandard(loader); break;
    }

    // Starfield background
    const bgTex = loader.load('/textures/starfield.jpg');
    bgTex.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = bgTex;

    // Post-processing
    const post = createComposer(this.renderer, this.scene, this.camera, w, h);
    this.composer = post.composer;
    this.cinematicPass = post.cinematicPass;
    post.bloomPass.strength = cfg.bloom.strength;
    post.bloomPass.threshold = cfg.bloom.threshold;
    this._bloomPass = post.bloomPass;
    if (cfg.colorGrade) {
      const u = this.cinematicPass.uniforms;
      if (cfg.colorGrade.liftR != null) u.liftR.value = cfg.colorGrade.liftR;
      if (cfg.colorGrade.liftG != null) u.liftG.value = cfg.colorGrade.liftG;
      if (cfg.colorGrade.liftB != null) u.liftB.value = cfg.colorGrade.liftB;
      if (cfg.colorGrade.vignetteIntensity != null) u.vignetteIntensity.value = cfg.colorGrade.vignetteIntensity;
    }

    // Input handlers
    this.renderer.domElement.addEventListener('click', this._onClick);
    this.renderer.domElement.addEventListener('mousemove', this._onMouseMove);

    // Start animation loop
    this._animate();
  }

  // ── STANDARD SYSTEM ──────────────────────────────────────────
  _initStandard(loader) {
    const cfg = this.config;
    const s = cfg.star;

    // Star
    const starGeo = new THREE.SphereGeometry(s.radius, 64, 64);
    const starMat = new THREE.MeshBasicMaterial({
      map: loader.load('/textures/sun.jpg'),
      color: new THREE.Color(...s.color),
    });
    this.star = new THREE.Mesh(starGeo, starMat);
    this.scene.add(this.star);
    this.clickableObjects.push(this.star);
    this.meshNameMap.set(this.star, cfg.name);

    // Corona
    this.scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(s.radius, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader(s.coronaInner, s.coronaOuter),
        transparent: true, side: THREE.FrontSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));

    // Lighting
    this.scene.add(new THREE.PointLight(s.lightColor, s.lightIntensity, 0, 0));
    this.scene.add(new THREE.AmbientLight(s.ambientColor, s.ambientIntensity));

    // Flare system (for Proxima)
    if (cfg.type === 'flare' && cfg.flare) {
      const fl = cfg.flare;
      this._flare = {
        timer: 8 + Math.random() * 12,
        active: false,
        brightness: 0,
        decayRate: 0,
        baseColor: new THREE.Color(...fl.baseColor),
        flareColor: new THREE.Color(...fl.flareColor),
        baseLightIntensity: fl.baseLightIntensity,
        starMat: starMat,
        starLight: this.scene.children.find(c => c.isPointLight),
        sphereMat: null,
      };
      const flareMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.7, 0.4),
        transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const flareSphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), flareMat);
      flareSphere.scale.setScalar(1.5);
      this.scene.add(flareSphere);
      this._flare.sphereMat = flareMat;
      this._flare.sphere = flareSphere;
    }

    // Planets
    this._createPlanets(loader, cfg.planets, cfg);
  }

  _createPlanets(loader, planetsData, cfg) {
    planetsData.forEach(data => {
      const geo = new THREE.SphereGeometry(data.radius, 32, 32);
      const matOpts = { map: loader.load('/textures/' + data.texture), shininess: 8 };

      // Hot Jupiter emissive
      if (data.hotJupiter) {
        matOpts.emissive = new THREE.Color(0.4, 0.12, 0.0);
        matOpts.emissiveIntensity = 0.2;
      }
      // Lava world
      if (data.zone === 'lava') {
        matOpts.emissive = new THREE.Color(0.6, 0.15, 0.0);
        matOpts.emissiveIntensity = 0.35;
      }
      // Self-luminous (HR 8799 young giants)
      if (data.selfLuminous) {
        matOpts.emissive = new THREE.Color(0.25, 0.1, 0.0);
        matOpts.emissiveIntensity = 0.3;
      }

      const mat = new THREE.MeshPhongMaterial(matOpts);
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.clickableObjects.push(mesh);
      this.meshNameMap.set(mesh, data.name);

      // Zone-based atmospheres
      if (data.zone === 'habitable') {
        mesh.add(this._createAtmosphere(data.radius, [0.2, 0.4, 0.85], [0.45, 0.65, 0.9]));
      } else if (data.zone === 'lava') {
        mesh.add(this._createRimGlow(data.radius * 1.18, [1.0, 0.3, 0.05], 0.7));
      } else if (data.hotJupiter) {
        mesh.add(this._createRimGlow(data.radius * 1.15, [1.0, 0.5, 0.15], 0.5));
      } else if (data.selfLuminous) {
        mesh.add(this._createRimGlow(data.radius * 1.12, [0.9, 0.5, 0.1], 0.4));
      }

      // Orbit lines
      const orbitColor = data.zone === 'habitable' ? 0x66cc88
        : data.zone === 'lava' ? 0xff6622
        : data.zone === 'hot' ? 0xff8844
        : data.zone === 'warm' ? 0xddcc66
        : 0xaaccdd;
      const orbitOpacity = data.zone === 'habitable' ? 0.65 : data.zone === 'lava' ? 0.55 : 0.40;
      const curve = new THREE.EllipseCurve(0, 0, data.orbit, data.orbit, 0, Math.PI * 2);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(256).map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      this.scene.add(new THREE.Line(orbitGeo,
        new THREE.LineBasicMaterial({ color: orbitColor, transparent: true, opacity: orbitOpacity })
      ));

      this.planets.push({ mesh, angle: Math.random() * Math.PI * 2, ...data });
    });

    // HR 8799 debris disk
    if (cfg.hasDebrisDisk) {
      const diskGeo = new THREE.RingGeometry(48, 72, 128);
      const diskPos = diskGeo.attributes.position;
      const diskUV = diskGeo.attributes.uv;
      for (let i = 0; i < diskPos.count; i++) {
        const x = diskPos.getX(i), y = diskPos.getY(i);
        const r = Math.sqrt(x * x + y * y);
        diskUV.setXY(i, (r - 48) / 24, Math.atan2(y, x) / (Math.PI * 2));
      }
      const disk = new THREE.Mesh(diskGeo, new THREE.MeshBasicMaterial({
        color: 0x8899aa, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false,
      }));
      disk.rotation.x = -Math.PI / 2;
      this.scene.add(disk);
    }
  }

  _createAtmosphere(planetRadius, innerColor, outerColor) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius * 1.08, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader(innerColor, outerColor),
        transparent: true, side: THREE.FrontSide, depthWrite: false,
      })
    );
  }

  _createRimGlow(radius, color, alphaMul) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: `
          precision mediump float;
          varying vec3 vNormal; varying vec3 vViewDir;
          void main() {
            float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0);
            float g = pow(rim, 3.5) * 1.0;
            gl_FragColor = vec4(${color.map(v => v.toFixed(1)).join(', ')}, g * ${(alphaMul * 0.5).toFixed(2)});
          }`,
        transparent: true, side: THREE.FrontSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
  }

  // ── BINARY SYSTEM (Kepler-16) ────────────────────────────────
  _initBinary(loader) {
    const cfg = this.config;
    const { starA: sA, starB: sB, binary: b, binaryPlanet: bp } = cfg;

    // Star A
    const starAMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sA.radius, 64, 64),
      new THREE.MeshBasicMaterial({ map: loader.load('/textures/sun.jpg'), color: new THREE.Color(...sA.color) })
    );
    this.scene.add(starAMesh);
    starAMesh.add(new THREE.Mesh(
      new THREE.SphereGeometry(sA.radius, 64, 64),
      new THREE.ShaderMaterial({ vertexShader: coronaVertexShader, fragmentShader: coronaFragmentShader(sA.coronaInner, sA.coronaOuter, 2.8, 2.2), transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    const starALight = new THREE.PointLight(sA.lightColor, sA.lightIntensity, 0, sA.lightDecay);
    this.scene.add(starALight);

    // Star B
    const starBMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sB.radius, 48, 48),
      new THREE.MeshBasicMaterial({ map: loader.load('/textures/sun.jpg'), color: new THREE.Color(...sB.color) })
    );
    this.scene.add(starBMesh);
    starBMesh.add(new THREE.Mesh(
      new THREE.SphereGeometry(sB.radius, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: `precision mediump float; varying vec3 vNormal; varying vec3 vViewDir;
          void main() { float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0); float g = pow(rim, 3.0) * 2.0; gl_FragColor = vec4(1.0, 0.15, 0.02, g * 0.9); }`,
        transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));
    const starBLight = new THREE.PointLight(sB.lightColor, sB.lightIntensity, 0, sB.lightDecay);
    this.scene.add(starBLight);

    this.scene.add(new THREE.AmbientLight(0x060408, 0.2));

    // Planet
    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(bp.radius, 48, 48),
      new THREE.MeshPhongMaterial({ map: loader.load('/textures/' + bp.texture), shininess: 14 })
    );
    this.scene.add(planetMesh);

    // Rings
    if (bp.hasRings) {
      const ringGeo = new THREE.RingGeometry(1.32, 2.42, 128);
      const rPos = ringGeo.attributes.position, rUV = ringGeo.attributes.uv;
      for (let i = 0; i < rPos.count; i++) {
        const x = rPos.getX(i), y = rPos.getY(i);
        rUV.setXY(i, (Math.sqrt(x * x + y * y) - 1.32) / 1.1, Math.atan2(y, x) / (Math.PI * 2));
      }
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: 0xc8a86a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
      }));
      ring.rotation.x = Math.PI / 2;
      planetMesh.add(ring);
      planetMesh.rotation.z = THREE.MathUtils.degToRad(26);
    }

    // Orbit lines
    const orbitLine = (radius, color, opacity, segs = 256) => {
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      this.scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      ));
    };
    orbitLine(bp.orbit, 0xaabbcc, 0.28);
    orbitLine(b.aDist, 0xffaa44, 0.30, 128);
    orbitLine(b.bDist, 0xff3300, 0.22, 128);

    this.meshNameMap.set(starAMesh, 'Kepler-16A');
    this.meshNameMap.set(starBMesh, 'Kepler-16B');
    this.meshNameMap.set(planetMesh, bp.name);
    this.clickableObjects.push(starAMesh, starBMesh, planetMesh);

    this._binary = {
      starA: starAMesh, starB: starBMesh, planet: planetMesh,
      starALight, starBLight,
      binaryAngle: 0, planetAngle: Math.PI * 0.7,
      aDist: b.aDist, bDist: b.bDist, binarySpeed: b.speed,
      planetSpeed: b.speed / bp.speedRatio,
      planetOrbit: bp.orbit,
    };
  }

  // ── ESCAPE SYSTEM (WASP-121) ─────────────────────────────────
  _initEscape(loader) {
    const cfg = this.config;
    const s = cfg.star;
    const ep = cfg.escapePlanet;

    // Star (same as standard)
    const starGeo = new THREE.SphereGeometry(s.radius, 64, 64);
    this.star = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({
      map: loader.load('/textures/sun.jpg'), color: new THREE.Color(...s.color),
    }));
    this.scene.add(this.star);
    this.clickableObjects.push(this.star);
    this.meshNameMap.set(this.star, cfg.name);

    this.scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(s.radius, 64, 64),
      new THREE.ShaderMaterial({ vertexShader: coronaVertexShader, fragmentShader: coronaFragmentShader(s.coronaInner, s.coronaOuter), transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    this.scene.add(new THREE.PointLight(s.lightColor, s.lightIntensity, 0, 0));
    this.scene.add(new THREE.AmbientLight(s.ambientColor, s.ambientIntensity));

    // Planet with tidal distortion shader
    const jupiterTex = loader.load('/textures/' + ep.texture);
    const planetMat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: jupiterTex }, uStarDir: { value: new THREE.Vector3(1, 0, 0) } },
      vertexShader: `
        uniform vec3 uStarDir; varying vec2 vUv; varying vec3 vWorldPos; varying vec3 vWorldNormal;
        void main() {
          vUv = uv;
          vec3 localStarDir = normalize((inverse(modelMatrix) * vec4(uStarDir, 0.0)).xyz);
          float alignment = dot(normalize(position), localStarDir);
          vec3 pos = position + localStarDir * alignment * 0.18 * length(position);
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz; vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }`,
      fragmentShader: `
        precision mediump float;
        uniform sampler2D uTex; uniform vec3 uStarDir;
        varying vec2 vUv; varying vec3 vWorldPos; varying vec3 vWorldNormal;
        void main() {
          vec3 baseColor = texture2D(uTex, vUv).rgb;
          float facing = dot(normalize(vWorldNormal), normalize(uStarDir - vWorldPos));
          float dayside = smoothstep(-0.1, 0.5, facing);
          vec3 hotColor = vec3(1.0, 0.65, 0.25) * 1.4;
          vec3 coldColor = baseColor * vec3(0.25, 0.08, 0.04);
          vec3 color = mix(coldColor, hotColor, dayside) + vec3(0.8, 0.4, 0.1) * dayside * 0.6;
          gl_FragColor = vec4(color, 1.0);
        }`,
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(ep.radius, 48, 48), planetMat);
    this.scene.add(planet);
    this.clickableObjects.push(planet);
    this.meshNameMap.set(planet, ep.name);

    // Atmospheric halo
    const haloMat = new THREE.ShaderMaterial({
      uniforms: { uStarDir: { value: new THREE.Vector3(1, 0, 0) } },
      vertexShader: `varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vWorldNormal;
        void main() { vNormal = normalize(normalMatrix * normal); vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vViewDir = normalize(-mvPos.xyz); gl_Position = projectionMatrix * mvPos; }`,
      fragmentShader: `precision mediump float; uniform vec3 uStarDir; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vWorldNormal;
        void main() { float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0); float a = pow(rim, 2.2) * 2.0;
        a *= (0.5 + 0.8 * max(dot(vWorldNormal, normalize(uStarDir)), 0.0));
        gl_FragColor = vec4(mix(vec3(1.0,0.5,0.1),vec3(1.0,0.8,0.3),rim), a * 0.45); }`,
      transparent: true, side: THREE.FrontSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    planet.add(new THREE.Mesh(new THREE.SphereGeometry(1.05, 48, 48), haloMat));

    // Orbit line
    const curve = new THREE.EllipseCurve(0, 0, ep.orbit, ep.orbit, 0, Math.PI * 2);
    this.scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(256).map(p => new THREE.Vector3(p.x, 0, p.y))),
      new THREE.LineBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.55 })
    ));

    // Atmospheric escape tail particles
    const N_TAIL = 2000;
    const tailGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(N_TAIL * 3);
    const colors = new Float32Array(N_TAIL * 3);
    const alphas = new Float32Array(N_TAIL);
    tailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tailGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    tailGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const tailMat = new THREE.ShaderMaterial({
      vertexShader: `attribute vec3 aColor; attribute float aAlpha; varying vec3 vColor; varying float vAlpha;
        void main() { vColor = aColor; vAlpha = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.5, 25.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `precision mediump float; varying vec3 vColor; varying float vAlpha;
        void main() { float d = length(gl_PointCoord - 0.5) * 2.0; gl_FragColor = vec4(vColor, vAlpha * (1.0 - smoothstep(0.0, 1.0, d))); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const tailParticles = new THREE.Points(tailGeo, tailMat);
    this.scene.add(tailParticles);

    this._escape = {
      planet, planetMat, haloMat,
      angle: 0, orbit: ep.orbit, speed: ep.speed,
      tailGeo, tailPositionAttr: tailGeo.getAttribute('position'),
      tailColorAttr: tailGeo.getAttribute('aColor'), tailAlphaAttr: tailGeo.getAttribute('aAlpha'),
      N_TAIL,
    };
  }

  // ── PULSAR SYSTEM (Lich) ─────────────────────────────────────
  _initPulsar(loader) {
    const cfg = this.config;

    // Pulsar
    const pulsar = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.95, 1.0) })
    );
    this.scene.add(pulsar);
    this.star = pulsar;
    this.clickableObjects.push(pulsar);
    this.meshNameMap.set(pulsar, 'PSR B1257+12');

    // Core glow
    this.scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader([0.85, 0.92, 1.0], [0.3, 0.45, 1.0], 2.2, 2.2),
        transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));

    // Pulse flash
    const pulseFlashMat = new THREE.MeshBasicMaterial({
      color: 0xaabbff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), pulseFlashMat));

    // Beam group
    const BEAM_TILT = Math.PI * 0.25;
    const beamGroup = new THREE.Group();
    beamGroup.rotation.x = BEAM_TILT;
    const beamLength = 14, beamRadius = 1.2;

    const createBeam = (direction) => {
      const beamMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying float vY; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vLocalPos;
          void main() { vY = position.y; vLocalPos = position; vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vViewDir = normalize(-mvPos.xyz); gl_Position = projectionMatrix * mvPos; }`,
        fragmentShader: `precision mediump float; uniform float time; varying float vY; varying vec3 vNormal; varying vec3 vViewDir; varying vec3 vLocalPos;
          void main() { float dist = abs(vY) / 14.0; float falloff = pow(1.0 - dist, 3.0);
          float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0); float edge = pow(rim, 1.2);
          float spiral = sin(atan(vLocalPos.x, vLocalPos.z) * 3.0 + dist * 12.0 - time * 8.0) * 0.5 + 0.5;
          spiral = mix(0.7, 1.0, spiral * (1.0 - dist));
          vec3 color = mix(vec3(0.5,0.7,1.0), vec3(0.2,0.3,0.9), edge);
          gl_FragColor = vec4(color, falloff * (0.25 + edge * 0.5) * spiral * 0.7); }`,
        transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const beam = new THREE.Mesh(new THREE.ConeGeometry(beamRadius, beamLength, 32, 1, true), beamMat);
      beam.position.y = direction * beamLength * 0.5;
      return beam;
    };
    beamGroup.add(createBeam(1));
    beamGroup.add(createBeam(-1));

    // Hotspot caps
    const hotspots = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vLocalPos; void main() { vLocalPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `precision mediump float; varying vec3 vLocalPos; void main() { float cap = smoothstep(0.6, 1.0, abs(vLocalPos.y) / 0.22); gl_FragColor = vec4(0.7, 0.85, 1.0, cap * 0.8); }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    beamGroup.add(hotspots);

    // Streaming particles
    const PARTICLE_COUNT = 400;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities = new Float32Array(PARTICLE_COUNT);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dir = i < PARTICLE_COUNT / 2 ? 1 : -1;
      const axisPos = Math.random() * beamLength * dir;
      const spread = (1.0 - Math.abs(axisPos) / beamLength) * beamRadius * 0.6;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * spread * Math.random();
      particlePositions[i * 3 + 1] = axisPos;
      particlePositions[i * 3 + 2] = Math.sin(angle) * spread * Math.random();
      particleVelocities[i] = dir;
      particleSpeeds[i] = 8 + Math.random() * 16;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleSystem = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0x6688ff, size: 0.1, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    beamGroup.add(particleSystem);

    // Magnetic field lines
    const fieldMat = new THREE.MeshBasicMaterial({ color: 0x7788dd, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    for (let i = 0; i < 8; i++) {
      const phi = (i / 8) * Math.PI * 2;
      const points = [];
      for (let theta = 0.1; theta < Math.PI - 0.1; theta += 0.05) {
        const r = 2.8 * Math.sin(theta) * Math.sin(theta);
        points.push(new THREE.Vector3(r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi)));
      }
      beamGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.025, 5, false), fieldMat));
    }
    this.scene.add(beamGroup);

    // Equatorial wind torus
    const torusUniforms = { time: { value: 0 } };
    const windTorus = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.4, 20, 48),
      new THREE.ShaderMaterial({
        uniforms: torusUniforms,
        vertexShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir;
          void main() { vUv = uv; vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vViewDir = normalize(-mvPos.xyz); gl_Position = projectionMatrix * mvPos; }`,
        fragmentShader: `precision mediump float; uniform float time; varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewDir;
          void main() { float rim = 1.0 - max(dot(vViewDir, vNormal), 0.0); float glow = pow(rim, 1.8);
          float swirl = sin(vUv.x * 25.0 + time * 3.0) * 0.5 + 0.5;
          vec3 color = mix(vec3(0.2,0.35,0.8), vec3(0.5,0.3,0.7), swirl);
          gl_FragColor = vec4(color, glow * 0.2 * (0.5 + swirl * 0.5) * (0.85 + 0.15 * sin(time * 5.0))); }`,
        transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    windTorus.rotation.x = Math.PI / 2;
    this.scene.add(windTorus);

    // Pulsing light
    const pulsarLight = new THREE.PointLight(0x8899ff, 2.0, 0, 0);
    this.scene.add(pulsarLight);
    this.scene.add(new THREE.AmbientLight(0x080810, 0.3));

    // Planets
    cfg.pulsarPlanets.forEach(data => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius, 32, 32),
        new THREE.MeshPhongMaterial({ map: loader.load('/textures/' + data.texture), shininess: 4, color: new THREE.Color(0.7, 0.72, 0.8) })
      );
      this.scene.add(mesh);
      this.clickableObjects.push(mesh);
      this.meshNameMap.set(mesh, data.name);
      const curve = new THREE.EllipseCurve(0, 0, data.orbit, data.orbit, 0, Math.PI * 2);
      this.scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(256).map(p => new THREE.Vector3(p.x, 0, p.y))),
        new THREE.LineBasicMaterial({ color: 0x667788, transparent: true, opacity: 0.3 })
      ));
      this.planets.push({ mesh, angle: Math.random() * Math.PI * 2, ...data });
    });

    this._pulsar = {
      beamGroup, beamAngle: 0, BEAM_TILT,
      pulsarLight, pulseFlashMat, torusUniforms,
      particleSystem, particlePositions, particleVelocities, particleSpeeds,
      PARTICLE_COUNT, beamLength,
      clock: new THREE.Clock(),
    };
  }

  // ── ANIMATE ──────────────────────────────────────────────────
  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate());
    if (!this.scene || !this.camera) return;

    const ts = this.timeScale;
    const dt = 0.016;

    switch (this.config.type) {
      case 'binary': this._animateBinary(ts, dt); break;
      case 'escape': this._animateEscape(ts, dt); break;
      case 'pulsar': this._animatePulsar(ts, dt); break;
      default: this._animateStandard(ts, dt); break;
    }

    this._updateFocusTransition();
    this.camMove.update(dt);
    this.controls.update();
    this.cinematicPass.uniforms.time.value = performance.now() / 1000;
    this.composer.render();
  }

  _animateStandard(ts, dt) {
    if (this.star) this.star.rotation.y += this.config.star.rotationSpeed * ts;

    // Flare system
    if (this._flare) {
      const fl = this._flare;
      fl.timer -= dt * ts;
      if (fl.timer <= 0 && !fl.active) {
        fl.active = true;
        fl.brightness = 1.0;
        fl.decayRate = 0.3 + Math.random() * 0.2;
        fl.sphere.scale.setScalar(1.5);
      }
      if (fl.active) {
        fl.brightness -= fl.decayRate * dt * ts;
        if (fl.brightness <= 0.01) {
          fl.brightness = 0; fl.active = false; fl.timer = 8 + Math.random() * 12;
        }
        fl.starMat.color.copy(fl.baseColor).lerp(fl.flareColor, fl.brightness);
        fl.starLight.intensity = fl.baseLightIntensity + 5.5 * fl.brightness;
        fl.sphereMat.opacity = fl.brightness * 0.5;
        fl.sphere.scale.setScalar(1.5 + (1.0 - fl.brightness) * 3.0);
      } else {
        fl.starMat.color.copy(fl.baseColor);
        fl.starLight.intensity = fl.baseLightIntensity;
        fl.sphereMat.opacity = 0;
      }
    }

    this.planets.forEach(p => {
      p.angle += p.speed * 0.25 * ts;
      p.mesh.position.set(p.orbit * Math.cos(p.angle), 0, p.orbit * Math.sin(p.angle));
      if (p.tidallyLocked) {
        p.mesh.rotation.y = p.angle + Math.PI;
      } else {
        p.mesh.rotation.y += 0.0015 * ts;
      }
    });
  }

  _animateBinary(ts, dt) {
    const b = this._binary;
    b.binaryAngle += b.binarySpeed * 0.25 * ts;
    b.planetAngle += b.planetSpeed * 0.25 * ts;

    b.starA.position.set(Math.cos(b.binaryAngle) * b.aDist, 0, Math.sin(b.binaryAngle) * b.aDist);
    b.starB.position.set(Math.cos(b.binaryAngle + Math.PI) * b.bDist, 0, Math.sin(b.binaryAngle + Math.PI) * b.bDist);
    b.starALight.position.copy(b.starA.position);
    b.starBLight.position.copy(b.starB.position);
    b.starA.rotation.y += 0.00015 * ts;
    b.starB.rotation.y += 0.00030 * ts;

    b.planet.position.set(Math.cos(b.planetAngle) * b.planetOrbit, 0, Math.sin(b.planetAngle) * b.planetOrbit);
    b.planet.rotation.y += 0.0006 * ts;
  }

  _animateEscape(ts, dt) {
    if (this.star) this.star.rotation.y += 0.0002 * ts;
    const e = this._escape;
    e.angle += e.speed * 0.25 * ts;
    const px = e.orbit * Math.cos(e.angle), pz = e.orbit * Math.sin(e.angle);
    e.planet.position.set(px, 0, pz);
    e.planet.rotation.y += 0.001 * ts;

    // Update shader uniforms
    e.planetMat.uniforms.uStarDir.value.copy(this.star.position);
    const halo = e.planet.children[0];
    if (halo?.material?.uniforms?.uStarDir) halo.material.uniforms.uStarDir.value.copy(this.star.position);

    // Update tail particles
    const antiStar = e.planet.position.clone().sub(this.star.position).normalize();
    const pos = e.tailPositionAttr.array, col = e.tailColorAttr.array, alp = e.tailAlphaAttr.array;
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(antiStar, up).normalize();
    const actualUp = new THREE.Vector3().crossVectors(right, antiStar).normalize();

    for (let i = 0; i < e.N_TAIL; i++) {
      const seed = i * 2654435761 >>> 0;
      const progress = (seed % 1000) / 1000;
      const dist = progress * 12.0;
      const spread = dist * 0.15;
      const offX = ((seed * 7) % 1000) / 500 - 1;
      const offY = ((seed * 13) % 1000) / 500 - 1;
      const offZ = ((seed * 19) % 1000) / 500 - 1;
      const base = e.planet.position.clone().add(antiStar.clone().multiplyScalar(dist + 0.9));
      base.add(right.clone().multiplyScalar(offX * spread));
      base.add(actualUp.clone().multiplyScalar(offY * spread));
      base.add(antiStar.clone().multiplyScalar(offZ * spread));
      pos[i * 3] = base.x; pos[i * 3 + 1] = base.y; pos[i * 3 + 2] = base.z;
      const fade = 1.0 - progress;
      col[i * 3] = 1.0; col[i * 3 + 1] = 0.35 + 0.3 * fade; col[i * 3 + 2] = 0.05 + 0.15 * fade;
      alp[i] = fade * fade * 0.3;
    }
    e.tailPositionAttr.needsUpdate = true;
    e.tailColorAttr.needsUpdate = true;
    e.tailAlphaAttr.needsUpdate = true;
  }

  _animatePulsar(ts, dt) {
    const p = this._pulsar;
    const t = p.clock.getElapsedTime();

    p.beamAngle += 15.7 * dt * ts;
    p.beamGroup.rotation.y = p.beamAngle;
    p.pulsarLight.intensity = 2.0 + 1.5 * Math.abs(Math.sin(p.beamAngle));

    // Pulse flash
    const beamDir = new THREE.Vector3(0, 1, 0);
    beamDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), p.BEAM_TILT);
    beamDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), p.beamAngle);
    const camDir = this.camera.position.clone().normalize();
    const maxDot = Math.max(beamDir.dot(camDir), -beamDir.dot(camDir));
    const flashIntensity = Math.pow(Math.max(0, maxDot - 0.7) / 0.3, 2.0);
    p.pulseFlashMat.opacity = flashIntensity * 0.3;
    this._bloomPass.strength = this.config.bloom.strength + flashIntensity * 0.6;

    // Beam shader time
    p.beamGroup.children.forEach(c => { if (c.material?.uniforms?.time) c.material.uniforms.time.value = t; });

    // Streaming particles
    const arr = p.particleSystem.geometry.getAttribute('position').array;
    for (let i = 0; i < p.PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += p.particleVelocities[i] * p.particleSpeeds[i] * dt * ts;
      if (Math.abs(arr[i * 3 + 1]) > p.beamLength) {
        const dir = p.particleVelocities[i];
        const angle = Math.random() * Math.PI * 2;
        const spread = Math.random() * 0.4;
        arr[i * 3] = Math.cos(angle) * spread;
        arr[i * 3 + 1] = dir * Math.random() * 2;
        arr[i * 3 + 2] = Math.sin(angle) * spread;
      }
    }
    p.particleSystem.geometry.getAttribute('position').needsUpdate = true;
    p.torusUniforms.time.value = t;

    // Planets
    this.planets.forEach(pl => {
      pl.angle += pl.speed * 0.25 * ts;
      pl.mesh.position.set(pl.orbit * Math.cos(pl.angle), 0, pl.orbit * Math.sin(pl.angle));
      pl.mesh.rotation.y += 0.001 * ts;
    });
  }

  // ── FOCUS TRANSITION ─────────────────────────────────────────
  _updateFocusTransition() {
    if (this.focusTransition) {
      if (this.lockedMesh && this.lastLockedPos) {
        const newPos = this.lockedMesh.getWorldPosition(new THREE.Vector3());
        const delta = newPos.clone().sub(this.lastLockedPos);
        this.focusTransition.endCam.add(delta);
        this.focusTransition.endTarget.add(delta);
        this.lastLockedPos = newPos.clone();
      }
      const elapsed = performance.now() - this.focusTransition.startTime;
      const t = Math.min(elapsed / this.focusTransition.duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.controls.target.lerpVectors(this.focusTransition.startTarget, this.focusTransition.endTarget, ease);
      this.camera.position.lerpVectors(this.focusTransition.startCam, this.focusTransition.endCam, ease);
      if (t >= 1) this.focusTransition = null;
    } else if (this.lockedMesh) {
      const newPos = this.lockedMesh.getWorldPosition(new THREE.Vector3());
      const delta = newPos.clone().sub(this.lastLockedPos);
      this.camera.position.add(delta);
      this.controls.target.add(delta);
      this.lastLockedPos = newPos.clone();
    }
  }

  focusOn(nameOrMesh) {
    let mesh;
    if (typeof nameOrMesh === 'string') {
      for (const [m, n] of this.meshNameMap) { if (n === nameOrMesh) { mesh = m; break; } }
    } else { mesh = nameOrMesh; }
    if (!mesh) return;

    const clickedPos = mesh.getWorldPosition(new THREE.Vector3());
    let endCam;
    const isStar = mesh === this.star || (this._binary && (mesh === this._binary.starA || mesh === this._binary.starB));

    if (isStar) {
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      const pullBack = this._binary ? (mesh === this._binary.starA ? 12 : 6) : 6;
      endCam = clickedPos.clone().add(dir.multiplyScalar(pullBack));
    } else {
      const pd = this.planets.find(p => p.mesh === mesh);
      const dist = Math.max(2.0, pd ? pd.radius * 8 : 2.0);
      const toStarDir = clickedPos.clone().normalize().negate();
      endCam = clickedPos.clone().add(toStarDir.multiplyScalar(dist));
    }

    this.lockedMesh = mesh;
    this.lastLockedPos = clickedPos.clone();
    const pd = this.planets.find(p => p.mesh === mesh);
    this.controls.minDistance = (isStar ? (this.config.star?.radius || 1.0) : (pd ? pd.radius : 0.25)) * 1.5;
    if (this.cbFocus) this.cbFocus(this.meshNameMap.get(mesh));

    this.focusTransition = {
      startCam: this.camera.position.clone(), endCam,
      startTarget: this.controls.target.clone(), endTarget: clickedPos.clone(),
      startTime: performance.now(), duration: this.TRANSITION_DURATION,
    };
  }

  // ── EVENT HANDLERS ───────────────────────────────────────────
  _handleClick(event) {
    if (event.detail === 0) return;
    this._mouseCoords(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableObjects, true);
    if (hits.length > 0) {
      const obj = hits[0].object;
      const target = this.meshNameMap.has(obj) ? obj : obj.parent;
      if (this.meshNameMap.has(target)) this.focusOn(target);
    }
  }

  _handleMouseMove(event) {
    this._mouseCoords(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableObjects, true);
    if (hits.length > 0) {
      const obj = hits[0].object;
      const name = this.meshNameMap.get(obj) ?? this.meshNameMap.get(obj.parent);
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'default';
    }
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  getObjects() {
    const objs = [];
    for (const [mesh, name] of this.meshNameMap) {
      objs.push({ name, mesh });
    }
    return objs;
  }

  setTimeScale(v) { this.timeScale = v; }

  resize() {
    const { w, h } = this._dims();
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.composer) this.composer.setSize(w, h);
  }

  dispose() {
    if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('click', this._onClick);
      this.renderer.domElement.removeEventListener('mousemove', this._onMouseMove);
      this.renderer.domElement.style.cursor = 'default';
    }
    if (this.camMove) this.camMove.dispose();
    if (this.controls) this.controls.dispose();
    if (this.scene) this.scene.clear();
    this.lockedMesh = null;
    this.lastLockedPos = null;
    this.focusTransition = null;
    this._flare = null;
    this._binary = null;
    this._escape = null;
    this._pulsar = null;
    this.planets = [];
    this.clickableObjects = [];
    this.meshNameMap = new Map();
    this.config = null;
  }

  destroy() {
    this.dispose();
    this._resizeObs.disconnect();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) this.renderer.dispose();
  }
}

// ═══════════════════════════════════════════════════════════════
// TEXTURE MATCHING — generate dynamic views from pipeline data
// ═══════════════════════════════════════════════════════════════

// Map stellar Teff to closest star visual properties
// Note: radii and intensities are kept moderate for candidate detail views
function teffToStarConfig(teff) {
  if (!teff || teff <= 0) teff = 5778; // default Sun-like
  if (teff < 3000) {
    return { color: [1.0, 0.18, 0.02], coronaInner: [1.0, 0.35, 0.05], coronaOuter: [0.7, 0.08, 0.0], lightColor: 0xff5511, lightIntensity: 1.8, radius: 0.7 };
  } else if (teff < 3500) {
    return { color: [1.0, 0.28, 0.06], coronaInner: [1.0, 0.45, 0.12], coronaOuter: [0.8, 0.12, 0.02], lightColor: 0xff6622, lightIntensity: 1.6, radius: 0.8 };
  } else if (teff < 4000) {
    return { color: [1.0, 0.35, 0.10], coronaInner: [1.0, 0.40, 0.12], coronaOuter: [0.7, 0.10, 0.02], lightColor: 0xff5522, lightIntensity: 1.5, radius: 0.9 };
  } else if (teff < 4800) {
    return { color: [1.0, 0.70, 0.25], coronaInner: [1.0, 0.75, 0.25], coronaOuter: [0.9, 0.35, 0.05], lightColor: 0xffaa44, lightIntensity: 1.6, radius: 1.0 };
  } else if (teff < 5500) {
    return { color: [1.0, 0.82, 0.45], coronaInner: [1.0, 0.85, 0.4], coronaOuter: [1.0, 0.55, 0.1], lightColor: 0xffd080, lightIntensity: 1.6, radius: 1.1 };
  } else if (teff < 6200) {
    return { color: [1.0, 0.92, 0.65], coronaInner: [1.0, 0.95, 0.7], coronaOuter: [1.0, 0.7, 0.2], lightColor: 0xfff0d0, lightIntensity: 1.8, radius: 1.2 };
  } else if (teff < 7000) {
    return { color: [0.95, 0.95, 1.0], coronaInner: [1.0, 0.98, 0.90], coronaOuter: [0.75, 0.80, 1.0], lightColor: 0xfff5e8, lightIntensity: 2.0, radius: 1.3 };
  } else {
    return { color: [0.82, 0.92, 1.0], coronaInner: [0.85, 0.95, 1.0], coronaOuter: [0.4, 0.65, 1.0], lightColor: 0xd0e8ff, lightIntensity: 2.2, radius: 1.4 };
  }
}

// Map planet type / radius to closest texture
function planetToTexture(planetType, radiusEarth) {
  if (!planetType && !radiusEarth) return 'earth_daymap.jpg';
  const type = (planetType || '').toLowerCase();
  if (type.includes('rocky') || type.includes('terrestrial')) {
    return radiusEarth < 1.0 ? 'mercury.jpg' : radiusEarth < 1.5 ? 'mars.jpg' : 'venus.jpg';
  }
  if (type.includes('super-earth') || type.includes('super earth')) {
    return radiusEarth < 1.8 ? 'earth_daymap.jpg' : 'venus.jpg';
  }
  if (type.includes('sub-neptune') || type.includes('sub neptune') || type.includes('mini-neptune')) {
    return 'neptune.jpg';
  }
  if (type.includes('neptune')) return 'uranus.jpg';
  if (type.includes('jupiter') || type.includes('gas giant')) return 'jupiter.jpg';
  // Fallback by radius
  if (radiusEarth) {
    if (radiusEarth < 1.0) return 'mercury.jpg';
    if (radiusEarth < 1.5) return 'mars.jpg';
    if (radiusEarth < 2.0) return 'earth_daymap.jpg';
    if (radiusEarth < 4.0) return 'neptune.jpg';
    if (radiusEarth < 8.0) return 'uranus.jpg';
    return 'jupiter.jpg';
  }
  return 'earth_daymap.jpg';
}

// Determine planet zone from insolation or Teq
function candidateZone(candidate) {
  if (candidate.hz_status && candidate.hz_status.toLowerCase().includes('habitable')) return 'habitable';
  const teq = candidate.teq_k;
  if (teq) {
    if (teq > 1500) return 'lava';
    if (teq > 600) return 'hot';
    if (teq > 350) return 'warm';
    if (teq > 180) return 'habitable';
    return 'cold';
  }
  const insol = candidate.insolation_earth;
  if (insol) {
    if (insol > 10) return 'hot';
    if (insol > 1.5) return 'warm';
    if (insol > 0.3) return 'habitable';
    return 'cold';
  }
  return 'warm';
}

// Spectral class string from Teff
function teffToSpectralClass(teff) {
  if (!teff) return 'Unknown';
  if (teff < 3000) return 'M-type Red Dwarf';
  if (teff < 3500) return 'M-type Red Dwarf';
  if (teff < 4000) return 'Late K / Early M';
  if (teff < 4800) return 'K-type Orange Dwarf';
  if (teff < 5500) return 'Late G-type';
  if (teff < 6200) return 'G-type Sun-like';
  if (teff < 7000) return 'F-type White';
  return 'A-type Blue-white';
}

/**
 * Generate a system config from a pipeline candidate.
 * The candidate object should have fields like: tic_id, planet_num,
 * period_days, stellar_teff, stellar_radius, stellar_mass,
 * rp_rearth, planet_type, hz_status, teq_k, insolation_earth, etc.
 */
export function generateSystemFromCandidate(candidate) {
  const teff = candidate.stellar_teff || 5000;
  const starCfg = teffToStarConfig(teff);
  const planetTexture = planetToTexture(candidate.planet_type, candidate.rp_rearth);
  const zone = candidateZone(candidate);

  // Visual planet radius (scene units) — scale by Earth radii
  const rp = candidate.rp_rearth || 1.0;
  const visualRadius = Math.max(0.12, Math.min(0.9, rp * 0.18));

  // Orbital distance: spread nicely in scene units
  const orbitRadius = 5.0;

  // Orbital speed: derive from period (faster orbits = shorter period)
  const period = candidate.period_days || 10;
  const speed = 0.003 / Math.sqrt(period / 10);

  const systemId = `candidate-${candidate.tic_id}-${candidate.planet_num || 1}`;
  const systemName = `TIC ${candidate.tic_id}`;
  const distance = candidate.distance_pc ? `${Math.round(candidate.distance_pc)} pc` : 'Unknown';

  const config = {
    name: systemName,
    id: systemId,
    type: 'standard',
    starType: teffToSpectralClass(teff),
    distance: distance,
    nPlanets: 1,
    notable: candidate.planet_type ? `${candidate.planet_type} candidate` : 'Transit candidate',
    description: `Pipeline candidate from TESS sector data. Period: ${period.toFixed(2)} days.${candidate.rp_rearth ? ` Estimated radius: ${candidate.rp_rearth.toFixed(2)} R⊕.` : ''}`,
    star: {
      radius: starCfg.radius,
      color: starCfg.color,
      coronaInner: starCfg.coronaInner,
      coronaOuter: starCfg.coronaOuter,
      lightColor: starCfg.lightColor,
      lightIntensity: starCfg.lightIntensity + 1.0,
      ambientColor: 0x2a2520,
      ambientIntensity: 0.8,
      rotationSpeed: 0.00005,
    },
    camera: { position: [0, 5, 14], maxDistance: 200 },
    bloom: { strength: 0.4, threshold: 0.75 },
    planets: [{
      name: `Planet ${candidate.planet_num || 'b'}`,
      texture: planetTexture,
      radius: visualRadius,
      orbit: orbitRadius,
      speed: speed,
      zone: zone,
    }],
  };

  // Register dynamically so SystemView can init it
  SYSTEMS[systemId] = config;
  return systemId;
}
