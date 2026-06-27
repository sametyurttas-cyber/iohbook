"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./author-manifesto.module.css";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getParticleCount() {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;

  if (width < 768) return 2000;
  if (width < 1180 || cores < 6) return 4000;
  if (width >= 1440 && cores >= 8) return 8000;
  return 6000;
}

function formSphere(count: number) {
  const positions = new Float32Array(count * 3);
  const radius = 5.5;

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius * Math.cbrt(Math.random()); // distribute within volume

    positions[offset] = r * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[offset + 2] = r * Math.cos(phi);
  }

  return positions;
}

function formGrid(count: number) {
  const positions = new Float32Array(count * 3);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Centered grid pattern
    positions[offset] = (col - cols / 2) * 0.42;
    positions[offset + 1] = (row - rows / 2) * 0.42;
    positions[offset + 2] = (Math.random() - 0.5) * 3;
  }

  return positions;
}

function formVortex(count: number) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const angle = i * 0.08;
    const radius = 0.08 * Math.pow(i, 0.58) + (Math.random() - 0.5) * 0.4;

    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(angle) * radius;
    positions[offset + 2] = (Math.random() - 0.5) * 14;
  }

  return positions;
}

export function AuthorWebglMatrix() {
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

    const spherePositions = formSphere(particleCount);
    const gridPositions = formGrid(particleCount);
    const vortexPositions = formVortex(particleCount);

    const seeds = new Float32Array(particleCount);
    const colorTypes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      seeds[i] = Math.random();
      // ~33% Gold, ~33% Blue, ~34% Red
      const r = Math.random();
      if (r < 0.33) {
        colorTypes[i] = 0.0; // Gold
      } else if (r < 0.66) {
        colorTypes[i] = 1.0; // Blue
      } else {
        colorTypes[i] = 2.0; // Red
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(spherePositions.slice(), 3));
    geometry.setAttribute("aPosSphere", new THREE.BufferAttribute(spherePositions, 3));
    geometry.setAttribute("aPosGrid", new THREE.BufferAttribute(gridPositions, 3));
    geometry.setAttribute("aPosVortex", new THREE.BufferAttribute(vortexPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aColorType", new THREE.BufferAttribute(colorTypes, 1));

    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uColorGold: { value: new THREE.Color("#e7c574") },
        uColorBlue: { value: new THREE.Color("#00d2ff") },
        uColorRed: { value: new THREE.Color("#ff5b5b") },
        uMix: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.25) },
        uSize: { value: window.innerWidth < 768 ? 1.45 : 1.65 },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute vec3 aPosSphere;
        attribute vec3 aPosGrid;
        attribute vec3 aPosVortex;
        attribute float aSeed;
        attribute float aColorType;

        uniform float uMix;
        uniform float uPixelRatio;
        uniform float uSize;
        uniform float uTime;

        varying float vAlpha;
        varying float vColorType;

        void main() {
          vec3 pos;
          if (uMix < 1.0) {
            pos = mix(aPosSphere, aPosGrid, uMix);
            // Smoothly shift the neural sphere to the right behind the portrait
            pos.x += (1.0 - uMix) * 2.5;
            pos.y -= (1.0 - uMix) * 0.5;
          } else {
            pos = mix(aPosGrid, aPosVortex, uMix - 1.0);
          }

          // Subtle organic motion
          pos.x += sin(uTime * 0.35 + aSeed * 47.0) * 0.08;
          pos.y += cos(uTime * 0.31 + aSeed * 83.0) * 0.08;
          pos.z += sin(uTime * 0.25 + aSeed * 101.0) * 0.08;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.65 + aSeed * 0.8) * (18.0 / -mv.z);
          
          vAlpha = 0.4 + 0.6 * sin(uTime * 1.5 + aSeed * 90.0);
          vColorType = aColorType;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorGold;
        uniform vec3 uColorBlue;
        uniform vec3 uColorRed;

        varying float vAlpha;
        varying float vColorType;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          
          vec3 baseColor;
          if (vColorType < 0.5) {
            baseColor = uColorGold;
          } else if (vColorType < 1.5) {
            baseColor = uColorBlue;
          } else {
            baseColor = uColorRed;
          }
          
          gl_FragColor = vec4(baseColor, alpha * vAlpha * 0.8);
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
      // Map scroll: 0 at top, 2.0 at bottom
      targetMix = clamp((window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) * 2, 0, 2);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      if (!running) return;

      frame = window.requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      currentMix += (targetMix - currentMix) * 0.055;
      material.uniforms.uTime.value = time;
      material.uniforms.uMix.value = currentMix;

      points.rotation.y += 0.0028 + currentMix * 0.0015;
      points.rotation.z += 0.0008;
      points.rotation.x += (pointer.y * 0.12 - points.rotation.x) * 0.04;
      points.position.x += (pointer.x * 0.95 - points.position.x) * 0.035;
      points.position.y += (pointer.y * 0.65 - points.position.y) * 0.035;

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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.webglCanvas} aria-hidden="true" />;
}
