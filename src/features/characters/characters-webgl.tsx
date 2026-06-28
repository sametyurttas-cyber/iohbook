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

// Clone original mathematical shapes from /author page
function formSphere(count: number) {
  const positions = new Float32Array(count * 3);
  const radius = 5.5;

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    let r: number;
    if (i < count * 0.85) {
      if (Math.random() < 0.65) {
        r = radius * (0.92 + Math.random() * 0.08);
      } else {
        r = radius * Math.cbrt(Math.random()) * 0.72;
      }
    } else {
      r = radius * (1.1 + Math.random() * 2.2);
    }

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

export function CharactersWebGL() {
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

    const spherePositions = formSphere(particleCount);
    const gridPositions = formGrid(particleCount);
    const vortexPositions = formVortex(particleCount);

    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      seeds[i] = Math.random();
    }

    // Color lists for the 5 characters
    const colors0 = new Float32Array(particleCount * 3);
    const colors1 = new Float32Array(particleCount * 3);
    const colors2 = new Float32Array(particleCount * 3);
    const colors3 = new Float32Array(particleCount * 3);
    const colors4 = new Float32Array(particleCount * 3);

    const col0 = new THREE.Color("#e7c574"); // Gold (Algus)
    const col1 = new THREE.Color("#ff5b7f"); // Pink (Mina)
    const col2 = new THREE.Color("#78c7ff"); // Light Blue (Kevin)
    const col3 = new THREE.Color("#6f9bff"); // Indigo (Mike)
    const col4 = new THREE.Color("#65e6df"); // Teal (Elia)

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      colors0[idx] = col0.r; colors0[idx + 1] = col0.g; colors0[idx + 2] = col0.b;
      colors1[idx] = col1.r; colors1[idx + 1] = col1.g; colors1[idx + 2] = col1.b;
      colors2[idx] = col2.r; colors2[idx + 1] = col2.g; colors2[idx + 2] = col2.b;
      colors3[idx] = col3.r; colors3[idx + 1] = col3.g; colors3[idx + 2] = col3.b;
      colors4[idx] = col4.r; colors4[idx + 1] = col4.g; colors4[idx + 2] = col4.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(spherePositions.slice(), 3));
    geometry.setAttribute("aPosSphere", new THREE.BufferAttribute(spherePositions, 3));
    geometry.setAttribute("aPosGrid", new THREE.BufferAttribute(gridPositions, 3));
    geometry.setAttribute("aPosVortex", new THREE.BufferAttribute(vortexPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    // Staging character colors
    geometry.setAttribute("color0", new THREE.BufferAttribute(colors0, 3));
    geometry.setAttribute("color1", new THREE.BufferAttribute(colors1, 3));
    geometry.setAttribute("color2", new THREE.BufferAttribute(colors2, 3));
    geometry.setAttribute("color3", new THREE.BufferAttribute(colors3, 3));
    geometry.setAttribute("color4", new THREE.BufferAttribute(colors4, 3));

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
        attribute vec3 aPosSphere;
        attribute vec3 aPosGrid;
        attribute vec3 aPosVortex;
        attribute float aSeed;

        attribute vec3 color0;
        attribute vec3 color1;
        attribute vec3 color2;
        attribute vec3 color3;
        attribute vec3 color4;

        uniform float uScrollMix;
        uniform float uColorScrollMix;
        uniform float uPixelRatio;
        uniform float uSize;
        uniform float uTime;

        varying float vAlpha;
        varying vec3 vColor;

        vec3 getMorphedPosition() {
          if (uScrollMix < 1.0) {
            return mix(aPosSphere, aPosGrid, uScrollMix);
          } else {
            return mix(aPosGrid, aPosVortex, clamp(uScrollMix - 1.0, 0.0, 1.0));
          }
        }

        vec3 getMorphedColor() {
          if (uColorScrollMix < 1.0) {
            return mix(color0, color1, uColorScrollMix);
          } else if (uColorScrollMix < 2.0) {
            return mix(color1, color2, uColorScrollMix - 1.0);
          } else if (uColorScrollMix < 3.0) {
            return mix(color2, color3, uColorScrollMix - 2.0);
          } else {
            return mix(color3, color4, clamp(uColorScrollMix - 3.0, 0.0, 1.0));
          }
        }

        void main() {
          vec3 pos = getMorphedPosition();
          vColor = getMorphedColor();

          // Subtle organic motion from /author
          pos.x += sin(uTime * 0.35 + aSeed * 47.0) * 0.08;
          pos.y += cos(uTime * 0.31 + aSeed * 83.0) * 0.08;
          pos.z += sin(uTime * 0.25 + aSeed * 101.0) * 0.08;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.65 + aSeed * 0.8) * (18.0 / -mv.z);
          
          vAlpha = 0.4 + 0.6 * sin(uTime * 1.5 + aSeed * 90.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor, alpha * vAlpha * 0.8);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    let targetMix = 0;
    let currentMix = 0;
    
    // We map 5 characters to 4 transitions (0.0 to 4.0) for colors
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

    // Pin scroll triggers
    const ids = ["algus", "mina", "kevin", "mike", "elia"];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      
      // Morph mix matching /author page: 0.0 to 2.0
      targetMix = clamp((scrollY / docHeight) * 2, 0, 2);

      // Find closest character section to update color mix dynamically (0.0 to 4.0)
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

      // Lerp indices
      currentMix += (targetMix - currentMix) * 0.055;
      currentColorMix += (targetColorMix - currentColorMix) * 0.05;

      material.uniforms.uTime.value = time;
      material.uniforms.uScrollMix.value = currentMix;
      material.uniforms.uColorScrollMix.value = currentColorMix;

      // Pointer interactions and rotations matching /author page
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
