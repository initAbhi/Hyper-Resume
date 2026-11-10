'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useSyncExternalStore,
} from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NeonRevealProps {
  colors?: [string, string];
  backgroundColor?: string;
  direction?: 'down' | 'up' | 'left' | 'right';
  expandFrom?: 'center' | 'left' | 'right';
  trigger?: 'mount' | 'inView' | 'manual';
  revealDelay?: number;
  revealDuration?: number;
  easing?: 'out' | 'smooth' | 'gentle' | 'linear';
  thickness?: number;
  glow?: number;
  spill?: number;
  reach?: number;
  intensity?: number;
  feather?: number;
  inset?: number;
  length?: number;
  mirrored?: boolean;
  hum?: number;
  flicker?: number;
  interactive?: boolean;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
  scrollThreshold?: number;
  onStart?: () => void;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface NeonRevealHandle {
  replay: () => void;
}

// ============================================================================
// MATH & COLOR UTILITIES
// ============================================================================

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const num = (val: unknown, fallback: number) => (typeof val === 'number' && Number.isFinite(val) ? val : fallback);
const smoothstep = (min: number, max: number, val: number) => {
  const t = clamp((val - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
};

const easings: Record<string, (t: number) => number> = {
  out: (t) => 1 - Math.pow(1 - t, 3),
  smooth: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  gentle: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  linear: (t) => t,
};

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    let e = (t = (t + 0x6d2b79f5) >>> 0);
    e = Math.imul(e ^ (e >>> 15), 1 | e);
    return (((e ^= e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ (e >>> 14)) >>> 0) / 0x100000000;
  };
};

const scratchColor = new THREE.Color();
const parseColor = (str: string): [[number, number, number], number] | null => {
  const t = str.trim().toLowerCase();
  if (!t || t === 'transparent' || t === 'none' || t === 'auto') return null;

  const rgba = /^rgba?\(([^)]+)\)$/.exec(t);
  if (rgba) {
    const parts = rgba[1].split(/[\s,/]+/).filter(Boolean).map((n) => Number.parseFloat(n));
    const alpha = parts.length > 3 && Number.isFinite(parts[3]) ? clamp(parts[3], 0, 1) : 1;
    return [[(parts[0] ?? 0) / 255, (parts[1] ?? 0) / 255, (parts[2] ?? 0) / 255], alpha];
  }

  try {
    scratchColor.setStyle(t);
  } catch {
    return null;
  }
  return [[scratchColor.r, scratchColor.g, scratchColor.b], 1];
};

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

const rgbToOklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const aLab = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return [0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_, Math.hypot(aLab, bLab), Math.atan2(bLab, aLab)];
};

const oklabToLinear = ([L, C, h]: [number, number, number]): [number, number, number] => {
  const l_ = C * Math.cos(h);
  const m_ = C * Math.sin(h);
  const r = Math.pow(L + 0.3963377774 * l_ + 0.2158037573 * m_, 3);
  const o = Math.pow(L - 0.1055613458 * l_ - 0.0638541728 * m_, 3);
  const i = Math.pow(L - 0.0894841775 * l_ - 1.291485548 * m_, 3);
  return [
    4.0767416621 * r - 3.3077115913 * o + 0.2309699292 * i,
    -1.2684380046 * r + 2.6097574011 * o - 0.3413193965 * i,
    -0.0041960863 * r - 0.7034186147 * o + 1.707614701 * i,
  ];
};

const gamutClamp = (L: number, C: number, h: number): [number, number, number] => {
  const inGamut = (c: number) => oklabToLinear([L, c, h]).every((v) => v >= -0.0005 && v <= 1.0005);
  if (inGamut(C)) return [L, C, h];
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(mid)) lo = mid;
    else hi = mid;
  }
  return [L, lo, h];
};

const toSrgb = (lch: [number, number, number]): [number, number, number] =>
  oklabToLinear(lch).map((v) => {
    const c = clamp(v, 0, 1);
    return clamp(c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055, 0, 1);
  }) as [number, number, number];

const subscribePrefersReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ============================================================================
// GLSL SHADERS
// ============================================================================

const vertexShaderGLSL3 = `
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const neonFragmentShader = `
precision highp float;
uniform vec2 uRes;
uniform float uAxis;
uniform float uFlip;
uniform vec2 uSegment;
uniform vec2 uSpan;
uniform float uInset;
uniform float uMirror;
uniform float uSpread;
uniform float uTaper;
uniform float uLight;
uniform float uRadius;
uniform float uHalo;
uniform float uBloom;
uniform float uGlow;
uniform float uPower;
uniform float uGlass;
uniform float uTime;
uniform float uHum;
uniform float uScale;
uniform vec3 uTubeColor;
uniform vec3 uTubeLch;
uniform vec3 uMidLch;
uniform vec3 uDeepLch;
uniform float uInk;
uniform vec3 uInkTube;
uniform vec3 uInkCore;
uniform vec3 uPastelTube;
uniform vec3 uPastelMid;
uniform vec3 uPastelDeep;
uniform vec3 uBg;
uniform float uBgAlpha;
out vec4 fragColor;

const float PI = 3.14159265359;

vec3 lchToLinear(vec3 lch) {
  vec3 lab = vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
  vec3 lms = mat3(1.0, 1.0, 1.0, 0.3963377774, -0.1055613458, -0.0894841775, 0.2158037573, -0.0638541728, -1.291485548) * lab;
  lms = lms * lms * lms;
  return clamp(mat3(4.0767416621, -1.2684380046, -0.0041960863, -3.3077115913, 2.6097574011, -0.7034186147, 0.2309699292, -0.3413193965, 1.707614701) * lms, 0.0, 1.0);
}

vec3 lchMix(vec3 a, vec3 b, float t) {
  float turn = mod(b.z - a.z + PI, 2.0 * PI) - PI;
  return vec3(mix(a.x, b.x, t), mix(a.y, b.y, t), a.z + turn * t);
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix((hash(i) * 2.0 - 1.0) * f, (hash(i + 1.0) * 2.0 - 1.0) * (f - 1.0), w) * 2.0;
}

float pour(float along, float depth) {
  if (depth <= 0.0 || uSegment.y <= uSegment.x) return 0.0;
  float from = atan(uSegment.x - along, depth);
  float to = atan(uSegment.y - along, depth);
  float stride = (to - from) / 16.0;
  float centre = 0.5 * (uSpan.x + uSpan.y);
  float extent = max(0.5 * (uSpan.y - uSpan.x), 0.0001);
  float sum = 0.0;
  for (int i = 0; i < 16; i++) {
    float angle = from + (float(i) + 0.5) * stride;
    float r = clamp(abs(along + depth * tan(angle) - centre) / extent, 0.0, 1.0);
    sum += (1.0 - uTaper * r * r) * exp(-uSpread * depth / cos(angle));
  }
  return sum * stride / (2.0 * PI);
}

vec4 tube(float along, float depth, vec2 size) {
  float dv = (depth - uInset) * size.y;
  float du = max(max(uSegment.x - along, along - uSegment.y), 0.0) * size.x;
  float d = length(vec2(du, dv));
  float lit = smoothstep(0.0, 1.0, (uSegment.y - uSegment.x) * size.x / max(uRadius, 1.0));
  float body = exp(-d * d / (uRadius * uRadius)) * lit;
  float halo = exp(-d / uHalo) * (1.0 - smoothstep(5.0 * uHalo, 7.0 * uHalo, d)) * lit;
  float bloom = exp(-d / uBloom) * (1.0 - smoothstep(5.0 * uBloom, 7.0 * uBloom, d)) * lit;
  float gu = max(max(uSpan.x - along, along - uSpan.y), 0.0) * size.x;
  float g = length(vec2(gu, dv)) / max(uRadius, 0.75);
  return vec4(body, halo, bloom, exp(-g * g));
}

float dither(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))) - 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float along = mix(uv.x, uv.y, uAxis);
  float depth = mix(uv.y, uv.x, uAxis);
  depth = mix(depth, 1.0 - depth, uFlip);
  vec2 size = mix(uRes, uRes.yx, uAxis);
  float below = depth - uInset;
  float light = pour(along, below) * smoothstep(0.0, uHalo, below * size.y);
  vec4 glass = tube(along, depth, size);
  if (uMirror > 0.5) {
    float back = 1.0 - depth - uInset;
    light += pour(along, back) * smoothstep(0.0, uHalo, back * size.y);
    glass += tube(along, 1.0 - depth, size);
  }
  float shimmer = 1.0 + uHum * 0.05 * noise(along * size.x / (140.0 * uScale) + uTime * 0.23);
  float power = uPower * shimmer;
  float k = light * uLight;
  float a = 1.2 * k;
  float q = k * (a + 1.0 - sqrt((a - 1.0) * (a - 1.0) + 0.01)) * 0.5;
  float grain = dither(gl_FragCoord.xy) / 255.0;
  if (uInk < 0.5) {
    vec3 lch = lchMix(uDeepLch, uMidLch, smoothstep(0.1, 0.95, q));
    lch = lchMix(lch, uTubeLch, smoothstep(0.9, 1.8, q));
    float raw = 0.576 * pow(max(q, 0.000001), 0.625);
    float L = raw < 0.8 ? raw : 0.8 + 0.17 * (1.0 - exp(-(raw - 0.8) / 0.17));
    float C = lch.y * smoothstep(-0.05, 0.36, L) * clamp((1.0 - L) / 0.12, 0.0, 1.0);
    vec3 dome = encode(lchToLinear(vec3(L, C, lch.z)));
    vec3 emission = (uTubeColor * (glass.x * 9.0 + glass.y * 1.3 * uGlow + glass.z * 0.1 * uGlow) + glass.x * glass.x * 2.2) * power;
    emission += mix(uTubeColor, vec3(1.0), 0.6) * glass.w * uGlass;
    vec3 rim = encode(1.0 - exp(-emission));
    vec3 color = 1.0 - (1.0 - dome) * (1.0 - rim);
    if (uBgAlpha > 0.5) {
      fragColor = vec4(clamp(1.0 - (1.0 - uBg) * (1.0 - color) + grain, 0.0, 1.0), 1.0);
    } else {
      float alpha = max(color.r, max(color.g, color.b));
      fragColor = vec4(color / max(alpha, 0.0001), clamp(alpha + grain, 0.0, 1.0));
    }
    return;
  }
  vec3 plch = lchMix(uPastelDeep, uPastelMid, smoothstep(0.15, 0.9, q));
  plch = lchMix(plch, uPastelTube, smoothstep(0.85, 1.8, q));
  vec3 pastel = encode(lchToLinear(plch));
  float amount = q + (glass.y * 0.3 + glass.z * 0.25) * uGlow * power;
  float washCover = pow(1.0 - exp(-amount * 1.5), 1.35) * 0.94;
  float glassCover = glass.w * uGlass * 7.0;
  float tubeCover = 1.0 - exp(-(glass.x * 6.0 + glass.y * glass.y * 0.9 * uGlow) * power);
  float coreCover = (1.0 - exp(-glass.x * 2.0 * power)) * 0.5;
  vec3 ink = pastel * washCover;
  float alpha = washCover;
  ink = encode(lchToLinear(uPastelTube)) * glassCover + ink * (1.0 - glassCover);
  alpha = glassCover + alpha * (1.0 - glassCover);
  ink = uInkTube * tubeCover + ink * (1.0 - tubeCover);
  alpha = tubeCover + alpha * (1.0 - tubeCover);
  ink = uInkCore * coreCover + ink * (1.0 - coreCover);
  alpha = coreCover + alpha * (1.0 - coreCover);
  if (uBgAlpha > 0.5) {
    fragColor = vec4(clamp(uBg * (1.0 - alpha) + ink + grain, 0.0, 1.0), 1.0);
  } else {
    fragColor = vec4(ink / max(alpha, 0.0001), clamp(alpha + grain, 0.0, 1.0));
  }
}
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NeonReveal = forwardRef<NeonRevealHandle, NeonRevealProps>(
  (
    {
      colors = ['#553aff', '#544fea'],
      backgroundColor = '#0a0a0a',
      direction = 'down',
      expandFrom = 'center',
      trigger = 'mount',
      revealDelay = 300,
      revealDuration = 2500,
      easing = 'out',
      thickness = 3.0,
      glow = 1.0,
      spill = 1.0,
      reach = 1.0,
      intensity = 1.0,
      feather = 0.15,
      inset = 24,
      length = 0.9,
      mirrored = true,
      hum = 1.0,
      flicker = 1.0,
      interactive = false,
      intro = false,
      paused = false,
      dpr = 2,
      scrollThreshold = 0.3,
      onStart,
      onComplete,
      className,
      style,
      children,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasWrapRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<{ replay: () => void; sync: () => void } | null>(null);

    const prefersReducedMotion = useSyncExternalStore(
      subscribePrefersReducedMotion,
      getPrefersReducedMotion,
      () => false
    );

    const isSide = direction === 'left' || direction === 'right';
    const origin = expandFrom === 'left' ? -1 : expandFrom === 'right' ? 1 : 0;

    const config = {
      colors,
      backgroundColor,
      direction,
      origin,
      trigger,
      delay: Math.max(num(revealDelay, 0), 0) / 1000,
      duration: Math.max(num(revealDuration, 2500), 50) / 1000,
      easing,
      thickness: num(thickness, 3),
      glow: num(glow, 1),
      spill: num(spill, 1),
      reach: num(reach, 1),
      intensity: num(intensity, 1),
      feather: num(feather, 0.15),
      inset: num(inset, 24),
      length: num(length, 0.9),
      mirrored: !!mirrored,
      hum: num(hum, 1),
      flicker: num(flicker, 1),
      interactive: !!interactive,
      intro: !!intro,
      paused: !!paused,
      dpr: num(dpr, 2),
      threshold: num(scrollThreshold, 0.3),
      reduced: prefersReducedMotion,
      onStart,
      onComplete,
    };

    const configRef = useRef(config);
    useEffect(() => {
      configRef.current = config;
      controllerRef.current?.sync();
    });

    useEffect(() => {
      const container = containerRef.current;
      const canvasWrap = canvasWrapRef.current;
      if (!container || !canvasWrap) return;

      const doc = container.ownerDocument;
      const win = doc.defaultView ?? window;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          powerPreference: 'high-performance',
        });
      } catch {
        return;
      }

      renderer.setClearColor(0, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
      canvasWrap.appendChild(canvas);

      const uniforms = {
        uRes: { value: new THREE.Vector2(1, 1) },
        uAxis: { value: 0 },
        uFlip: { value: 1 },
        uSegment: { value: new THREE.Vector2(0.5, 0.5) },
        uSpan: { value: new THREE.Vector2(0, 1) },
        uInset: { value: 0 },
        uMirror: { value: 0 },
        uSpread: { value: 1.5 },
        uTaper: { value: 0.5 },
        uLight: { value: 0 },
        uRadius: { value: 2 },
        uHalo: { value: 8 },
        uBloom: { value: 30 },
        uGlow: { value: 1 },
        uPower: { value: 0 },
        uGlass: { value: 0.05 },
        uTime: { value: 0 },
        uHum: { value: 1 },
        uScale: { value: 1 },
        uTubeColor: { value: new THREE.Color(1, 1, 1) },
        uTubeLch: { value: new THREE.Vector3() },
        uMidLch: { value: new THREE.Vector3() },
        uDeepLch: { value: new THREE.Vector3() },
        uInk: { value: 0 },
        uInkTube: { value: new THREE.Vector3() },
        uInkCore: { value: new THREE.Vector3() },
        uPastelTube: { value: new THREE.Vector3() },
        uPastelMid: { value: new THREE.Vector3() },
        uPastelDeep: { value: new THREE.Vector3() },
        uBg: { value: new THREE.Vector3() },
        uBgAlpha: { value: 0 },
      };

      const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: vertexShaderGLSL3,
        fragmentShader: neonFragmentShader,
        uniforms,
        transparent: false,
        blending: THREE.NormalBlending,
        depthTest: false,
        depthWrite: false,
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;

      const scene = new THREE.Scene();
      scene.add(mesh);
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      let currentW = 0;
      let currentH = 0;
      let currentDpr = 1;
      let isReady = false;
      let lastColorKey = '';
      let lastColorCheck = -10;
      let rafId = 0;
      let lastTime = 0;
      let isIntersecting = false;
      let hasTriggeredInView = false;
      let isDestroyed = false;
      let isContextLost = false;

      let simTime = 0;
      let phase = 0; // 0=init, 1=delay, 2=dip, 3=flicker, 4=grow, 5=complete
      let phaseTime = 0;
      let flickerTime = 0;
      let flickerSeed = 7;
      let flickerPlan: { flicks: [number, number, number][]; on: number; attack: number; growAt: number } = {
        flicks: [],
        on: 0,
        attack: 0.3,
        growAt: 0.4,
      };

      let powerVal = 0;
      let lightVal = 0;
      let revealProgress = 0.04;
      let dipOldPower = 0;
      let dipOldLight = 0;
      let dipOldReveal = 0;
      let dipBaseProgress = 1;
      let lastMask = '';
      const clickDips: { born: number; dips: [number, number, number][] }[] = [];

      const getSegment = (progress: number, fullSpan = false): [number, number] => {
        const cfg = configRef.current;
        const len = (fullSpan ? 1 : clamp(num(cfg.length, 0.9), 0.05, 1)) * clamp(progress, 0, 1);
        if (cfg.origin < 0) return [0, len];
        if (cfg.origin > 0) return [1 - len, 1];
        return [0.5 - len / 2, 0.5 + len / 2];
      };

      const getHumFactor = () => {
        const h = clamp(num(configRef.current.hum, 1), 0, 2);
        return 1 + h * (0.025 * Math.sin((simTime * Math.PI * 2) / 4.3) + 0.015 * Math.sin((simTime * Math.PI * 2) / 1.9 + 1.7));
      };

      const updateColors = () => {
        const cfg = configRef.current;
        const parsedBg = parseColor(cfg.backgroundColor);
        const bgRgb: [number, number, number] = parsedBg ? parsedBg[0] : [0.04, 0.04, 0.04];
        const isSolidBg = !!parsedBg && parsedBg[1] > 0.995;

        const colorKey = `${cfg.colors[0]}|${cfg.colors[1]}|${bgRgb.join(',')}|${isSolidBg}`;
        if (colorKey === lastColorKey) return;
        lastColorKey = colorKey;

        const isLightMode = 0.2126 * bgRgb[0] + 0.7152 * bgRgb[1] + 0.0722 * bgRgb[2] > 0.55;
        const tubeLab = rgbToOklab(parseColor(cfg.colors[0])?.[0] ?? [1, 0.62, 0.99]);
        const lightLab = rgbToOklab(parseColor(cfg.colors[1])?.[0] ?? [0.69, 0.39, 0.91]);

        if (tubeLab[1] < 0.02 && lightLab[1] >= 0.02) tubeLab[2] = lightLab[2];
        if (lightLab[1] < 0.02 && tubeLab[1] >= 0.02) lightLab[2] = tubeLab[2];

        const rawTube = toSrgb(gamutClamp(0.72, tubeLab[1] < 0.02 ? 0 : Math.max(1.45 * tubeLab[1], 0.16), tubeLab[2])).map((v) => Math.max(v, 0));
        const maxTube = Math.max(rawTube[0], rawTube[1], rawTube[2], 0.0001);
        uniforms.uTubeColor.value.set(rawTube[0] / maxTube, rawTube[1] / maxTube, rawTube[2] / maxTube);

        const hueShift = lightLab[2] - 0.36;
        const f = gamutClamp(0.8, tubeLab[1], tubeLab[2]);
        const v = gamutClamp(0.56, lightLab[1] < 0.02 ? 0 : Math.max(lightLab[1], 0.12), lightLab[2]);
        const g = gamutClamp(0.3, lightLab[1] < 0.02 ? 0 : 0.9 * Math.max(lightLab[1], 0.12), hueShift);

        uniforms.uTubeLch.value.set(f[0], f[1], f[2]);
        uniforms.uMidLch.value.set(v[0], v[1], v[2]);
        uniforms.uDeepLch.value.set(g[0], g[1], g[2]);

        const x = toSrgb(gamutClamp(0.5, Math.max(1.5 * tubeLab[1], 0.16), tubeLab[2]));
        const w = toSrgb(gamutClamp(0.84, clamp(tubeLab[1], 0.06, 0.12), tubeLab[2]));
        const F = gamutClamp(0.78, Math.max(tubeLab[1], 0.14), tubeLab[2]);
        const S = gamutClamp(0.74, Math.max(lightLab[1], 0.14), lightLab[2]);
        const P = gamutClamp(0.86, clamp(lightLab[1], 0.07, 0.1), hueShift);

        uniforms.uInk.value = +isLightMode;
        uniforms.uInkTube.value.set(x[0], x[1], x[2]);
        uniforms.uInkCore.value.set(w[0], w[1], w[2]);
        uniforms.uPastelTube.value.set(F[0], F[1], F[2]);
        uniforms.uPastelMid.value.set(S[0], S[1], S[2]);
        uniforms.uPastelDeep.value.set(P[0], P[1], P[2]);
        uniforms.uBg.value.set(bgRgb[0], bgRgb[1], bgRgb[2]);
        uniforms.uBgAlpha.value = +isSolidBg;
      };

      const updateSize = () => {
        const cfg = configRef.current;
        const w = Math.round(container.clientWidth);
        const h = Math.round(container.clientHeight);
        if (w < 2 || h < 2) {
          isReady = false;
          return false;
        }

        const dprVal = Math.min(win.devicePixelRatio || 1, clamp(num(cfg.dpr, 2), 0.5, 3));
        if (!isReady || w !== currentW || h !== currentH || dprVal !== currentDpr) {
          isReady = true;
          currentW = w;
          currentH = h;
          currentDpr = dprVal;
          renderer.setPixelRatio(currentDpr);
          renderer.setSize(currentW, currentH, false);
          return true;
        }
        return false;
      };

      const updateProgress = () => {
        const cfg = configRef.current;
        if (phase === 4) {
          const duration = Math.max(cfg.duration, 0.05);
          const easeFn = easings[cfg.easing] ?? easings.out;
          revealProgress = 0.04 + 0.96 * easeFn(clamp(phaseTime / duration, 0, 1));
        } else if (phase === 5) {
          revealProgress = 1;
        } else if (phase === 2) {
          revealProgress = dipBaseProgress;
        } else {
          revealProgress = 0.04;
        }
      };

      const renderUniforms = () => {
        if (!isReady) return;
        const cfg = configRef.current;

        if (performance.now() - lastColorCheck > 1000) {
          lastColorCheck = performance.now();
          updateColors();
        }

        const thick = clamp(num(cfg.thickness, 3), 0.5, 24);
        const glowVal = clamp(num(cfg.glow, 1), 0, 3);
        const dir = cfg.direction;

        uniforms.uRes.value.set(currentW * currentDpr, currentH * currentDpr);
        uniforms.uAxis.value = +(dir === 'left' || dir === 'right');
        uniforms.uFlip.value = +(dir === 'down' || dir === 'left');

        const [segStart, segEnd] = getSegment(revealProgress);
        const [spanStart, spanEnd] = getSegment(1, true);
        const extent = dir === 'left' || dir === 'right' ? currentW : currentH;

        uniforms.uSegment.value.set(segStart, segEnd);
        uniforms.uSpan.value.set(spanStart, spanEnd);
        uniforms.uInset.value = clamp(Math.max(num(cfg.inset, 24), 0) / Math.max(extent, 1), 0, 0.45);
        uniforms.uMirror.value = +cfg.mirrored;
        uniforms.uSpread.value = 1.5 / clamp(num(cfg.reach, 1), 0.1, 4);
        uniforms.uTaper.value = 0.5;
        uniforms.uLight.value = 4.05 * clamp(num(cfg.spill, 1), 0, 3) * clamp(num(cfg.intensity, 1), 0, 4) * lightVal;
        uniforms.uRadius.value = Math.max(0.5 * thick * currentDpr, 0.75);
        uniforms.uHalo.value = (1.5 + 1.2 * thick) * (0.6 + 0.4 * glowVal) * currentDpr;
        uniforms.uBloom.value = (12 + 16 * glowVal) * currentDpr;
        uniforms.uGlow.value = glowVal;
        uniforms.uPower.value = powerVal * clamp(num(cfg.intensity, 1), 0, 4);
        uniforms.uGlass.value = 0.05 * clamp(num(cfg.intensity, 1), 0, 4);
        uniforms.uTime.value = simTime;
        uniforms.uHum.value = cfg.reduced ? 0 : clamp(num(cfg.hum, 1), 0, 2);
        uniforms.uScale.value = currentDpr;

        renderer.render(scene, camera);
      };

      const setPhase = (next: number) => {
        phase = next;
        phaseTime = 0;
        if (next === 3) {
          const f = clamp(num(configRef.current.flicker, 1), 0, 2);
          const rng = mulberry32(flickerSeed);
          flickerSeed = (1664525 * flickerSeed + 0x3c6ef35f) >>> 0;
          const count = Math.round(2.2 * f);
          const flicks: [number, number, number][] = [];
          let curTime = 0.06;
          for (let i = 0; i < count; i++) {
            const duration = 0.03 + 0.05 * rng();
            const strength = Math.min(0.32 + ((i + 1) / (count + 1)) * 0.5 + 0.14 * rng(), 0.92);
            flicks.push([curTime, duration, strength]);
            curTime += duration + 0.05 + 0.1 * rng();
          }
          const attack = 0.06 + 0.3 * (1 - Math.min(f, 1));
          flickerPlan = {
            flicks,
            on: curTime,
            attack,
            growAt: curTime + attack + 0.06,
          };
          flickerTime = 0;
          configRef.current.onStart?.();
        } else if (next === 5) {
          configRef.current.onComplete?.();
        }
      };

      const updateDynamics = (dt: number, isStill: boolean) => {
        let p = 0;
        let l = 0;

        if (phase === 2) {
          p = dipOldPower * Math.exp(-phaseTime / 0.07);
          l = dipOldLight * Math.exp(-phaseTime / 0.09);
        } else if (phase >= 3) {
          let flickerIntensity = 0;
          for (const [start, duration, strength] of flickerPlan.flicks) {
            if (flickerTime >= start) {
              flickerIntensity = Math.max(
                flickerIntensity,
                strength *
                  smoothstep(start, start + 0.014, flickerTime) *
                  (flickerTime > start + duration ? Math.exp(-(flickerTime - start - duration) / 0.028) : 1)
              );
            }
          }
          if (flickerTime >= flickerPlan.on) {
            const attackDelta = flickerTime - flickerPlan.on;
            flickerIntensity = Math.max(
              flickerIntensity,
              smoothstep(0, flickerPlan.attack, attackDelta) * (0.86 + 0.14 * (1 - Math.exp(-attackDelta / 0.35)))
            );
          }

          let humFactor = getHumFactor();
          let dipDamping = 1;
          for (let i = clickDips.length - 1; i >= 0; i--) {
            const age = simTime - clickDips[i].born;
            if (age > 0.6) {
              clickDips.splice(i, 1);
              continue;
            }
            let dipVal = 0;
            for (const [dStart, dDur, dAmt] of clickDips[i].dips) {
              const diff = (age - dStart) / dDur;
              dipVal = Math.max(dipVal, dAmt * Math.exp(-diff * diff));
            }
            dipDamping *= 1 - Math.min(dipVal * (0.4 + 0.3 * clamp(num(configRef.current.flicker, 1), 0, 2)), 0.95);
          }

          p = l = flickerIntensity * humFactor * dipDamping;
        }

        powerVal = p;
        if (phase === 2 || isStill) {
          lightVal = l;
        } else {
          lightVal += (l - lightVal) * (1 - Math.exp(-dt / 0.035));
        }
      };

      const forceComplete = () => {
        phase = 5;
        phaseTime = 0;
        flickerTime = 30;
        clickDips.length = 0;
        lightVal = powerVal = getHumFactor();
      };

      const loop = (timestamp: number) => {
        rafId = 0;
        if (isDestroyed || isContextLost) return;

        const cfg = configRef.current;
        const dt = lastTime && timestamp - lastTime < 100 ? clamp((timestamp - lastTime) / 1000, 0, 0.05) : 1 / 60;
        lastTime = timestamp;

        const isStill = cfg.reduced || cfg.paused;
        if ((cfg.reduced || (cfg.paused && phase <= 1)) && phase !== 5) {
          forceComplete();
        }

        if (!isStill) {
          simTime += dt;
          phaseTime += dt;
          if (phase >= 3) flickerTime += dt;

          if (phase === 0) {
            if (cfg.trigger === 'mount' || (cfg.trigger === 'inView' && hasTriggeredInView)) {
              if (cfg.delay > 0) setPhase(1);
              else setPhase(3);
            }
          } else if (phase === 1) {
            if (phaseTime >= cfg.delay) setPhase(3);
          } else if (phase === 2) {
            if (phaseTime >= 0.34) setPhase(3);
          } else if (phase === 3) {
            if (phaseTime >= flickerPlan.growAt) setPhase(4);
          } else if (phase === 4) {
            if (phaseTime >= Math.max(cfg.duration, 0.05)) setPhase(5);
          }
        }

        updateDynamics(dt, isStill);
        updateProgress();
        renderUniforms();

        const hasActiveDynamics =
          phase !== 5 ||
          clickDips.length > 0 ||
          Math.abs(lightVal - powerVal) > 0.002 ||
          clamp(num(cfg.hum, 1), 0, 2) > 0;

        const isAwaitingMount = phase === 0 && cfg.trigger !== 'mount';
        if (isStill || !hasActiveDynamics || isAwaitingMount || doc.hidden) {
          lastTime = 0;
        } else {
          rafId = requestAnimationFrame(loop);
        }
      };

      const kickstart = () => {
        if (!isDestroyed && !isContextLost && isIntersecting && !rafId) {
          lastTime = 0;
          rafId = requestAnimationFrame(loop);
        }
      };

      const replay = () => {
        if (configRef.current.reduced || phase === 2) return;
        if (phase === 0 || phase === 1) {
          setPhase(3);
        } else {
          dipOldPower = powerVal;
          dipOldLight = lightVal;
          dipOldReveal = revealProgress;
          dipBaseProgress = revealProgress;
          clickDips.length = 0;
          setPhase(2);
        }
        lastTime = 0;
        kickstart();
      };

      const resizeObserver = new ResizeObserver(() => {
        if (updateSize()) {
          updateProgress();
          renderUniforms();
          kickstart();
        }
      });

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting;
          lastTime = 0;
          kickstart();
        },
        { rootMargin: '120px' }
      );

      const thresholdVal = clamp(num(configRef.current.threshold, 0.3), 0, 1);
      const scrollTriggerObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !(entry.intersectionRatio < thresholdVal - 0.001)) {
            hasTriggeredInView = true;
            scrollTriggerObserver.disconnect();
            lastTime = 0;
            kickstart();
          }
        },
        { threshold: [0, thresholdVal] }
      );

      resizeObserver.observe(container);
      intersectionObserver.observe(container);
      scrollTriggerObserver.observe(container);

      if (!configRef.current.intro || configRef.current.reduced) {
        forceComplete();
      }

      updateSize();
      updateColors();
      kickstart();

      controllerRef.current = {
        sync: () => {
          lastColorCheck = -10;
          updateSize();
          lastTime = 0;
          if (!rafId && isIntersecting) {
            const cfg = configRef.current;
            if ((cfg.reduced || (cfg.paused && phase <= 1)) && phase !== 5) {
              forceComplete();
            }
            updateDynamics(0, true);
            updateProgress();
            renderUniforms();
            kickstart();
          }
        },
        replay,
      };

      return () => {
        isDestroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        scrollTriggerObserver.disconnect();
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (canvas.parentNode === canvasWrap) {
          canvasWrap.removeChild(canvas);
        }
        controllerRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      replay: () => controllerRef.current?.replay(),
    }));

    return (
      <div
        ref={containerRef}
        className={cn('relative isolate w-full overflow-hidden', className)}
        style={{
          backgroundColor: backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : undefined,
          ...style,
        }}
      >
        {/* Animated Three.js WebGL2 Neon Tube Viewport */}
        <div ref={canvasWrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />

        {/* Content Layer (Above the neon glow, 100% interactive) */}
        {children && (
          <div ref={contentRef} className="relative z-10 w-full h-full">
            {children}
          </div>
        )}
      </div>
    );
  }
);

NeonReveal.displayName = 'NeonReveal';
