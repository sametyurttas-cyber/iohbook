"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getParticleCount() {
  const width = window.innerWidth;
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;

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

export function SwosWebGL() {
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
    const colorTypes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      seeds[i] = Math.random();
      // ~33% Light Grey, ~33% Muted Grey, ~34% Dark Grey
      const r = Math.random();
      if (r < 0.33) {
        colorTypes[i] = 0.0;
      } else if (r < 0.66) {
        colorTypes[i] = 1.0;
      } else {
        colorTypes[i] = 2.0;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(spherePositions.slice(), 3));
    geometry.setAttribute("aPosSphere", new THREE.BufferAttribute(spherePositions, 3));
    geometry.setAttribute("aPosGrid", new THREE.BufferAttribute(gridPositions, 3));
    geometry.setAttribute("aPosVortex", new THREE.BufferAttribute(vortexPositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aColorType", new THREE.BufferAttribute(colorTypes, 1));

    // Grey colors matching bureaucratic state
    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uColorLight: { value: new THREE.Color("#d8dee9") },
        uColorMuted: { value: new THREE.Color("#8b949e") },
        uColorDark: { value: new THREE.Color("#484f58") },
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
            // Center slightly on screen
            pos.x += (1.0 - uMix) * 1.5;
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
        uniform vec3 uColorLight;
        uniform vec3 uColorMuted;
        uniform vec3 uColorDark;

        varying float vAlpha;
        varying float vColorType;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.06, d);
          
          vec3 baseColor;
          if (vColorType < 0.5) {
            baseColor = uColorLight;
          } else if (vColorType < 1.5) {
            baseColor = uColorMuted;
          } else {
            baseColor = uColorDark;
          }
          
          gl_FragColor = vec4(baseColor, alpha * vAlpha * 0.5);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse movement response
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Scroll morphing
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      // Morph through 0 to 2
      material.uniforms.uMix.value = scrollPercent * 2.0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.25);
      material.uniforms.uSize.value = window.innerWidth < 768 ? 1.45 : 1.65;
    };
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // Rotation
      points.rotation.y = elapsedTime * 0.03;
      points.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

      // Mouse tracking inertia
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.5;
      camera.position.y = -targetY * 1.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
      style={{ mixBlendMode: "screen", display: "block" }}
    />
  );
}
