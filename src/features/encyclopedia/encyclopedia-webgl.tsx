"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface EncyclopediaWebGLProps {
  hoveredIndex: number | null;
  pageContext?: "portal" | "ai";
}

export function EncyclopediaWebGL({ hoveredIndex, pageContext = "portal" }: EncyclopediaWebGLProps) {
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

    // Concept-specific custom shapes
    function formStars() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const offset = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2.0 * Math.random() - 1.0);
        const radius = 6.0 + Math.random() * 18.0; // Wide cosmic dispersion

        a[offset] = radius * Math.sin(phi) * Math.cos(theta);
        a[offset + 1] = radius * Math.sin(phi) * Math.sin(theta);
        a[offset + 2] = radius * Math.cos(phi);
      }
      return a;
    }

    function formCyberTunnel() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const ang = Math.random() * Math.PI * 2;
        const radius = 3.2 + (Math.random() - 0.5) * 0.3;
        a[i*3] = Math.cos(ang) * radius;
        a[i*3+1] = (Math.random() - 0.5) * 16;
        a[i*3+2] = Math.sin(ang) * radius;
      }
      return a;
    }

    // Double sphere mesh representation
    function formCorporateSphere() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const radius = i % 2 === 0 ? 3.0 : 6.0;
        
        a[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        a[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
        a[i*3+2] = radius * Math.cos(phi);
      }
      return a;
    }

    function formStateShield() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const ring = i % 3;
        const ang = Math.random() * Math.PI * 2;
        let radius = 2.0;
        if (ring === 1) radius = 4.5;
        else if (ring === 2) radius = 7.0;
        
        const r = radius + (Math.random() - 0.5) * 0.25;
        a[i*3] = Math.cos(ang) * r;
        a[i*3+1] = (Math.random() - 0.5) * 0.2;
        a[i*3+2] = Math.sin(ang) * r;
      }
      return a;
    }

    function formCube() {
      const a = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const side = i % 6;
        const u = Math.random() * 8.0 - 4.0;
        const v = Math.random() * 8.0 - 4.0;
        const offset = i * 3;
        
        if (side === 0) {
          a[offset] = 4.0; a[offset+1] = u; a[offset+2] = v;
        } else if (side === 1) {
          a[offset] = -4.0; a[offset+1] = u; a[offset+2] = v;
        } else if (side === 2) {
          a[offset] = u; a[offset+1] = 4.0; a[offset+2] = v;
        } else if (side === 3) {
          a[offset] = u; a[offset+1] = -4.0; a[offset+2] = v;
        } else if (side === 4) {
          a[offset] = u; a[offset+1] = v; a[offset+2] = 4.0;
        } else {
          a[offset] = u; a[offset+1] = v; a[offset+2] = -4.0;
        }
      }
      return a;
    }

    // Dynamic forms & colors registry depending on page context
    const FORMS = pageContext === "ai" ? [
      formStars(),
      formStars(),
      formStars(),
      formStars(),
      formStars()
    ] : [
      formStars(),
      formCyberTunnel(),
      formCorporateSphere(),
      formStateShield(),
      formStars()
    ];

    const COLORS = pageContext === "ai" ? [
      new THREE.Color("#ffffff"), // Neutral (White Stars)
      new THREE.Color("#ffffff"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#ffffff")
    ] : [
      new THREE.Color("#ffffff"), // Neutral (White Stars)
      new THREE.Color("#ffb700"), // Neon Gold (Karakterler)
      new THREE.Color("#ff3c00"), // Neon Red (Corporations)
      new THREE.Color("#00e5ff"), // Neon Blue (SWOS)
      new THREE.Color("#ff007f")  // Neon Purple (AI Monitor)
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
        uForce: { value: pageContext === "ai" ? 0 : 1 },
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
      let targetPhase = 0;
      if (pageContext === "portal") {
        if (hoveredIndex === 0) targetPhase = 1;
        else if (hoveredIndex === 1) targetPhase = 2;
        else if (hoveredIndex === 2) targetPhase = 3;
        else if (hoveredIndex === 3) targetPhase = 4;
      }

      // Handle morphology transitions
      if (currentPhase !== targetPhase) {
        geometry.attributes.aFrom.array.set(FORMS[currentPhase]);
        geometry.attributes.aTo.array.set(FORMS[targetPhase]);
        geometry.attributes.aFrom.needsUpdate = true;
        geometry.attributes.aTo.needsUpdate = true;
        
        transitionMix = 0;
        currentPhase = targetPhase;
      }

      if (transitionMix < 1) {
        transitionMix += 0.012;
        if (transitionMix > 1) transitionMix = 1;
      }

      material.uniforms.uMix.value = transitionMix;

      activeColor.lerp(COLORS[targetPhase], 0.015);
      material.uniforms.uColor.value.copy(activeColor);

      if (pageContext !== "ai") {
        points.rotation.y += 0.001;
        camera.position.x += (camT.x - camera.position.x) * 0.04;
        camera.position.y += (camT.y - camera.position.y) * 0.04;
      }
      camera.lookAt(0, 0, 0);

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
  }, [hoveredIndex, pageContext]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none"
      }}
      aria-hidden="true"
    />
  );
}
