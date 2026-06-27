"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./token-sale-scene.module.css";

const COIN_RADIUS = 5.2;
const COIN_DEPTH = 0.56;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getParticleCount() {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;

  if (width < 768) return 2500;
  if (width < 1180 || cores < 6) return 5500;
  if (width >= 1440 && cores >= 8) return 11000;
  return 8000;
}

function formCoin(count: number) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const angle = Math.random() * Math.PI * 2;
    const section = Math.random();

    if (section < 0.74) {
      const side = section < 0.37 ? COIN_DEPTH : -COIN_DEPTH;
      const band = Math.random();
      let radius = Math.sqrt(Math.random()) * COIN_RADIUS * 0.8;

      if (band < 0.28) {
        radius = COIN_RADIUS * (0.86 + Math.random() * 0.14);
      } else if (band < 0.5) {
        radius = COIN_RADIUS * (0.42 + Math.random() * 0.08);
      }

      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = Math.sin(angle) * radius;
      positions[offset + 2] = side + (Math.random() - 0.5) * 0.08;
    } else {
      positions[offset] = Math.cos(angle) * COIN_RADIUS;
      positions[offset + 1] = Math.sin(angle) * COIN_RADIUS;
      positions[offset + 2] = (Math.random() - 0.5) * COIN_DEPTH * 2.2;
    }
  }

  return positions;
}

function formHelix(count: number) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;

    if (Math.random() < 0.16) {
      const radius = 6 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (Math.random() - 0.5) * 15;
      positions[offset + 2] = Math.sin(angle) * radius;
      continue;
    }

    const y = Math.random() * 15 - 7.5;
    const strand = index % 2;
    const angle = y * 0.82 + strand * Math.PI;
    const radius = 2.55 + (Math.random() - 0.5) * 0.36;

    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = y;
    positions[offset + 2] = Math.sin(angle) * radius;
  }

  return positions;
}

function formCitySkyline(count: number) {
  const positions = new Float32Array(count * 3);

  // We define 7 skyscrapers
  const towers = [
    { centerX: -5.8, width: 1.4, height: 7.5, depth: 2.2 },
    { centerX: -3.6, width: 1.5, height: 9.5, depth: 2.2 },
    { centerX: -1.4, width: 1.7, height: 12.0, depth: 2.2 },
    { centerX: 1.2, width: 1.6, height: 13.0, depth: 2.2 },
    { centerX: 3.5, width: 1.4, height: 10.5, depth: 2.2 },
    { centerX: 5.6, width: 1.2, height: 8.5, depth: 2.2 },
    { centerX: -0.2, width: 1.1, height: 6.5, depth: 2.2 },
  ];

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const rand = Math.random();

    if (rand < 0.50) {
      // 50% Skyscrapers
      const tower = towers[Math.floor(Math.random() * towers.length)];
      positions[offset] = tower.centerX + (Math.random() - 0.5) * tower.width;
      positions[offset + 1] = -6.5 + Math.random() * tower.height; // anchored at bottom
      positions[offset + 2] = (Math.random() - 0.5) * tower.depth;
    } else if (rand < 0.75) {
      // 25% Energy lines rising upwards
      const tower = towers[Math.floor(Math.random() * towers.length)];
      positions[offset] = tower.centerX + (Math.random() - 0.5) * 0.15;
      const towerTop = -6.5 + tower.height;
      positions[offset + 1] = towerTop + Math.random() * 8.5;
      positions[offset + 2] = (Math.random() - 0.5) * 0.15;
    } else {
      // 25% Particle clouds at the top
      positions[offset] = (Math.random() - 0.5) * 16;
      positions[offset + 1] = 2.0 + Math.random() * 6.5;
      positions[offset + 2] = (Math.random() - 0.5) * 6;
    }
  }

  return positions;
}

export function TokenSaleWebglCoin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        canvas,
        powerPreference: "high-performance"
      });
    } catch {
      return;
    }

    const particleCount = getParticleCount();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    const coinPositions = formCoin(particleCount);
    const helixPositions = formHelix(particleCount);
    const cityPositions = formCitySkyline(particleCount);

    const seeds = new Float32Array(particleCount);
    const colorTypes = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      seeds[index] = Math.random();
      // ~50% gold, ~50% blue
      colorTypes[index] = Math.random() < 0.5 ? 1.0 : 0.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(coinPositions.slice(), 3));
    geometry.setAttribute("aPosCoin", new THREE.BufferAttribute(coinPositions, 3));
    geometry.setAttribute("aPosHelix", new THREE.BufferAttribute(helixPositions, 3));
    geometry.setAttribute("aPosCity", new THREE.BufferAttribute(cityPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aColorType", new THREE.BufferAttribute(colorTypes, 1));

    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uColorBlue: { value: new THREE.Color("#00d2ff") },
        uColorGold: { value: new THREE.Color("#e7c574") },
        uMix: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.25) },
        uRippleAge: { value: 99 },
        uRippleOrigin: { value: new THREE.Vector3(0, 0, 0) },
        uSize: { value: window.innerWidth < 768 ? 1.45 : 1.65 },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute vec3 aPosCoin;
        attribute vec3 aPosHelix;
        attribute vec3 aPosCity;
        attribute float aSeed;
        attribute float aColorType;

        uniform float uMix;
        uniform float uPixelRatio;
        uniform float uRippleAge;
        uniform vec3 uRippleOrigin;
        uniform float uSize;
        uniform float uTime;

        varying float vAlpha;
        varying float vRipple;
        varying float vColorType;

        void main() {
          vec3 pos;
          if (uMix < 1.0) {
            pos = mix(aPosCoin, aPosHelix, uMix);
          } else {
            pos = mix(aPosHelix, aPosCity, uMix - 1.0);
          }

          pos.x += sin(uTime * 0.42 + aSeed * 47.0) * 0.09;
          pos.y += cos(uTime * 0.34 + aSeed * 83.0) * 0.09;
          pos.z += sin(uTime * 0.28 + aSeed * 101.0) * 0.09;

          float rippleRadius = uRippleAge * 8.5;
          float distanceToRipple = distance(pos.xy, uRippleOrigin.xy);
          float ripple = smoothstep(0.85, 0.0, abs(distanceToRipple - rippleRadius));
          float rippleFade = smoothstep(1.0, 0.0, uRippleAge);
          pos.xy += normalize(pos.xy - uRippleOrigin.xy + 0.0001) * ripple * rippleFade * 0.72;
          pos.z += ripple * rippleFade * 0.5;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (18.0 / -mv.z) * (1.0 + ripple * 0.65);
          
          vAlpha = 0.45 + 0.55 * sin(uTime * 1.6 + aSeed * 90.0);
          vRipple = ripple * rippleFade;
          vColorType = aColorType;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorBlue;
        uniform vec3 uColorGold;

        varying float vAlpha;
        varying float vRipple;
        varying float vColorType;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          
          vec3 baseColor = mix(uColorBlue, uColorGold, vColorType);
          vec3 color = mix(baseColor, vec3(1.0, 0.95, 0.8), vRipple * 0.45);
          
          gl_FragColor = vec4(color, alpha * vAlpha * (0.5 + vRipple));
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    let targetMix = 0;
    let currentMix = 0;
    let frame = 0;
    let running = true;
    const clock = new THREE.Clock();

    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.25);
    };

    const updateScrollMix = () => {
      // Map scrollY: 0 at top, 2.0 when scroll reaches bottom or around 2.2 times window height
      targetMix = clamp((window.scrollY / Math.max(window.innerHeight * 1.5, 1)) * 2, 0, 2);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const triggerRipple = (event: PointerEvent) => {
      const x = ((event.clientX / window.innerWidth) * 2 - 1) * 6.2;
      const y = (-(event.clientY / window.innerHeight) * 2 + 1) * 4.6;
      material.uniforms.uRippleOrigin.value.set(x, y, 0);
      material.uniforms.uRippleAge.value = 0;
    };

    const animate = () => {
      if (!running) return;

      frame = window.requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      currentMix += (targetMix - currentMix) * 0.055;
      material.uniforms.uTime.value = time;
      material.uniforms.uMix.value = currentMix;
      material.uniforms.uRippleAge.value = Math.min(material.uniforms.uRippleAge.value + 0.016, 99);

      points.rotation.y += 0.0035 + currentMix * 0.002;
      points.rotation.z += 0.0013;
      points.rotation.x += (pointer.y * 0.18 - points.rotation.x) * 0.045;
      points.position.x += (pointer.x * 1.25 - points.position.x) * 0.04;
      points.position.y += (pointer.y * 0.85 - points.position.y) * 0.04;

      renderer.render(scene, camera);
    };

    const handleVisibilityChange = () => {
      running = !document.hidden;
      if (running && !frame) {
        clock.start();
        frame = window.requestAnimationFrame(animate);
      } else if (!running && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    updateScrollMix();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScrollMix, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", triggerRipple, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frame = window.requestAnimationFrame(animate);

    return () => {
      running = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScrollMix);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", triggerRipple);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.webglCoinCanvas} aria-hidden="true" />;
}
