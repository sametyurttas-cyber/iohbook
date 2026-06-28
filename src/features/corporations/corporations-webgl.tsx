"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getParticleCount() {
  const width = window.innerWidth;
  if (width < 768) return 2000;
  if (width < 1180) return 4000;
  return 6000;
}

// Cubic Block Structure representing Corporation servers
function formBlockMatrix(count: number) {
  const positions = new Float32Array(count * 3);
  const size = 6.0;

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    // Distribute particles in a modular lattice grid structure (cubes and line nodes)
    if (Math.random() < 0.4) {
      // Core cluster
      positions[offset] = (Math.random() - 0.5) * size;
      positions[offset + 1] = (Math.random() - 0.5) * size;
      positions[offset + 2] = (Math.random() - 0.5) * size;
    } else {
      // Outer networking lines
      const axis = Math.floor(Math.random() * 3);
      positions[offset] = (Math.random() - 0.5) * size * 1.5;
      positions[offset + 1] = (Math.random() - 0.5) * size * 1.5;
      positions[offset + 2] = (Math.random() - 0.5) * size * 1.5;
      // Force snapped coordinates on some axes for rigid wireframe look
      positions[offset + axis] = Math.round(positions[offset + axis] / 1.5) * 1.5;
    }
  }
  return positions;
}

// Flat Horizontal Flow Network (Ubless / Social Media data routing)
function formFlowGrid(count: number) {
  const positions = new Float32Array(count * 3);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const col = i % cols;
    const row = Math.floor(i / cols);

    positions[offset] = (col - cols / 2) * 0.45;
    positions[offset + 1] = (Math.random() - 0.5) * 2.0; // flat plane
    positions[offset + 2] = (row - rows / 2) * 0.45;
  }
  return positions;
}

// Spiral Plasma vortex (Quality Energy / Tencon AI)
function formHelixReactor(count: number) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const angle = i * 0.05;
    const radius = 2.5 + Math.sin(i * 0.01) * 1.0;
    const y = (i / count - 0.5) * 12.0;

    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = y;
    positions[offset + 2] = Math.sin(angle) * radius;
  }
  return positions;
}

export function CorporationsWebGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const blockPositions = formBlockMatrix(particleCount);
    const flowPositions = formFlowGrid(particleCount);
    const reactorPositions = formHelixReactor(particleCount);

    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      seeds[i] = Math.random();
    }

    // Color definitions for all 7 companies
    const colors = Array.from({ length: 7 }, () => new Float32Array(particleCount * 3));
    const accentColors = [
      new THREE.Color("#e7c574"), // Agrom Gold
      new THREE.Color("#ff5bdf"), // Nets Magenta
      new THREE.Color("#4aa8ff"), // Tencon Blue
      new THREE.Color("#ff9f43"), // Quality Energy Orange
      new THREE.Color("#f5d26a"), // Ubless Amber
      new THREE.Color("#ff4d6d"), // Social Media Red
      new THREE.Color("#d6a84f")  // Miner Henry Warm Gold
    ];

    for (let cIdx = 0; cIdx < 7; cIdx++) {
      const col = accentColors[cIdx];
      const colorBuffer = colors[cIdx];
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        colorBuffer[idx] = col.r;
        colorBuffer[idx + 1] = col.g;
        colorBuffer[idx + 2] = col.b;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(blockPositions.slice(), 3));
    geometry.setAttribute("aPosBlock", new THREE.BufferAttribute(blockPositions, 3));
    geometry.setAttribute("aPosFlow", new THREE.BufferAttribute(flowPositions, 3));
    geometry.setAttribute("aPosReactor", new THREE.BufferAttribute(reactorPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    // Staging colors for companies
    geometry.setAttribute("color0", new THREE.BufferAttribute(colors[0], 3));
    geometry.setAttribute("color1", new THREE.BufferAttribute(colors[1], 3));
    geometry.setAttribute("color2", new THREE.BufferAttribute(colors[2], 3));
    geometry.setAttribute("color3", new THREE.BufferAttribute(colors[3], 3));
    geometry.setAttribute("color4", new THREE.BufferAttribute(colors[4], 3));
    geometry.setAttribute("color5", new THREE.BufferAttribute(colors[5], 3));
    geometry.setAttribute("color6", new THREE.BufferAttribute(colors[6], 3));

    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uScrollMix: { value: 0 },
        uColorScrollMix: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.25) },
        uSize: { value: window.innerWidth < 768 ? 1.45 : 1.65 },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute vec3 aPosBlock;
        attribute vec3 aPosFlow;
        attribute vec3 aPosReactor;
        attribute float aSeed;

        attribute vec3 color0;
        attribute vec3 color1;
        attribute vec3 color2;
        attribute vec3 color3;
        attribute vec3 color4;
        attribute vec3 color5;
        attribute vec3 color6;

        uniform float uScrollMix;
        uniform float uColorScrollMix;
        uniform float uPixelRatio;
        uniform float uSize;
        uniform float uTime;

        varying float vAlpha;
        varying vec3 vColor;

        vec3 getMorphedPosition() {
          if (uScrollMix < 1.0) {
            return mix(aPosBlock, aPosFlow, uScrollMix);
          } else {
            return mix(aPosFlow, aPosReactor, clamp(uScrollMix - 1.0, 0.0, 1.0));
          }
        }

        vec3 getMorphedColor() {
          if (uColorScrollMix < 1.0) {
            return mix(color0, color1, uColorScrollMix);
          } else if (uColorScrollMix < 2.0) {
            return mix(color1, color2, uColorScrollMix - 1.0);
          } else if (uColorScrollMix < 3.0) {
            return mix(color2, color3, uColorScrollMix - 2.0);
          } else if (uColorScrollMix < 4.0) {
            return mix(color3, color4, uColorScrollMix - 3.0);
          } else if (uColorScrollMix < 5.0) {
            return mix(color4, color5, uColorScrollMix - 4.0);
          } else {
            return mix(color5, color6, clamp(uColorScrollMix - 5.0, 0.0, 1.0));
          }
        }

        void main() {
          vec3 pos = getMorphedPosition();
          vColor = getMorphedColor();

          // Organic network jitter
          pos.x += sin(uTime * 0.4 + aSeed * 30.0) * 0.06;
          pos.y += cos(uTime * 0.35 + aSeed * 50.0) * 0.06;
          pos.z += sin(uTime * 0.25 + aSeed * 80.0) * 0.06;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (18.0 / -mv.z);
          
          vAlpha = 0.35 + 0.65 * sin(uTime * 1.5 + aSeed * 90.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor, alpha * vAlpha * 0.75);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    let targetMix = 0;
    let currentMix = 0;
    let targetColorMix = 0;
    let currentColorMix = 0;

    let frame = 0;
    let running = true;
    const clock = new THREE.Clock();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.25);
      material.uniforms.uSize.value = w < 768 ? 1.45 : 1.65;
    };

    const ids = ["agrom", "nets", "tencon", "qualty", "ubless", "social-media", "miner-henry"];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      
      // Morph between 3 shapes (0.0 to 2.0)
      targetMix = clamp((scrollY / docHeight) * 2, 0, 2);

      // Color transition between 7 companies (0.0 to 6.0)
      const mid = window.innerHeight / 2;
      let minDistance = Infinity;
      let activeIdx = 0;

      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs((rect.top + rect.bottom) / 2 - mid);
          if (dist < minDistance) {
            minDistance = dist;
            activeIdx = i;
          }
        }
      }
      targetColorMix = activeIdx;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      if (!running) return;

      frame = window.requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      currentMix += (targetMix - currentMix) * 0.05;
      currentColorMix += (targetColorMix - currentColorMix) * 0.05;

      material.uniforms.uTime.value = time;
      material.uniforms.uScrollMix.value = currentMix;
      material.uniforms.uColorScrollMix.value = currentColorMix;

      points.rotation.y += 0.002 + currentMix * 0.001;
      points.rotation.z += 0.0006;
      points.rotation.x += (pointer.y * 0.08 - points.rotation.x) * 0.035;
      points.position.x += (pointer.x * 0.8 - points.position.x) * 0.03;
      points.position.y += (pointer.y * 0.5 - points.position.y) * 0.03;

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

    handleScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frame = window.requestAnimationFrame(animate);

    return () => {
      running = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        background: "radial-gradient(circle at center, #07090f 0%, #030407 100%)"
      }}
      aria-hidden="true"
    />
  );
}
