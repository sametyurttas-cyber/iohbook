"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CharactersWebGL() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    
    // Increased FOV and pulled camera slightly back to make particles occupy a massive canvas view
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    camera.position.z = 13;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Generate 5 Colossal Mathematical Shapes
    const count = window.innerWidth < 768 ? 3000 : 8000; // Increased particle density
    
    const pos0 = new Float32Array(count * 3); // 1. Sphere (Algus - Gold)
    const pos1 = new Float32Array(count * 3); // 2. Mirror Grid (Mina - Pink)
    const pos2 = new Float32Array(count * 3); // 3. Cyber Cylinder Gate (Kevin - Light Blue)
    const pos3 = new Float32Array(count * 3); // 4. Lattice Cube (Mike - Indigo)
    const pos4 = new Float32Array(count * 3); // 5. Signal Wave Vortex (Elia - Teal)

    const colors0 = new Float32Array(count * 3);
    const colors1 = new Float32Array(count * 3);
    const colors2 = new Float32Array(count * 3);
    const colors3 = new Float32Array(count * 3);
    const colors4 = new Float32Array(count * 3);

    // Dynamic high-contrast colors matching characters
    const col0 = new THREE.Color("#e7c574"); // Gold
    const col1 = new THREE.Color("#ff5b7f"); // Pink
    const col2 = new THREE.Color("#78c7ff"); // Light Blue
    const col3 = new THREE.Color("#6f9bff"); // Indigo
    const col4 = new THREE.Color("#65e6df"); // Teal

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Color assignments
      colors0[idx] = col0.r; colors0[idx + 1] = col0.g; colors0[idx + 2] = col0.b;
      colors1[idx] = col1.r; colors1[idx + 1] = col1.g; colors1[idx + 2] = col1.b;
      colors2[idx] = col2.r; colors2[idx + 1] = col2.g; colors2[idx + 2] = col2.b;
      colors3[idx] = col3.r; colors3[idx + 1] = col3.g; colors3[idx + 2] = col3.b;
      colors4[idx] = col4.r; colors4[idx + 1] = col4.g; colors4[idx + 2] = col4.b;

      // Shape 0: Sphere Shell (Algus) - Giant Sphere spanning the full canvas
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r0 = 11.5 * (0.8 + Math.random() * 0.2); // Scaled from 4.2 to 11.5
      pos0[idx] = r0 * Math.sin(phi) * Math.cos(theta);
      pos0[idx + 1] = r0 * Math.sin(phi) * Math.sin(theta);
      pos0[idx + 2] = r0 * Math.cos(phi);

      // Shape 1: Double Parallel Grid / Planes (Mina) - Giant floating mirror walls
      const side = Math.random() > 0.5 ? 1.0 : -1.0;
      pos1[idx] = (Math.random() - 0.5) * 26.0; // Scaled from 8.5 to 26.0
      pos1[idx + 1] = (Math.random() - 0.5) * 26.0;
      pos1[idx + 2] = side * 3.5 + (Math.random() - 0.5) * 0.5;

      // Shape 2: Cyber Gate / Ring Cylinder (Kevin) - Massive defense cylinder shield
      const theta2 = Math.random() * 2.0 * Math.PI;
      const r2 = 9.5 + Math.random() * 1.5; // Scaled from 3.6 to 9.5
      pos2[idx] = r2 * Math.cos(theta2);
      pos2[idx + 1] = (Math.random() - 0.5) * 20.0; // Scaled from 6.5 to 20.0
      pos2[idx + 2] = r2 * Math.sin(theta2);

      // Shape 3: Lattice Cube (Mike) - Gigantic grid voxel box
      pos3[idx] = (Math.random() - 0.5) * 16.5; // Scaled from 6.0 to 16.5
      pos3[idx + 1] = (Math.random() - 0.5) * 16.5;
      pos3[idx + 2] = (Math.random() - 0.5) * 16.5;

      // Shape 4: Signal Helix Vortex (Elia) - Colossal wave column
      const y4 = (Math.random() - 0.5) * 22.0; // Scaled from 8.0 to 22.0
      const angle4 = y4 * 0.6;
      const r4 = 6.0 + Math.sin(y4 * 0.8) * 1.5; // Scaled radius
      const side4 = Math.random() > 0.5 ? 1.0 : -1.0;
      pos4[idx] = r4 * Math.cos(angle4 + side4 * Math.PI);
      pos4[idx + 1] = y4;
      pos4[idx + 2] = r4 * Math.sin(angle4 + side4 * Math.PI);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos0.slice(), 3));

    // Custom shape coordinates attributes
    geometry.setAttribute("pos0", new THREE.BufferAttribute(pos0, 3));
    geometry.setAttribute("pos1", new THREE.BufferAttribute(pos1, 3));
    geometry.setAttribute("pos2", new THREE.BufferAttribute(pos2, 3));
    geometry.setAttribute("pos3", new THREE.BufferAttribute(pos3, 3));
    geometry.setAttribute("pos4", new THREE.BufferAttribute(pos4, 3));

    // Custom color attributes
    geometry.setAttribute("color0", new THREE.BufferAttribute(colors0, 3));
    geometry.setAttribute("color1", new THREE.BufferAttribute(colors1, 3));
    geometry.setAttribute("color2", new THREE.BufferAttribute(colors2, 3));
    geometry.setAttribute("color3", new THREE.BufferAttribute(colors3, 3));
    geometry.setAttribute("color4", new THREE.BufferAttribute(colors4, 3));

    // 3. Shaders with Dynamic Morphs and ENHANCED POINT SIZE
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uScrollIndex: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        uniform float uScrollIndex;
        uniform float uTime;

        attribute vec3 pos0;
        attribute vec3 pos1;
        attribute vec3 pos2;
        attribute vec3 pos3;
        attribute vec3 pos4;

        attribute vec3 color0;
        attribute vec3 color1;
        attribute vec3 color2;
        attribute vec3 color3;
        attribute vec3 color4;

        varying vec3 vColor;

        vec3 getMorphedPosition() {
          if (uScrollIndex < 1.0) {
            return mix(pos0, pos1, uScrollIndex);
          } else if (uScrollIndex < 2.0) {
            return mix(pos1, pos2, uScrollIndex - 1.0);
          } else if (uScrollIndex < 3.0) {
            return mix(pos2, pos3, uScrollIndex - 2.0);
          } else {
            return mix(pos3, pos4, clamp(uScrollIndex - 3.0, 0.0, 1.0));
          }
        }

        vec3 getMorphedColor() {
          if (uScrollIndex < 1.0) {
            return mix(color0, color1, uScrollIndex);
          } else if (uScrollIndex < 2.0) {
            return mix(color1, color2, uScrollIndex - 1.0);
          } else if (uScrollIndex < 3.0) {
            return mix(color2, color3, uScrollIndex - 2.0);
          } else {
            return mix(color3, color4, clamp(uScrollIndex - 3.0, 0.0, 1.0));
          }
        }

        void main() {
          vec3 morphedPos = getMorphedPosition();
          vColor = getMorphedColor();

          // Apply organic wave distortion during transitions
          float transitionPhase = sin(uScrollIndex * 3.14159);
          morphedPos.x += sin(morphedPos.y * 0.4 + uTime * 2.0) * transitionPhase * 0.8;
          morphedPos.z += cos(morphedPos.y * 0.4 + uTime * 2.0) * transitionPhase * 0.8;

          vec4 mvPosition = modelViewMatrix * vec4(morphedPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // INCREASED POINT SIZE: Base scale increased from 15.0 to 48.0 for colossal glowing stars
          gl_PointSize = (48.0 / -mvPosition.z) * (1.3 + 0.4 * sin(uTime * 2.5 + morphedPos.y * 0.15));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Glow texture falloff circular mask
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          
          // Smooth color strength falloff for beautiful bokeh points
          float strength = 1.0 - (d * 2.0);
          strength = pow(strength, 1.3); // Softer curve for wider glow
          gl_FragColor = vec4(vColor, strength * 0.95);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 4. Scroll position calculation triggers
    const ids = ["algus", "mina", "kevin", "mike", "elia"];
    let targetScrollIndex = 0;
    let currentScrollIndex = 0;

    const handleScroll = () => {
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
      targetScrollIndex = activeIdx;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // 5. Mouse Parallax coords
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Smooth index transition
      currentScrollIndex += (targetScrollIndex - currentScrollIndex) * 0.05;
      material.uniforms.uScrollIndex.value = currentScrollIndex;

      // Smooth parallax
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      points.rotation.y = currentX * 0.25 + elapsed * 0.035;
      points.rotation.x = -currentY * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        background: "radial-gradient(circle at center, #07090f 0%, #030407 100%)"
      }}
    />
  );
}
