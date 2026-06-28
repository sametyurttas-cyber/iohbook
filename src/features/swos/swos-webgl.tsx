"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function SwosWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const count = 4000;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle geometries - concentric security rings
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      
      // Distribute particles into 3 concentric rings (SWOS Defense shields)
      const ringIndex = i % 3;
      let radius = 1.8 + ringIndex * 1.5;
      
      // Add random noise to radius
      radius += (Math.random() - 0.5) * 0.15;
      
      const angle = Math.random() * Math.PI * 2;
      
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = (Math.random() - 0.5) * 0.25; // flat plane depth
      positions[offset + 2] = Math.sin(angle) * radius;
      
      // Cold blue and red colors
      if (Math.random() < 0.15) {
        // Warning emergency red
        colors[offset] = 1.0;
        colors[offset + 1] = 0.23;
        colors[offset + 2] = 0.23;
      } else {
        // Federal ice blue
        colors[offset] = 0.48;
        colors[offset + 1] = 0.65;
        colors[offset + 2] = 1.0;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom shader material for square retro cyber points
    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Grid Helper at the bottom for siber-grid aesthetic
    const gridHelper = new THREE.GridHelper(16, 16, 0x7aa7ff, 0x30363d);
    gridHelper.position.y = -2.5;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

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

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate points slowly
      points.rotation.y = elapsedTime * 0.05;
      points.rotation.x = Math.sin(elapsedTime * 0.03) * 0.08;
      
      // Slow rotation for the bottom grid
      gridHelper.rotation.y = -elapsedTime * 0.02;

      // Inertial mouse tracking
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
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ mixBlendMode: "screen" }}
    />
  );
}
