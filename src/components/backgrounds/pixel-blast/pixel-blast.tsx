"use client";
// Adapted from React Bits PixelBlast (David Haz). See LICENSE.md and SOURCE.md.
import type { Effect, EffectComposer } from 'postprocessing';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './pixel-blast.module.css';

type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond';

interface TouchPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  force: number;
  age: number;
}

interface TouchTexture {
  canvas: HTMLCanvasElement;
  texture: THREE.Texture;
  addTouch: (norm: { x: number; y: number }) => void;
  update: () => void;
  radiusScale: number;
  size: number;
}


export type PixelBlastProps = {
  maxDpr?: number;
  seed?: number;
  variant?: PixelBlastVariant;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

const createTouchTexture = (): TouchTexture => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const trail: TouchPoint[] = [];
  let last: { x: number; y: number } | null = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const drawPoint = (p: TouchPoint) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t: number) => -t * (t - 2);
    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  const addTouch = (norm: { x: number; y: number }) => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 10000, 1);
    }
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };
  return {
    canvas,
    texture,
    addTouch,
    update,
    set radiusScale(v: number) {
      radius = 0.1 * size * v;
    },
    get radiusScale() {
      return radius / (0.1 * size);
    },
    size
  };
};

const createLiquidEffect = (EffectClass: typeof import('postprocessing').Effect, texture: THREE.Texture, opts?: { strength?: number; freq?: number }) => {
  const fragment = `
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;

    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;

      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

      float amt = uStrength * intensity * wave;

      uv += vec2(vx, vy) * amt;
    }
    `;
  return new EffectClass('LiquidEffect', fragment, {
    uniforms: new Map<string, THREE.Uniform>([
      ['uTexture', new THREE.Uniform(texture)],
      ['uStrength', new THREE.Uniform(opts?.strength ?? 0.025)],
      ['uTime', new THREE.Uniform(0)],
      ['uFreq', new THREE.Uniform(opts?.freq ?? 4.5)]
    ])
  });
};

const SHAPE_MAP: Record<PixelBlastVariant, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3
};

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  // sRGB gamma correction - convert linear to sRGB for accurate color output
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

const MAX_CLICKS = 10;
// Software WebGL renders this decorative field in long main-thread tasks; such
// visitors keep the static fallback field instead.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;
const idle = (callback: () => void, timeout: number) => window.requestIdleCallback
  ? window.requestIdleCallback(callback, { timeout })
  : window.setTimeout(callback, 1);
const cancelIdle = (handle: number) => window.cancelIdleCallback ? window.cancelIdleCallback(handle) : window.clearTimeout(handle);

type Uniforms = {
  uResolution: { value: THREE.Vector2 }; uTime: { value: number }; uColor: { value: THREE.Color };
  uClickPos: { value: THREE.Vector2[] }; uClickTimes: { value: Float32Array };
  uShapeType: { value: number }; uPixelSize: { value: number }; uScale: { value: number }; uDensity: { value: number };
  uPixelJitter: { value: number }; uEnableRipples: { value: number }; uRippleSpeed: { value: number };
  uRippleThickness: { value: number }; uRippleIntensity: { value: number }; uEdgeFade: { value: number };
};
type Engine = {
  canvas: HTMLCanvasElement; renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial; geometry: THREE.PlaneGeometry; uniforms: Uniforms;
  detachCurrent: (() => void) | null; onLost: (() => void) | null; release: number; size: string;
};

// One WebGL context and one compiled shader for the whole visit. Every hero preset
// is a set of uniforms, so a route change moves the canvas into the next hero and
// updates its uniforms instead of destroying one context and building another
// (together about 0.4s of main-thread work per navigation). The context is released
// only when no hero has claimed it for 2s (reduced motion, pages without a hero).
let engine: Engine | null = null;

function createEngine(): Engine | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
  if (!context) return null;
  const lose = () => context.getExtension('WEBGL_lose_context')?.loseContext();
  const info = context.getExtension('WEBGL_debug_renderer_info');
  if (SOFTWARE_RENDERER.test(String(context.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : context.RENDERER)))) { lose(); return null; }
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false }); }
  catch { lose(); return null; }
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.pixelCanvas = '';
  const uniforms: Uniforms = {
    uResolution: { value: new THREE.Vector2() }, uTime: { value: 0 }, uColor: { value: new THREE.Color() },
    uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
    uClickTimes: { value: new Float32Array(MAX_CLICKS) },
    uShapeType: { value: 0 }, uPixelSize: { value: 1 }, uScale: { value: 1 }, uDensity: { value: 1 },
    uPixelJitter: { value: 0 }, uEnableRipples: { value: 0 }, uRippleSpeed: { value: 0 },
    uRippleThickness: { value: 0 }, uRippleIntensity: { value: 0 }, uEdgeFade: { value: 0 },
  };
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({ vertexShader: VERTEX_SRC, fragmentShader: FRAGMENT_SRC,
    uniforms, transparent: true, depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3 });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  const created: Engine = { canvas, renderer, scene, camera, material, geometry, uniforms, detachCurrent: null, onLost: null, release: 0, size: '' };
  canvas.addEventListener('webglcontextlost', () => {
    if (engine === created) engine = null;
    window.clearTimeout(created.release);
    const lost = created.onLost; created.onLost = null; lost?.();
    geometry.dispose(); material.dispose(); scene.clear(); renderer.dispose();
  });
  return created;
}

function scheduleRelease(e: Engine) {
  window.clearTimeout(e.release);
  e.release = window.setTimeout(() => idle(() => {
    if (e.detachCurrent || engine !== e) return;
    engine = null;
    e.geometry.dispose(); e.material.dispose(); e.scene.clear(); e.renderer.dispose(); e.renderer.forceContextLoss();
  }, 1000), 2000);
}

type AttachOptions = Required<Pick<PixelBlastProps, 'variant' | 'pixelSize' | 'patternScale' | 'patternDensity' | 'liquid' | 'liquidStrength' |
  'liquidRadius' | 'pixelSizeJitter' | 'enableRipples' | 'rippleIntensityScale' | 'rippleThickness' | 'rippleSpeed' | 'liquidWobbleSpeed' |
  'autoPauseOffscreen' | 'speed' | 'transparent' | 'edgeFade' | 'noiseAmount' | 'maxDpr' | 'seed'>> & { color?: string };

function attach(container: HTMLDivElement, o: AttachOptions): () => void {
  engine ??= createEngine();
  const e = engine;
  if (!e) { container.dataset.state = 'fallback'; return () => {}; }
  window.clearTimeout(e.release);
  e.detachCurrent?.();
  const { canvas, renderer, scene, camera, uniforms } = e;
  const hero = container.closest<HTMLElement>('[data-pixel-hero]');
  let detached = false, visible = true, raf = 0, lastFrame = 0, elapsed = o.seed, clickIx = 0;
  const ratio = Math.min(window.devicePixelRatio || 1, o.maxDpr, 2);
  renderer.setClearColor(0x000000, o.transparent ? 0 : 1);
  uniforms.uTime.value = elapsed;
  uniforms.uColor.value.set(o.color || getComputedStyle(container).getPropertyValue('--accent').trim());
  uniforms.uClickPos.value.forEach(point => point.set(-1, -1));
  uniforms.uClickTimes.value.fill(0);
  uniforms.uShapeType.value = SHAPE_MAP[o.variant];
  uniforms.uPixelSize.value = o.pixelSize * ratio;
  uniforms.uScale.value = o.patternScale; uniforms.uDensity.value = o.patternDensity;
  uniforms.uPixelJitter.value = o.pixelSizeJitter; uniforms.uEnableRipples.value = o.enableRipples ? 1 : 0;
  uniforms.uRippleSpeed.value = o.rippleSpeed; uniforms.uRippleThickness.value = o.rippleThickness;
  uniforms.uRippleIntensity.value = o.rippleIntensityScale; uniforms.uEdgeFade.value = o.edgeFade;
  container.appendChild(canvas);
  // The normal hero path has no composer, render targets, or touch texture.
  let composer: EffectComposer | undefined;
  let touch: TouchTexture | undefined;
  const effects: Effect[] = [];
  if (o.liquid || o.noiseAmount > 0) {
    // None of the public hero presets needs this optional rendering pipeline.
    void import('postprocessing').then(({ Effect, EffectComposer, EffectPass, RenderPass }) => {
      if (detached) return;
      composer = new EffectComposer(renderer, { multisampling: 0 });
      composer.addPass(new RenderPass(scene, camera));
      if (o.liquid) {
        touch = createTouchTexture(); touch.radiusScale = o.liquidRadius;
        effects.push(createLiquidEffect(Effect, touch.texture, { strength: o.liquidStrength, freq: o.liquidWobbleSpeed }));
      }
      if (o.noiseAmount > 0) effects.push(new Effect('NoiseEffect',
        `uniform float uTime; uniform float uAmount; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float n=hash(floor(uv*vec2(1920.,1080.))+floor(uTime*60.));outputColor=inputColor+vec4(vec3((n-.5)*uAmount),0.);}`,
        { uniforms: new Map<string, THREE.Uniform>([['uTime', new THREE.Uniform(0)], ['uAmount', new THREE.Uniform(o.noiseAmount)]]) }));
      composer.addPass(new EffectPass(camera, ...effects));
      composer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    });
  }
  // Resizing reallocates the drawing buffer; do it only when the size or ratio changed
  // (heroes of the same size reuse the buffer as-is).
  // A hero that is not laid out yet (mid route commit) measures 0x0: keep the current
  // buffer rather than shrinking it to 1x1 and growing it back (a ~200ms reallocation).
  const resize = () => {
    const width = container.clientWidth, height = container.clientHeight, size = `${width}x${height}@${ratio}`;
    if (!width || !height) return;
    if (size !== e.size) {
      e.size = size;
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(canvas.width, canvas.height);
    }
    composer?.setSize(width, height);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const render = (now: number) => {
    raf = 0;
    if (detached || document.hidden || (o.autoPauseOffscreen && !visible)) return;
    // Cap at 30fps and freeze time while hidden; no catch-up bursts on return.
    if (!lastFrame || now - lastFrame >= 1000 / 30) {
      elapsed += lastFrame ? Math.min((now - lastFrame) / 1000, .1) * o.speed : 0;
      lastFrame = now; uniforms.uTime.value = elapsed;
      effects.forEach(effect => { const time = effect.uniforms.get('uTime'); if (time) time.value = elapsed; });
      touch?.update();
      if (composer) composer.render(); else renderer.render(scene, camera);
      container.dataset.state = 'running';
    }
    raf = requestAnimationFrame(render);
  };
  const syncVisibility = () => {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    if (!detached && !document.hidden && (!o.autoPauseOffscreen || visible)) raf = requestAnimationFrame(render);
    else container.dataset.state = 'paused';
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncVisibility(); });
  if (o.autoPauseOffscreen) observer.observe(container);
  document.addEventListener('visibilitychange', syncVisibility);
  const safePointer = (event: PointerEvent) => {
    if (event.target instanceof Element && event.target.closest('a,button,input,textarea,select,label,[role="button"],[contenteditable]')) return false;
    const rect = canvas.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  };
  const point = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: 1 - (event.clientY - rect.top) / rect.height };
  };
  const pointerDown = (event: PointerEvent) => {
    if (!o.enableRipples || !safePointer(event)) return;
    const p = point(event);
    uniforms.uClickPos.value[clickIx].set(p.x * canvas.width, p.y * canvas.height);
    uniforms.uClickTimes.value[clickIx] = elapsed;
    clickIx = (clickIx + 1) % MAX_CLICKS;
  };
  const pointerMove = (event: PointerEvent) => { if (touch && safePointer(event)) touch.addTouch(point(event)); };
  // Observe bubbling hero events without intercepting links, scrolling, or taps.
  hero?.addEventListener('pointerdown', pointerDown, { passive: true });
  if (o.liquid) hero?.addEventListener('pointermove', pointerMove, { passive: true });
  const detach = () => {
    if (detached) return;
    detached = true; cancelAnimationFrame(raf);
    observer.disconnect(); resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', syncVisibility);
    hero?.removeEventListener('pointerdown', pointerDown); hero?.removeEventListener('pointermove', pointerMove);
    composer?.dispose(); touch?.texture.dispose();
    if (canvas.parentNode === container) canvas.remove();
    if (e.detachCurrent === detach) { e.detachCurrent = null; e.onLost = null; scheduleRelease(e); }
  };
  e.detachCurrent = detach;
  e.onLost = () => { detach(); container.dataset.state = 'fallback'; };
  syncVisibility();
  return detach;
}

export default function PixelBlast({
  variant = 'square', pixelSize = 5, color, className, style,
  patternScale = 3, patternDensity = .8,
  liquid = false, liquidStrength = .025, liquidRadius = 1,
  pixelSizeJitter = .2, enableRipples = true, rippleIntensityScale = 1,
  rippleThickness = .09, rippleSpeed = .3, liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true, speed = .3, transparent = true,
  edgeFade = .35, noiseAmount = 0, maxDpr = 1.5, seed = 32,
}: PixelBlastProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const options: AttachOptions = { variant, pixelSize, color, patternScale, patternDensity, liquid, liquidStrength, liquidRadius,
      pixelSizeJitter, enableRipples, rippleIntensityScale, rippleThickness, rippleSpeed, liquidWobbleSpeed,
      autoPauseOffscreen, speed, transparent, edgeFade, noiseAmount, maxDpr, seed };
    // A warm engine attaches at once (the hero keeps running across navigations).
    // Building the first one waits until the page has painted; the static field
    // shows meanwhile.
    if (engine) return attach(container, options);
    let detach: (() => void) | undefined;
    const pending = idle(() => { detach = attach(container, options); }, 600);
    return () => { cancelIdle(pending); detach?.(); };
  }, [variant, pixelSize, color, patternScale, patternDensity, liquid, liquidStrength,
    liquidRadius, pixelSizeJitter, enableRipples, rippleIntensityScale, rippleThickness, rippleSpeed,
    liquidWobbleSpeed, autoPauseOffscreen, speed, transparent, edgeFade, noiseAmount, maxDpr, seed]);
  return <div ref={containerRef} className={`${styles.field} ${className ?? ''}`} style={style} aria-hidden="true" data-pixel-engine="" />;
}
