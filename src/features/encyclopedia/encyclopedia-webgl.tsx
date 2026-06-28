"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface EncyclopediaWebGLProps {
  hoveredIndex: number | null;
}

export function EncyclopediaWebGL({ hoveredIndex }: EncyclopediaWebGLProps) {
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

    const count = 10000;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    // Particle Positions (Spiral Galaxy shape)
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      const angle = (i % 3) * (Math.PI * 2 / 3) + (i * 0.002) + (Math.random() - 0.5) * 0.4;
      const radius = Math.pow(Math.random(), 0.6) * 8 + 0.2;
      
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (Math.random() - 0.5) * 0.8;
      positions[offset + 2] = Math.sin(angle) * radius;
      
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    // Target colors
    const colors = {
      neutral: new THREE.Color("#21262d"),
      gold: new THREE.Color("#e7c574"),
      red: new THREE.Color("#ff5533"),
      blue: new THREE.Color("#7aa7ff")
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: colors.neutral.clone() },
        uPx: { value: Math.min(window.devicePixelRatio || 1, 1.25) }
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uPx;
        varying float vTw;
        
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime * 0.4 + aSeed * 30.0) * 0.12;
          pos.y += cos(uTime * 0.3 + aSeed * 50.0) * 0.12;
          pos.z += sin(uTime * 0.5 + aSeed * 70.0) * 0.12;
          
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * (1.2 + aSeed * 0.8) * (20.0 / -mv.z);
          vTw = 0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 100.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vTw;
        
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(uColor, alpha * (0.2 + 0.5 * vTw));
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation & Resize Handling
    let activeColor = colors.neutral.clone();
    let frameId: number;
    let clock = new THREE.Clock();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      material.uniforms.uPx.value = Math.min(window.devicePixelRatio || 1, 1.25);
    };

    window.addEventListener("resize", resize);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      
      material.uniforms.uTime.value = elapsed;
      points.rotation.y = elapsed * 0.04;

      // Determine target color based on hovered monitor
      let targetColor = colors.neutral;
      if (hoveredIndex === 0) targetColor = colors.gold;
      else if (hoveredIndex === 1) targetColor = colors.red;
      else if (hoveredIndex === 2) targetColor = colors.blue;

      // Smooth color transition (lerp)
      activeColor.lerp(targetColor, 0.04);
      material.uniforms.uColor.value.copy(activeColor);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [hoveredIndex]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
        userSelect: "none"
      }}
      aria-hidden="true"
    />
  );
}
