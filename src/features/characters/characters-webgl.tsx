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

    // 1. Scene, Camera, WebGLRenderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Generate Particles
    const count = window.innerWidth < 768 ? 1500 : 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    // Character color palette mapping
    const palette = [
      new THREE.Color("#e7c574"), // Gold (Algus)
      new THREE.Color("#ff5b7f"), // Pink/Magenta (Mina)
      new THREE.Color("#78c7ff"), // Light Blue (Kevin)
      new THREE.Color("#6f9bff"), // Indigo (Mike)
      new THREE.Color("#65e6df")  // Teal (Elia)
    ];

    for (let i = 0; i < count; i++) {
      // Random coordinates inside a bounding box
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Assign random color from palette
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Small vertical drift velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() + 0.1) * 0.008; // upward bias
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom Shader Material for beautiful glowing circular particles
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (14.0 / -mvPosition.z) * (2.0 - sin(position.y * 0.2));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular gradient glow
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float strength = 1.0 - (d * 2.0);
          strength = pow(strength, 1.5);
          gl_FragColor = vec4(vColor, strength * 0.85);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 3. Mouse Parallax Setup
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 4. Animation loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;

      // Update particle positions (upward drift + bounce constraints)
      for (let i = 0; i < count; i++) {
        posAttr.setY(i, posAttr.getY(i) + velocities[i * 3 + 1]);
        posAttr.setX(i, posAttr.getX(i) + velocities[i * 3] * Math.sin(posAttr.getY(i) * 0.2));

        // Recycle particle if it drifts above boundary
        if (posAttr.getY(i) > 8) {
          posAttr.setY(i, -8);
          posAttr.setX(i, (Math.random() - 0.5) * 20);
        }
      }
      posAttr.needsUpdate = true;

      // Smooth mouse interpolation (lerp)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      points.rotation.y = currentX * 0.2;
      points.rotation.x = -currentY * 0.2;

      // Slow orbital rotate
      points.rotation.z += 0.02 * delta;

      renderer.render(scene, camera);
    };

    animate();

    // 5. Resize handler
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
