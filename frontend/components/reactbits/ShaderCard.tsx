'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useSyncExternalStore,
} from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// ============================================================================
// GLSL SHADERS (From React Bits Pro)
// ============================================================================

const vertexShaderFallback = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const vertexShaderGLSL3 = `
  in vec3 position;
  out vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const flameFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uShift;
  uniform vec3 uDeep;
  uniform vec3 uMain;
  uniform vec3 uHot;
  uniform float uPositionY;
  uniform float uScale;
  uniform float uEffectRadius;
  uniform float uEffectBoost;
  uniform float uEdgeMin;
  uniform float uEdgeMax;
  uniform float uFalloffPower;
  uniform float uNoiseScale;
  uniform float uWidthFactor;
  uniform float uWaveAmount;
  uniform float uBranchIntensity;
  uniform float uVerticalExtent;
  uniform float uHorizontalExtent;
  uniform float uContours;
  uniform float uFlash;
  uniform float uLift;
  uniform float uFade;
  uniform float uIntensity;

  in vec2 vUv;
  out vec4 fragColor;

  vec3 random3(vec3 c) {
    float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0 * j);
    j *= 0.125;
    r.x = fract(512.0 * j);
    j *= 0.125;
    r.y = fract(512.0 * j);
    return r - 0.5;
  }

  const float F3 = 0.3333333;
  const float G3 = 0.1666667;

  float simplex3d(vec3 p) {
    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));
    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0 * G3;
    vec3 x3 = x - 1.0 + 3.0 * G3;
    vec4 w;
    vec4 d;
    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);
    w = max(0.6 - w, 0.0);
    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);
    w *= w;
    w *= w;
    d *= w;
    return dot(d, vec4(52.0));
  }

  const float PI = 3.14159265359;

  void main() {
    float time = 28.22 + 1.25 * uTime;
    float bignessScale = 1.0 / uNoiseScale;

    vec2 uv = ((vUv * uRes + uShift) / uRes) * 2.0 - 1.0;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;

    float effectiveScale = max(uScale, 0.5);
    uv = uv / effectiveScale;

    float yOffset = mix(-0.3, 0.8, uPositionY) + uLift / effectiveScale;
    uv.y -= yOffset;
    uv.y *= uVerticalExtent;
    uv.x *= uHorizontalExtent;

    vec2 p = (uv / aspect + 1.0) * 0.5;
    p.x *= aspect;

    vec2 positionFromCenter = uv;
    positionFromCenter /= uEffectRadius;
    positionFromCenter.x /= uWidthFactor;
    float positionFromBottom = 0.5 * (positionFromCenter.y + 1.0);

    vec2 waveOffset = vec2(0.0);
    waveOffset.x += positionFromBottom * sin(4.0 * positionFromCenter.y - 4.0 * time);
    waveOffset.x += 0.1 * positionFromBottom * sin(4.0 * positionFromCenter.x - 1.561 * time);
    waveOffset.x += uBranchIntensity * 0.15 * sin(8.0 * positionFromCenter.y + time * 2.0);
    waveOffset.x += uBranchIntensity * 0.1 * sin(12.0 * positionFromCenter.y - time * 1.5);
    waveOffset.y += uBranchIntensity * 0.08 * sin(6.0 * positionFromCenter.x + time * 1.8);
    positionFromCenter += uWaveAmount * waveOffset;

    positionFromCenter.x += positionFromCenter.x / (1.0 - positionFromCenter.y);

    float effectMask = clamp(1.0 - length(positionFromCenter), 0.0, 1.0);
    effectMask = 1.0 - pow(1.0 - effectMask, uFalloffPower);

    vec3 p3 = bignessScale * 0.25 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.1, time * 0.025);
    float noise = simplex3d(p3 * 32.0);
    noise += 0.3 * simplex3d(p3 * 64.0 + vec3(time * 0.05, time * 0.03, 0.0));
    noise += 0.15 * simplex3d(p3 * 128.0 - vec3(time * 0.08, 0.0, time * 0.04));
    noise = 0.5 + 0.5 * noise;

    float value = effectMask * noise + uEffectBoost * effectMask;
    float edge = mix(uEdgeMin, uEdgeMax, pow(clamp(0.5 * (positionFromCenter.y + 1.0), 0.0, 1.0), 1.2));
    float edgedValue = clamp(value - edge, 0.0, 1.0);
    float steppedValue = smoothstep(edge, edge + 0.1, value);
    float highlight = 1.0 - edgedValue;

    p3 = bignessScale * 0.1 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.01, time * 0.025);
    noise = 0.5 + 0.5 * simplex3d(p3 * 32.0);
    float repeatedValue = mix(highlight, noise, 0.65);
    repeatedValue = 0.5 * sin(6.0 * PI * (1.0 - pow(1.0 - repeatedValue, 1.8)) - 0.5 * PI) + 0.5;
    float steppedLines = smoothstep(0.95, 1.0, pow(repeatedValue, 8.0));
    steppedLines = mix(steppedLines, 0.0, 0.8 - noise);
    highlight = max(steppedLines * uContours, highlight);
    highlight = highlight * highlight;

    float wave = sin(time * 3.0);
    float flash = wave * wave * wave * wave * uFlash;
    float heat = clamp(steppedValue * highlight, 0.0, 1.0);
    float height = clamp(vUv.y, 0.0, 1.0);
    vec3 body = mix(uMain, uDeep, smoothstep(0.0, 0.9, height));
    vec3 emission = body * steppedValue * 0.95;
    emission += uHot * heat * (0.9 + 0.4 * flash);
    emission += vec3(1.0, 0.94, 0.98) * heat * heat * heat * (0.15 + 0.35 * flash);
    float cover = steppedValue * mix(0.55, 1.0, heat);

    float fadeStart = mix(1.05, 0.3, uFade);
    float mask = 1.0 - smoothstep(fadeStart, fadeStart + 0.4, vUv.y);
    fragColor = vec4(emission * uIntensity * mask, cover * mask);
  }
`;

const blurFragmentShader = `
  precision highp float;
  uniform sampler2D uSource;
  uniform vec2 uDirection;
  in vec2 vUv;
  out vec4 fragColor;
  void main() {
    vec4 sum = texture(uSource, vUv) * 0.2270270270;
    sum += texture(uSource, vUv + uDirection * 1.3846153846) * 0.3162162162;
    sum += texture(uSource, vUv - uDirection * 1.3846153846) * 0.3162162162;
    sum += texture(uSource, vUv + uDirection * 3.2307692308) * 0.0702702703;
    sum += texture(uSource, vUv - uDirection * 3.2307692308) * 0.0702702703;
    fragColor = sum;
  }
`;

const bloomDownsampleShader = `
  precision highp float;
  uniform sampler2D uSource;
  uniform vec2 uTexel;
  uniform float uThreshold;
  in vec2 vUv;
  out vec4 fragColor;
  vec3 tap(vec2 d) { return texture(uSource, vUv + d * uTexel).rgb; }
  void main() {
    vec3 a = tap(vec2(-2.0, 2.0));
    vec3 b = tap(vec2(0.0, 2.0));
    vec3 c = tap(vec2(2.0, 2.0));
    vec3 d = tap(vec2(-2.0, 0.0));
    vec3 e = tap(vec2(0.0, 0.0));
    vec3 f = tap(vec2(2.0, 0.0));
    vec3 g = tap(vec2(-2.0, -2.0));
    vec3 h = tap(vec2(0.0, -2.0));
    vec3 i = tap(vec2(2.0, -2.0));
    vec3 j = tap(vec2(-1.0, 1.0));
    vec3 k = tap(vec2(1.0, 1.0));
    vec3 l = tap(vec2(-1.0, -1.0));
    vec3 m = tap(vec2(1.0, -1.0));
    vec3 color = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
    if (uThreshold > 0.0) {
      float peak = max(color.r, max(color.g, color.b));
      float knee = 0.5;
      float soft = clamp(peak - uThreshold + knee, 0.0, 2.0 * knee);
      soft = soft * soft / (4.0 * knee + 0.00001);
      color *= max(soft, peak - uThreshold) / max(peak, 0.00001);
    }
    fragColor = vec4(color, 1.0);
  }
`;

const bloomUpsampleShader = `
  precision highp float;
  uniform sampler2D uSource;
  uniform vec2 uTexel;
  in vec2 vUv;
  out vec4 fragColor;
  vec3 tap(vec2 d) { return texture(uSource, vUv + d * uTexel).rgb; }
  void main() {
    vec3 color = tap(vec2(0.0)) * 4.0
      + (tap(vec2(-1.0, 0.0)) + tap(vec2(1.0, 0.0)) + tap(vec2(0.0, -1.0)) + tap(vec2(0.0, 1.0))) * 2.0
      + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));
    fragColor = vec4(color / 16.0, 1.0);
  }
`;

const compositeFragmentShader = `
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uBloom;
  uniform float uBloomStrength;
  uniform float uGrain;
  uniform float uTime;
  uniform float uInk;
  in vec2 vUv;
  out vec4 fragColor;

  vec3 encode(vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec4 scene = texture(uScene, vUv);
    vec3 light = max(scene.rgb + texture(uBloom, vUv).rgb * uBloomStrength, 0.0);
    float n = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 517.0) - 0.5;
    float dither = (hash(gl_FragCoord.xy * 1.37 + 0.71) - 0.5) / 255.0;
    float peak = max(light.r, max(light.g, light.b));
    if (uInk > 0.5) {
      vec3 hue = light / max(peak, 0.0001);
      float cover = clamp(max(scene.a * 0.9, 1.0 - exp(-peak * 1.3)), 0.0, 1.0);
      vec3 ink = encode(hue * mix(0.55, 0.8, smoothstep(0.4, 1.6, peak)));
      ink += n * uGrain * 0.08 + dither;
      fragColor = vec4(clamp(ink, 0.0, 1.0) * cover, cover);
      return;
    }
    vec3 mapped = 1.0 - exp(-light * 1.35);
    vec3 color = encode(mapped);
    float alpha = max(max(color.r, max(color.g, color.b)), scene.a * 0.8);
    color += (n * uGrain * 0.08 + dither) * smoothstep(0.0, 0.1, alpha);
    color = clamp(color, 0.0, 1.0);
    fragColor = vec4(min(color, vec3(alpha)), alpha);
  }
`;

const blankFragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0);
  }
`;

// ============================================================================
// COLOR & PHYSICS UTILITIES
// ============================================================================

function parseColor(input: string): [number, number, number] {
  const hexFull = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input.trim());
  if (hexFull) {
    return [
      parseInt(hexFull[1], 16) / 255,
      parseInt(hexFull[2], 16) / 255,
      parseInt(hexFull[3], 16) / 255,
    ];
  }
  const hexShort = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(input.trim());
  if (hexShort) {
    return [
      parseInt(hexShort[1] + hexShort[1], 16) / 255,
      parseInt(hexShort[2] + hexShort[2], 16) / 255,
      parseInt(hexShort[3] + hexShort[3], 16) / 255,
    ];
  }
  const col = new THREE.Color();
  try {
    col.setStyle(input, THREE.SRGBColorSpace);
  } catch {
    col.setRGB(0, 1, 1, THREE.SRGBColorSpace);
  }
  const srgb = col.clone().convertLinearToSRGB();
  return [srgb.r, srgb.g, srgb.b];
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function oklabToLinear([L, a, b]: [number, number, number]): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = Math.pow(l_, 3);
  const m = Math.pow(m_, 3);
  const s = Math.pow(s_, 3);

  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  return [
    clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function spring(
  current: number,
  velocity: number,
  target: number,
  omega: number,
  dt: number
): [number, number] {
  const acc = velocity + (omega * omega * (target - current) - 2 * omega * velocity) * dt;
  return [current + acc * dt, acc];
}

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', cb);
  return () => media.removeEventListener('change', cb);
};

const getReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const toCssSize = (val: number | string | undefined) =>
  typeof val === 'number' ? `${val}px` : val;

// ============================================================================
// PROPS & COMPONENT
// ============================================================================

export interface ShaderCardProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  fragmentShader?: string;
  autoPlay?: boolean;
  paused?: boolean;
  color?: string;
  highlightColor?: string | null;
  backgroundColor?: string;
  positionY?: number;
  scale?: number;
  effectRadius?: number;
  effectBoost?: number;
  edgeMin?: number;
  edgeMax?: number;
  falloffPower?: number;
  noiseScale?: number;
  widthFactor?: number;
  waveAmount?: number;
  branchIntensity?: number;
  verticalExtent?: number;
  horizontalExtent?: number;
  contours?: number;
  flash?: number;
  blur?: number;
  opacity?: number;
  intensity?: number;
  bloom?: number;
  grain?: number;
  fade?: number;
  interactive?: boolean;
  tiltStrength?: number;
  parallax?: number;
  hoverRise?: number;
  intro?: boolean;
  dpr?: number;
  children?: React.ReactNode;
}

export interface ShaderCardHandle {
  replay: () => void;
}

export const ShaderCard = forwardRef<ShaderCardHandle, ShaderCardProps>(
  (
    {
      width,
      height,
      borderRadius = '24px',
      speed = 0.5,
      className = '',
      style,
      fragmentShader,
      autoPlay = true,
      paused = false,
      color = '#5227FF',
      highlightColor = null,
      backgroundColor = '#07080E',
      positionY = 0,
      scale = 4,
      effectRadius = 0.9,
      effectBoost = 0.5,
      edgeMin = 0,
      edgeMax = 1,
      falloffPower = 2,
      noiseScale = 1.5,
      widthFactor = 1.5,
      waveAmount = 0.15,
      branchIntensity = 2,
      verticalExtent = 1.5,
      horizontalExtent = 1.5,
      contours = 1,
      flash = 0.6,
      blur = 4,
      opacity = 1,
      intensity = 1,
      bloom = 0.8,
      grain = 0.25,
      fade = 0.6,
      interactive = true,
      tiltStrength = 8,
      parallax = 1,
      hoverRise = 1,
      intro = true,
      dpr = 2,
      children,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasWrapRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<{ replay: () => void; sync: () => void } | null>(null);

    const isReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

    const configRef = useRef({
      speed,
      playing: autoPlay && !paused,
      fragmentShader,
      color,
      highlightColor,
      positionY,
      scale,
      effectRadius,
      effectBoost,
      edgeMin,
      edgeMax,
      falloffPower,
      noiseScale,
      widthFactor,
      waveAmount,
      branchIntensity,
      verticalExtent,
      horizontalExtent,
      contours,
      flash,
      blur,
      opacity,
      intensity,
      bloom,
      grain,
      fade,
      interactive,
      tiltStrength,
      parallax,
      hoverRise,
      intro,
      dpr,
      reducedMotion: isReducedMotion,
    });

    // Keep config updated
    useEffect(() => {
      configRef.current = {
        speed,
        playing: autoPlay && !paused,
        fragmentShader,
        color,
        highlightColor,
        positionY,
        scale,
        effectRadius,
        effectBoost,
        edgeMin,
        edgeMax,
        falloffPower,
        noiseScale,
        widthFactor,
        waveAmount,
        branchIntensity,
        verticalExtent,
        horizontalExtent,
        contours,
        flash,
        blur,
        opacity,
        intensity,
        bloom,
        grain,
        fade,
        interactive,
        tiltStrength,
        parallax,
        hoverRise,
        intro,
        dpr,
        reducedMotion: isReducedMotion,
      };
      controllerRef.current?.sync();
    });

    useImperativeHandle(ref, () => ({
      replay: () => controllerRef.current?.replay(),
    }));

    useEffect(() => {
      const container = containerRef.current;
      const canvasWrap = canvasWrapRef.current;
      if (!container || !canvasWrap) return;

      const defaultView = canvasWrap.ownerDocument?.defaultView ?? window;

      // WebGL Renderer with graceful fallback if WebGL is unavailable
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch (err) {
        console.warn('ShaderCard: WebGL is unavailable or failed to initialize context.', err);
        return;
      }
      renderer.setClearColor(0, 0);
      renderer.autoClear = false;

      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvasWrap.appendChild(canvas);

      const floatType =
        renderer.extensions.has('EXT_color_buffer_float') ||
        renderer.extensions.has('EXT_color_buffer_half_float')
          ? THREE.HalfFloatType
          : THREE.UnsignedByteType;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
      const quadGeom = new THREE.BufferGeometry();
      quadGeom.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)
      );

      const scene = new THREE.Scene();
      const quadMesh = new THREE.Mesh(quadGeom);
      quadMesh.frustumCulled = false;
      scene.add(quadMesh);

      // Flame Uniforms
      const uniformsFlame = {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uShift: { value: new THREE.Vector2(0, 0) },
        uDeep: { value: new THREE.Vector3(0.02, 0, 0.2) },
        uMain: { value: new THREE.Vector3(0.08, 0.02, 1) },
        uHot: { value: new THREE.Vector3(1, 0.35, 0.95) },
        uPositionY: { value: 0.1 },
        uScale: { value: 3 },
        uEffectRadius: { value: 0.9 },
        uEffectBoost: { value: 0.5 },
        uEdgeMin: { value: 0 },
        uEdgeMax: { value: 0.5 },
        uFalloffPower: { value: 2 },
        uNoiseScale: { value: 1.5 },
        uWidthFactor: { value: 0.5 },
        uWaveAmount: { value: 0.5 },
        uBranchIntensity: { value: 0.5 },
        uVerticalExtent: { value: 1.5 },
        uHorizontalExtent: { value: 1.5 },
        uContours: { value: 1 },
        uFlash: { value: 1 },
        uLift: { value: 0 },
        uFade: { value: 0 },
        uIntensity: { value: 1 },
      };

      const customUniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        uColor: { value: new THREE.Vector3(1, 0.62, 0.99) },
        uHighlight: { value: new THREE.Vector3(1, 1, 1) },
        uUseHighlight: { value: 0 },
        uPositionY: uniformsFlame.uPositionY,
        uScale: uniformsFlame.uScale,
        uEffectRadius: uniformsFlame.uEffectRadius,
        uEffectBoost: uniformsFlame.uEffectBoost,
        uEdgeMin: uniformsFlame.uEdgeMin,
        uEdgeMax: uniformsFlame.uEdgeMax,
        uFalloffPower: uniformsFlame.uFalloffPower,
        uNoiseScale: uniformsFlame.uNoiseScale,
        uWidthFactor: uniformsFlame.uWidthFactor,
        uWaveAmount: uniformsFlame.uWaveAmount,
        uBranchIntensity: uniformsFlame.uBranchIntensity,
        uVerticalExtent: uniformsFlame.uVerticalExtent,
        uHorizontalExtent: uniformsFlame.uHorizontalExtent,
        uContours: uniformsFlame.uContours,
        uFlash: uniformsFlame.uFlash,
        uLift: uniformsFlame.uLift,
        uShift: { value: new THREE.Vector2(0, 0) },
      };

      const createMaterial = (
        fragShader: string,
        unifs: Record<string, THREE.IUniform>,
        isAdditive = false
      ) =>
        new THREE.RawShaderMaterial({
          glslVersion: THREE.GLSL3,
          vertexShader: vertexShaderGLSL3,
          fragmentShader: fragShader,
          uniforms: unifs,
          blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
          transparent: isAdditive,
          depthTest: false,
          depthWrite: false,
        });

      const materialFlame = createMaterial(flameFragmentShader, uniformsFlame);
      const materialBlur = createMaterial(blurFragmentShader, {
        uSource: { value: null },
        uDirection: { value: new THREE.Vector2() },
      });
      const materialDownsample = createMaterial(bloomDownsampleShader, {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uThreshold: { value: 0 },
      });
      const materialUpsample = createMaterial(
        bloomUpsampleShader,
        {
          uSource: { value: null },
          uTexel: { value: new THREE.Vector2() },
        },
        true
      );

      const createTarget = () =>
        new THREE.WebGLRenderTarget(1, 1, {
          type: floatType,
          format: THREE.RGBAFormat,
          depthBuffer: false,
          stencilBuffer: false,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: false,
        });

      const targetScene = createTarget();
      const targetPingPong = createTarget();
      const targetBloomChain = Array.from({ length: 4 }, createTarget);

      const materialComposite = createMaterial(compositeFragmentShader, {
        uScene: { value: targetScene.texture },
        uBloom: { value: targetBloomChain[0].texture },
        uBloomStrength: { value: 0.15 },
        uGrain: { value: 0.2 },
        uTime: { value: 0 },
        uInk: { value: 0 },
      });

      const customFragShader = configRef.current.fragmentShader || blankFragmentShader;
      const materialCustom = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: vertexShaderFallback,
        fragmentShader: customFragShader,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: false,
        depthWrite: false,
      });

      let currentW = 0;
      let currentH = 0;
      let currentDpr = 0;
      let needsResize = true;
      let isVisible = true;
      let isTabActive = 'hidden' !== defaultView.document.visibilityState;
      let rafId = 0;
      let lastTime = 0;
      let simTime = 0;
      let introProgress =
        configRef.current.intro && !configRef.current.reducedMotion ? 0 : 1.6;
      let hoverVal = 0;
      let hoverVel = 0;
      let pointerTargetX = 0;
      let pointerTargetY = 0;
      let smoothTiltX = 0;
      let smoothTiltXVel = 0;
      let smoothTiltY = 0;
      let smoothTiltYVel = 0;
      let lastAppliedColor = '';

      const updateColors = (cfg: typeof configRef.current) => {
        const rgb = parseColor(cfg.color);
        customUniforms.uColor.value.set(rgb[0], rgb[1], rgb[2]);

        if (cfg.highlightColor) {
          const hRgb = parseColor(cfg.highlightColor);
          customUniforms.uHighlight.value.set(hRgb[0], hRgb[1], hRgb[2]);
          customUniforms.uUseHighlight.value = 1;
        } else {
          customUniforms.uUseHighlight.value = 0;
        }

        const linRgb: [number, number, number] = [toLinear(rgb[0]), toLinear(rgb[1]), toLinear(rgb[2])];

        // Oklab conversion
        const [l_, m_, s_] = [
          Math.cbrt(0.4122214708 * linRgb[0] + 0.5363325363 * linRgb[1] + 0.0514459929 * linRgb[2]),
          Math.cbrt(0.2119034982 * linRgb[0] + 0.6806995451 * linRgb[1] + 0.1073969566 * linRgb[2]),
          Math.cbrt(0.0883024619 * linRgb[0] + 0.2817188376 * linRgb[1] + 0.6299787005 * linRgb[2]),
        ];
        const aLab = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
        const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
        const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
        const C = Math.hypot(aLab, bLab);
        const h = Math.atan2(bLab, aLab);

        const deep = oklabToLinear([0.55 * L, 0.9 * C, h - 0.12]);
        let hot: [number, number, number];
        if (cfg.highlightColor) {
          const hRgb = parseColor(cfg.highlightColor);
          hot = [toLinear(hRgb[0]), toLinear(hRgb[1]), toLinear(hRgb[2])];
        } else {
          hot = oklabToLinear([Math.min(L + 0.13, 0.86), C, h + 0.28]);
        }

        uniformsFlame.uDeep.value.set(deep[0], deep[1], deep[2]);
        uniformsFlame.uMain.value.set(linRgb[0], linRgb[1], linRgb[2]);
        uniformsFlame.uHot.value.set(hot[0], hot[1], hot[2]);
        materialComposite.uniforms.uInk.value = 0;
      };

      const animate = (timestamp: number) => {
        rafId = 0;
        if (!isVisible || !isTabActive) return;

        const cfg = configRef.current;
        const dt = lastTime && timestamp - lastTime < 100 ? Math.min(Math.max((timestamp - lastTime) / 1000, 0), 0.05) : 1 / 60;
        lastTime = timestamp;

        // Resize check
        const rect = canvasWrap.getBoundingClientRect();
        const dprVal = Math.min(defaultView.devicePixelRatio || 1, Math.max(cfg.dpr, 0.5));
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));

        if (w !== currentW || h !== currentH || dprVal !== currentDpr || needsResize) {
          currentW = w;
          currentH = h;
          currentDpr = dprVal;
          renderer.setPixelRatio(currentDpr);
          renderer.setSize(currentW, currentH, false);
          customUniforms.iResolution.value.set(currentW * currentDpr, currentH * currentDpr, 1);

          const halfW = Math.max(1, Math.round(currentW * currentDpr * 0.5));
          const halfH = Math.max(1, Math.round(currentH * currentDpr * 0.5));
          targetScene.setSize(halfW, halfH);
          targetPingPong.setSize(halfW, halfH);
          uniformsFlame.uRes.value.set(halfW, halfH);

          let bw = halfW;
          let bh = halfH;
          for (const target of targetBloomChain) {
            bw = Math.max(1, Math.round(bw / 2));
            bh = Math.max(1, Math.round(bh / 2));
            target.setSize(bw, bh);
          }
          needsResize = false;
        }

        // Color check
        const colorKey = `${cfg.color}|${cfg.highlightColor ?? ''}`;
        if (colorKey !== lastAppliedColor) {
          lastAppliedColor = colorKey;
          updateColors(cfg);
        }

        // Update uniforms
        uniformsFlame.uPositionY.value = cfg.positionY;
        uniformsFlame.uScale.value = cfg.scale;
        uniformsFlame.uEffectRadius.value = cfg.effectRadius;
        uniformsFlame.uEffectBoost.value = cfg.effectBoost;
        uniformsFlame.uEdgeMin.value = cfg.edgeMin;
        uniformsFlame.uEdgeMax.value = cfg.edgeMax;
        uniformsFlame.uFalloffPower.value = cfg.falloffPower;
        uniformsFlame.uNoiseScale.value = cfg.noiseScale;
        uniformsFlame.uWidthFactor.value = cfg.widthFactor;
        uniformsFlame.uWaveAmount.value = cfg.waveAmount;
        uniformsFlame.uBranchIntensity.value = cfg.branchIntensity;
        uniformsFlame.uVerticalExtent.value = cfg.verticalExtent;
        uniformsFlame.uHorizontalExtent.value = cfg.horizontalExtent;
        uniformsFlame.uContours.value = cfg.contours;
        uniformsFlame.uFlash.value = cfg.flash;
        uniformsFlame.uFade.value = cfg.fade;
        materialComposite.uniforms.uGrain.value = Math.min(Math.max(cfg.grain, 0), 1);

        if (cfg.playing && !cfg.reducedMotion) {
          simTime += dt * cfg.speed * (1 + 0.6 * hoverVal * cfg.hoverRise);
        }

        if (introProgress < 1.6) {
          introProgress += cfg.reducedMotion ? 1.6 : dt;
        }

        const pNorm = Math.min(introProgress / 1.6, 1);
        const introEase = 1 - (1 - Math.pow(1 - pNorm, 3));

        [hoverVal, hoverVel] = spring(hoverVal, hoverVel, pointerTargetX === 0 && pointerTargetY === 0 ? 0 : 1, 6, dt);
        [smoothTiltX, smoothTiltXVel] = spring(smoothTiltX, smoothTiltXVel, pointerTargetX, 9, dt);
        [smoothTiltY, smoothTiltYVel] = spring(smoothTiltY, smoothTiltYVel, pointerTargetY, 9, dt);

        customUniforms.iTime.value = simTime;
        uniformsFlame.uTime.value = simTime;
        uniformsFlame.uLift.value = -(2.2 * introEase) + hoverVal * cfg.hoverRise * 0.35;
        uniformsFlame.uIntensity.value = cfg.intensity * (1 + 0.18 * hoverVal * cfg.hoverRise);

        // Tilt & Parallax Physics
        const tilt = cfg.tiltStrength;
        const rotX = -smoothTiltY * tilt;
        const rotY = smoothTiltX * tilt;

        container.style.transform =
          Math.abs(rotX) + Math.abs(rotY) > 0.001
            ? `perspective(900px) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`
            : '';

        if (contentRef.current) {
          const shift = 6 * cfg.parallax;
          contentRef.current.style.transform =
            Math.abs(smoothTiltX) + Math.abs(smoothTiltY) > 0.0005
              ? `translate3d(${(smoothTiltX * shift).toFixed(2)}px, ${(smoothTiltY * shift).toFixed(2)}px, 0)`
              : '';
        }

        customUniforms.uShift.value.set(
          smoothTiltX * cfg.parallax * 10 * currentDpr,
          smoothTiltY * cfg.parallax * 10 * currentDpr
        );
        uniformsFlame.uShift.value.set(
          smoothTiltX * cfg.parallax * 10 * currentDpr * 0.5,
          smoothTiltY * cfg.parallax * 10 * currentDpr * 0.5
        );

        // Rendering passes
        if (cfg.fragmentShader) {
          quadMesh.material = materialCustom;
          renderer.setRenderTarget(null);
          renderer.clear();
          renderer.render(scene, camera);
        } else {
          // Pass 1: Flame to Scene Target
          quadMesh.material = materialFlame;
          renderer.setRenderTarget(targetScene);
          renderer.render(scene, camera);

          // Pass 2: Blur Pass
          const blurRadius = (Math.max(cfg.blur, 0) * currentDpr * 0.5) / 2.2;
          if (blurRadius > 0.05) {
            quadMesh.material = materialBlur;
            materialBlur.uniforms.uSource.value = targetScene.texture;
            materialBlur.uniforms.uDirection.value.set(blurRadius / targetScene.width, 0);
            renderer.setRenderTarget(targetPingPong);
            renderer.render(scene, camera);

            materialBlur.uniforms.uSource.value = targetPingPong.texture;
            materialBlur.uniforms.uDirection.value.set(0, blurRadius / targetScene.height);
            renderer.setRenderTarget(targetScene);
            renderer.render(scene, camera);
          }

          // Pass 3: Bloom Chain Downsample & Upsample
          const bloomStrength = Math.min(Math.max(cfg.bloom, 0), 3);
          if (bloomStrength > 0.001) {
            let lastBloom = targetScene;
            quadMesh.material = materialDownsample;

            for (const target of targetBloomChain) {
              materialDownsample.uniforms.uThreshold.value = 0.75 * (lastBloom === targetScene ? 1 : 0);
              materialDownsample.uniforms.uSource.value = lastBloom.texture;
              materialDownsample.uniforms.uTexel.value.set(1 / lastBloom.width, 1 / lastBloom.height);
              renderer.setRenderTarget(target);
              renderer.render(scene, camera);
              lastBloom = target;
            }

            quadMesh.material = materialUpsample;
            for (let idx = targetBloomChain.length - 1; idx > 0; idx--) {
              materialUpsample.uniforms.uSource.value = targetBloomChain[idx].texture;
              materialUpsample.uniforms.uTexel.value.set(
                1 / targetBloomChain[idx].width,
                1 / targetBloomChain[idx].height
              );
              renderer.setRenderTarget(targetBloomChain[idx - 1]);
              renderer.render(scene, camera);
            }
          }

          // Pass 4: Final Screen Composite
          materialComposite.uniforms.uBloomStrength.value = bloomStrength / targetBloomChain.length;
          materialComposite.uniforms.uTime.value = simTime;
          quadMesh.material = materialComposite;
          renderer.setRenderTarget(null);
          renderer.clear();
          renderer.render(scene, camera);
        }

        // Continue loop if active or animated
        if (cfg.playing || introProgress < 1.6 || hoverVal > 0.001) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const kickstart = () => {
        if (!rafId && isVisible && isTabActive) {
          lastTime = 0;
          rafId = requestAnimationFrame(animate);
        }
      };

      // Pointer Event Handlers for 3D Tilt
      const handlePointerMove = (e: PointerEvent) => {
        const cfg = configRef.current;
        if (!cfg.interactive || cfg.reducedMotion) return;

        const bounds = container.getBoundingClientRect();
        if (bounds.width < 1 || bounds.height < 1) return;

        if (e.pointerType === 'touch') return;

        pointerTargetX = Math.min(Math.max(((e.clientX - bounds.left) / bounds.width) * 2 - 1, -1), 1);
        pointerTargetY = Math.min(Math.max(((e.clientY - bounds.top) / bounds.height) * 2 - 1, -1), 1);
        kickstart();
      };

      const handlePointerLeave = () => {
        pointerTargetX = 0;
        pointerTargetY = 0;
        kickstart();
      };

      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerenter', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
      container.addEventListener('pointercancel', handlePointerLeave);

      const resizeObserver = new ResizeObserver(() => {
        needsResize = true;
        kickstart();
      });
      resizeObserver.observe(canvasWrap);

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
          if (isVisible) kickstart();
        },
        { rootMargin: '120px' }
      );
      intersectionObserver.observe(container);

      const handleVisibilityChange = () => {
        isTabActive = 'hidden' !== defaultView.document.visibilityState;
        if (isTabActive) kickstart();
      };
      defaultView.document.addEventListener('visibilitychange', handleVisibilityChange);

      updateColors(configRef.current);
      kickstart();

      controllerRef.current = {
        replay: () => {
          if (!configRef.current.reducedMotion) {
            introProgress = 0;
            kickstart();
          }
        },
        sync: () => {
          kickstart();
        },
      };

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerenter', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
        container.removeEventListener('pointercancel', handlePointerLeave);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        defaultView.document.removeEventListener('visibilitychange', handleVisibilityChange);

        container.style.transform = '';
        if (contentRef.current) contentRef.current.style.transform = '';

        scene.remove(quadMesh);
        quadGeom.dispose();
        materialFlame.dispose();
        materialBlur.dispose();
        materialDownsample.dispose();
        materialUpsample.dispose();
        materialComposite.dispose();
        materialCustom.dispose();
        targetScene.dispose();
        targetPingPong.dispose();
        for (const t of targetBloomChain) t.dispose();
        renderer.dispose();

        if (canvas.parentNode === canvasWrap) {
          canvasWrap.removeChild(canvas);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-[#07080E]/95 shadow-2xl transition-transform duration-200 select-none',
          className
        )}
        style={{
          width: toCssSize(width),
          height: toCssSize(height),
          borderRadius,
          ...(backgroundColor && { backgroundColor }),
          ...style,
        }}
      >
        {/* Luminous Animated Flame Shader Viewport */}
        <div
          ref={canvasWrapRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            opacity,
          }}
        />

        {/* Card Content Surface (Layered above the flame) */}
        {children && (
          <div
            ref={contentRef}
            className="relative z-10 w-full h-full flex flex-col"
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

ShaderCard.displayName = 'ShaderCard';
