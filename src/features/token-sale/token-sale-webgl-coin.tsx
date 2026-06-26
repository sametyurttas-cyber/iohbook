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

  if (width < 768) return 2200;
  if (width < 1180 || cores < 6) return 4800;
  if (width >= 1440 && cores >= 8) return 10000;
  return 7200;
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
    const seeds = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      seeds[index] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(coinPositions.slice(), 3));
    geometry.setAttribute("aFrom", new THREE.BufferAttribute(coinPositions, 3));
    geometry.setAttribute("aTo", new THREE.BufferAttribute(helixPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color("#00d2ff") },
        uMix: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.25) },
        uRippleAge: { value: 99 },
        uRippleOrigin: { value: new THREE.Vector3(0, 0, 0) },
        uSize: { value: window.innerWidth < 768 ? 1.45 : 1.65 },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute vec3 aFrom;
        attribute vec3 aTo;
        attribute float aSeed;
        uniform float uMix;
        uniform float uPixelRatio;
        uniform float uRippleAge;
        uniform vec3 uRippleOrigin;
        uniform float uSize;
        uniform float uTime;
        varying float vAlpha;
        varying float vRipple;

        void main() {
          vec3 pos = mix(aFrom, aTo, uMix);
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
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        varying float vRipple;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          vec3 color = mix(uColor, vec3(1.0, 0.86, 0.48), vRipple * 0.45);
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
      targetMix = clamp(window.scrollY / Math.max(window.innerHeight * 1.4, 1), 0, 1);
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
