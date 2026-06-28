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

    const COUNT = 14000;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 17);

    // Formations exactly matching index page
    function formGalaxy() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const arm = i % 3;
        const r = Math.pow(Math.random(), 0.62) * 10 + 0.3;
        const ang = arm * (Math.PI * 2 / 3) + r * 0.52 + (Math.random() - 0.5) * 0.7;
        a[i*3]   = Math.cos(ang) * r;
        a[i*3+1] = Math.sin(ang) * r * 0.55;
        a[i*3+2] = (Math.random() - 0.5) * Math.max(0.4, 2.4 - r * 0.18);
      }
      return a;
    }

    function formHelix() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        if (Math.random() < 0.14) {
          const r = 5.5 * Math.sqrt(Math.random());
          const th = Math.random() * Math.PI * 2;
          a[i*3] = Math.cos(th) * r; a[i*3+1] = (Math.random() - 0.5) * 19; a[i*3+2] = Math.sin(th) * r;
          continue;
        }
        const t = Math.random() * 19 - 9.5;
        const strand = i % 2;
        const ang = t * 0.72 + strand * Math.PI;
        const r = 3.1 + (Math.random() - 0.5) * 0.5;
        a[i*3]   = Math.cos(ang) * r;
        a[i*3+1] = t;
        a[i*3+2] = Math.sin(ang) * r;
      }
      return a;
    }

    function formLattice() {
      const a = new Float32Array(COUNT * 3);
      const STEPS = 12, HALF = 6.4;
      const snap = () => (Math.floor(Math.random() * STEPS) / (STEPS - 1) - 0.5) * HALF * 2;
      for (let i = 0; i < COUNT; i++) {
        const f = Math.floor(Math.random() * 6);
        const u = snap(), v = snap(), j = () => (Math.random() - 0.5) * 0.22;
        let x, y, z;
        if (f === 0) { x =  HALF; y = u; z = v; }
        else if (f === 1) { x = -HALF; y = u; z = v; }
        else if (f === 2) { y =  HALF; x = u; z = v; }
        else if (f === 3) { y = -HALF; x = u; z = v; }
        else if (f === 4) { z =  HALF; x = u; y = v; }
        else { z = -HALF; x = u; y = v; }
        a[i*3] = x + j(); a[i*3+1] = y + j(); a[i*3+2] = z + j();
      }
      return a;
    }

    function formShards() {
      const a = new Float32Array(COUNT * 3);
      const K = 64, centers: THREE.Vector3[] = [], axes: THREE.Vector3[] = [];
      for (let k = 0; k < K; k++) {
        const d = new THREE.Vector3().randomDirection();
        centers.push(d.clone().multiplyScalar(Math.cbrt(Math.random()) * 8.6));
        axes.push(new THREE.Vector3().randomDirection());
      }
      for (let i = 0; i < COUNT; i++) {
        const k = i % K;
        const c = centers[k], ax = axes[k];
        const sp = new THREE.Vector3().randomDirection().multiplyScalar(Math.pow(Math.random(), 2) * 1.5);
        const mt = (Math.random() - 0.5) * 3.4;
        a[i*3]   = c.x + sp.x + ax.x * mt;
        a[i*3+1] = c.y + sp.y + ax.y * mt;
        a[i*3+2] = c.z + sp.z + ax.z * mt;
      }
      return a;
    }

    const FORMS = [formGalaxy(), formHelix(), formShards(), formLattice()];
    const COLORS = [
      new THREE.Color("#e9d9ae"), // Neutral (Galaxy)
      new THREE.Color("#e7c574"), // Gold (Karakterler)
      new THREE.Color("#ff5b5b"), // Red (Corporations)
      new THREE.Color("#6f9bff")  // Blue (SWOS)
    ];

    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) seeds[i] = Math.random();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(FORMS[0].slice(), 3));
    geometry.setAttribute("aFrom", new THREE.BufferAttribute(FORMS[0].slice(), 3));
    geometry.setAttribute("aTo", new THREE.BufferAttribute(FORMS[0].slice(), 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uSize: { value: 1.55 },
        uPx: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uForce: { value: 1 },
        uColor: { value: COLORS[0].clone() }
      },
      vertexShader: `
        attribute vec3 aFrom;
        attribute vec3 aTo;
        attribute float aSeed;
        uniform float uTime, uMix, uSize, uPx, uForce;
        uniform vec3 uMouse;
        varying float vTw;
        void main() {
          vec3 pos = mix(aFrom, aTo, uMix);
          pos.x += sin(uTime * 0.55 + aSeed * 43.0) * 0.14;
          pos.y += cos(uTime * 0.48 + aSeed * 77.0) * 0.14;
          pos.z += sin(uTime * 0.40 + aSeed * 91.0) * 0.14;
          
          vec3 d = pos - uMouse;
          float f = smoothstep(3.4, 0.0, length(d)) * uForce;
          pos += normalize(d + 0.001) * f * 2.6;
          
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPx * (0.45 + aSeed) * (26.0 / -mv.z);
          vTw = 0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 120.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vTw;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.04, d);
          gl_FragColor = vec4(uColor, a * (0.35 + 0.65 * vTw));
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Track active phase and target variables
    let currentPhase = 0;
    let transitionMix = 0;
    let activeColor = COLORS[0].clone();
    let spinSpeed = 0.05;

    // Handle mouse interactivity
    const ndc = new THREE.Vector2(99, 99);
    const ray = new THREE.Raycaster();
    const mouseWorld = new THREE.Vector3(999, 999, 0);
    let camT = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      camT.x = ndc.x * 1.5;
      camT.y = ndc.y * 1.0;
    };

    window.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      material.uniforms.uPx.value = Math.min(window.devicePixelRatio || 1, 2);
    };

    window.addEventListener("resize", resize);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      // Determine target state index based on hovered monitor
      let targetPhase = 0; // Neutral (Galaxy)
      if (hoveredIndex === 0) targetPhase = 1; // Gold (Helix)
      else if (hoveredIndex === 1) targetPhase = 2; // Red (Shards)
      else if (hoveredIndex === 2) targetPhase = 3; // Blue (Lattice)

      // Handle morphology transitions
      if (currentPhase !== targetPhase) {
        // Swap shapes
        geometry.attributes.aFrom.array.set(FORMS[currentPhase]);
        geometry.attributes.aTo.array.set(FORMS[targetPhase]);
        geometry.attributes.aFrom.needsUpdate = true;
        geometry.attributes.aTo.needsUpdate = true;
        
        transitionMix = 0;
        currentPhase = targetPhase;
      }

      if (transitionMix < 1) {
        transitionMix += 0.03; // Smooth morphology progress
        if (transitionMix > 1) transitionMix = 1;
      }

      material.uniforms.uMix.value = transitionMix;

      // Smooth color transitions
      activeColor.lerp(COLORS[targetPhase], 0.04);
      material.uniforms.uColor.value.copy(activeColor);

      // Rotation & camera parallax
      points.rotation.y += 0.001;
      camera.position.x += (camT.x - camera.position.x) * 0.04;
      camera.position.y += (camT.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Raycast mouse to world coordinates
      ray.setFromCamera(ndc, camera);
      const tt = -ray.ray.origin.z / (ray.ray.direction.z || 1e-6);
      if (tt > 0) {
        mouseWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, tt);
        material.uniforms.uMouse.value.copy(points.worldToLocal(mouseWorld.clone()));
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
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
        width: "100%",
        height: "100%",
        zIndex: 0, // Behind all relative containers, exactly like index page
        pointerEvents: "none"
      }}
      aria-hidden="true"
    />
  );
}
