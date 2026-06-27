"use client";

import { useEffect } from "react";
import styles from "./token-sale-scene.module.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    THREE?: any;
    __tokenSaleAnimationsLoaded?: boolean;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function splitChars(el: HTMLElement) {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) { // Text node
        const frag = document.createDocumentFragment();
        child.textContent?.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) {
            frag.append("\u00A0");
            return;
          }
          const w = document.createElement("span");
          w.className = "w";
          w.style.display = "inline-block";
          w.style.overflow = "hidden";
          w.style.verticalAlign = "bottom";
          [...tok].forEach((c) => {
            const s = document.createElement("span");
            s.className = "ch";
            s.style.display = "inline-block";
            s.style.willChange = "transform";
            s.textContent = c;
            w.append(s);
          });
          frag.append(w);
        });
        node.replaceChild(frag, child);
      } else {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll(".ch");
}

function formCoin(count: number) {
  const a = new Float32Array(count * 3);
  const R = 5.2;
  const TH = 0.55;
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const ang = Math.random() * Math.PI * 2;
    if (u < 0.8) { // Faces (front/back)
      const side = u < 0.4 ? TH : -TH;
      let rr;
      const band = Math.random();
      if (band < 0.35) {
        rr = R * (0.85 + Math.random() * 0.15); // outer rim
      } else if (band < 0.55) {
        rr = R * (0.42 + Math.random() * 0.08); // inner detail
      } else {
        rr = Math.sqrt(Math.random()) * R * 0.8; // fill
      }
      a[i * 3] = Math.cos(ang) * rr;
      a[i * 3 + 1] = Math.sin(ang) * rr;
      a[i * 3 + 2] = side + (Math.random() - 0.5) * 0.05;
    } else { // Outer edge rim
      a[i * 3] = Math.cos(ang) * R;
      a[i * 3 + 1] = Math.sin(ang) * R;
      a[i * 3 + 2] = (Math.random() - 0.5) * 2 * TH;
    }
  }
  return a;
}

function formHelix(count: number) {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.15) { // background field
      const r = 6.0 * Math.sqrt(Math.random());
      const th = Math.random() * Math.PI * 2;
      a[i * 3] = Math.cos(th) * r;
      a[i * 3 + 1] = (Math.random() - 0.5) * 16;
      a[i * 3 + 2] = Math.sin(th) * r;
      continue;
    }
    const t = Math.random() * 16 - 8;
    const strand = i % 2;
    const ang = t * 0.78 + strand * Math.PI;
    const r = 2.8 + (Math.random() - 0.5) * 0.4;
    a[i * 3] = Math.cos(ang) * r;
    a[i * 3 + 1] = t;
    a[i * 3 + 2] = Math.sin(ang) * r;
  }
  return a;
}

export function TokenSaleAnimations() {
  useEffect(() => {
    if (window.__tokenSaleAnimationsLoaded) {
      return;
    }
    window.__tokenSaleAnimationsLoaded = true;

    void (async () => {
      try {
        await new Promise<void>((resolve) => {
          const start = () => window.setTimeout(resolve, 350);
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(start, { timeout: 1500 });
            return;
          }
          start();
        });

        // Load dependencies from CDN
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.145.0/build/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js");

        const { THREE, gsap, ScrollTrigger } = window;
        if (!THREE || !gsap || !ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        // Scramble decryption chars
        const decryptChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}[]|";
        function decryptText(el: HTMLElement, targetText: string, duration = 0.8) {
          if (!el) return;
          const currentText = el.textContent || "";
          if (currentText === targetText) return;
          
          gsap.killTweensOf(el);
          const obj = { progress: 0 };
          gsap.to(obj, {
            progress: 1,
            duration: duration,
            ease: "power1.inOut",
            onUpdate: () => {
              let result = "";
              const len = targetText.length;
              for (let i = 0; i < len; i++) {
                if (targetText[i] === " ") {
                  result += " ";
                } else if (i < obj.progress * len) {
                  result += targetText[i];
                } else {
                  result += decryptChars[Math.floor(Math.random() * decryptChars.length)];
                }
              }
              el.textContent = result;
            }
          });
        }

        // Shared WebGL wallet variables to bridge click handler and render loop
        let isWalletConnected = false;
        const walletWorldPos = new THREE.Vector3();
        const lineProgress = { value: 0 };
        let lineMat: any = null;
        let nodeMat: any = null;
        let connectionLine: any = null;
        let connectionNode: any = null;
        let pointsRef: any = null;
        let cameraRef: any = null;

        // ================= IMPULSIVE CUSTOM CURSOR =================
        const dot = document.getElementById("ts-cursor-dot");
        const ring = document.getElementById("ts-cursor-ring");
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        window.addEventListener("pointermove", (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (dot) {
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
          }
        });

        function animateCursor() {
          ringX += (mouseX - ringX) * 0.14;
          ringY += (mouseY - ringY) * 0.14;
          if (ring) {
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
          }
          requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        // Immersive Hover Bindings
        function setupCursorHovers() {
          const hovers = document.querySelectorAll('a, button, [data-hover], input[type="checkbox"], input[type="range"]');
          hovers.forEach((el) => {
            el.addEventListener("pointerenter", () => {
              ring?.classList.add(styles.cursorRingHovered);
            });
            el.addEventListener("pointerleave", () => {
              ring?.classList.remove(styles.cursorRingHovered);
            });
          });
        }
        setupCursorHovers();

        // ================= SYSTEM TELEMETRY LOGGER =================
        const terminal = document.getElementById("ts-terminal");
        const terminalBody = document.getElementById("ts-terminal-body");

        function addLog(msg: string) {
          if (!terminalBody) return;
          const line = document.createElement("div");
          line.className = styles.terminalLine;
          const timestamp = new Date().toLocaleTimeString();
          line.textContent = `[${timestamp}] ${msg}`;
          terminalBody.appendChild(line);
          terminalBody.scrollTop = terminalBody.scrollHeight;
          while (terminalBody.childNodes.length > 8) {
            terminalBody.removeChild(terminalBody.firstChild!);
          }
        }

        function updateCardCalculations(slider: HTMLInputElement) {
          const val = parseInt(slider.value, 10);
          const unitPrice = parseInt(slider.dataset.unitPrice || "0", 10);
          const unitTokens = parseInt(slider.dataset.unitTokens || "0", 10);
          const bonusBps = parseInt(slider.dataset.bonusBps || "0", 10);
          const currency = slider.dataset.currency || "TRY";
          const symbol = slider.dataset.symbol || "IOH";

          // Calculate total price
          const totalPriceMinor = val * unitPrice;
          const formattedPrice = (totalPriceMinor / 100).toLocaleString("tr-TR", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
          });

          // Calculate total tokens plus bonus
          const baseTokens = val * unitTokens;
          const bonusTokens = (baseTokens * bonusBps) / 10000;
          const totalTokens = baseTokens + bonusTokens;
          const formattedTokens = totalTokens.toLocaleString("tr-TR");

          // Update elements inside the card form
          const card = slider.closest("form");
          if (card) {
            const qtyVal = card.querySelector(".ts-qty-val");
            if (qtyVal) qtyVal.textContent = String(val);

            const priceVal = card.querySelector(".ts-total-price");
            if (priceVal) priceVal.textContent = formattedPrice;

            const tokensVal = card.querySelector(".ts-total-tokens");
            if (tokensVal) tokensVal.textContent = `${formattedTokens} ${symbol}`;

            // Pulse text animations using GSAP
            gsap.fromTo([priceVal, tokensVal],
              { scale: 0.96, filter: "brightness(1.4)" },
              { scale: 1, filter: "brightness(1)", duration: 0.2, ease: "power1.out" }
            );
          }
        }

        function setupTelemetryBindings() {
          const forms = document.querySelectorAll('form[class*="packageCard"]');
          forms.forEach((form) => {
            const title = form.querySelector('h3[class*="packageTitle"]')?.textContent || "Unknown";
            const rangeInput = form.querySelector('input[type="range"]') as HTMLInputElement | null;
            const manualInput = form.querySelector('input[type="number"]') as HTMLInputElement | null;
            const checkbox = form.querySelector('input[type="checkbox"]');
            const submitBtn = form.querySelector('button[type="submit"]');

            // Initialize values using manualInput (the source of truth)
            if (manualInput) {
              updateCardCalculations(manualInput);
            }

            const syncInputs = (sourceVal: number, updateManual = true, updateRange = true) => {
              const maxLimit = parseInt(manualInput?.max || "30", 10);
              const minLimit = parseInt(manualInput?.min || "1", 10);

              let clampedVal = sourceVal;
              if (isNaN(clampedVal) || clampedVal < minLimit) {
                clampedVal = minLimit;
              } else if (clampedVal > maxLimit) {
                clampedVal = maxLimit;
              }

              if (updateRange && rangeInput && parseInt(rangeInput.value, 10) !== clampedVal) {
                rangeInput.value = String(clampedVal);
              }
              if (updateManual && manualInput && parseInt(manualInput.value, 10) !== clampedVal) {
                manualInput.value = String(clampedVal);
              }

              // Update card values
              if (manualInput) {
                updateCardCalculations(manualInput);
              }

              // Update Holographic Card
              const holoCard = document.getElementById("ts-holo-card");
              if (holoCard && manualInput) {
                const qtyVal = holoCard.querySelector(".ts-holo-qty") as HTMLElement;
                const totalVal = holoCard.querySelector(".ts-holo-total") as HTMLElement;
                const tokensVal = holoCard.querySelector(".ts-holo-tokens") as HTMLElement;

                const unitPriceMinor = parseInt(manualInput.dataset.unitPrice || "0", 10);
                const unitTokensVal = parseInt(manualInput.dataset.unitTokens || "0", 10);
                const bonusBps = parseInt(manualInput.dataset.bonusBps || "0", 10);
                const currency = manualInput.dataset.currency || "TRY";
                const symbol = manualInput.dataset.symbol || "IOH";

                const formattedTotal = ((clampedVal * unitPriceMinor) / 100).toLocaleString("tr-TR", { style: "currency", currency });
                const baseTokens = clampedVal * unitTokensVal;
                const bonusTokens = (baseTokens * bonusBps) / 10000;
                const totalTokens = baseTokens + bonusTokens;
                const formattedTokens = `${totalTokens.toLocaleString("tr-TR")} ${symbol}`;

                if (qtyVal) decryptText(qtyVal, String(clampedVal), 0.4);
                if (totalVal) decryptText(totalVal, formattedTotal, 0.5);
                if (tokensVal) decryptText(tokensVal, formattedTokens, 0.5);
              }

              // Update WebGL particles based on the value
              const mat = (window as any).__tsShaderMaterial;
              if (mat) {
                mat.uniforms.uSize.value = 1.5 + (clampedVal * 0.05);
              }
              (window as any).__tsSpeedMultiplier = 1.0 + (clampedVal * 0.12);
            };

            // Package Hover
            form.addEventListener("pointerenter", () => {
              addLog(`[QUERY] Inspecting package: ${title}`);

              // Fade in Holographic Preview
              const holoCard = document.getElementById("ts-holo-card");
              if (holoCard) {
                gsap.to(holoCard, { opacity: 1, x: 0, pointerEvents: "auto", duration: 0.4 });
                
                // Animate floating path loop for high-tech feeling
                gsap.killTweensOf(holoCard, "y");
                gsap.fromTo(holoCard, { y: 0 }, { y: -8, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
              }

              // Update fields
              const pkgVal = holoCard?.querySelector(".ts-holo-pkg") as HTMLElement;
              const qtyVal = holoCard?.querySelector(".ts-holo-qty") as HTMLElement;
              const unitVal = holoCard?.querySelector(".ts-holo-unit") as HTMLElement;
              const totalVal = holoCard?.querySelector(".ts-holo-total") as HTMLElement;
              const tokensVal = holoCard?.querySelector(".ts-holo-tokens") as HTMLElement;
              const bonusVal = holoCard?.querySelector(".ts-holo-bonus") as HTMLElement;
              const statusVal = document.getElementById("ts-holo-status") as HTMLElement;

              if (pkgVal) decryptText(pkgVal, title.toUpperCase());
              if (manualInput) {
                const val = parseInt(manualInput.value, 10);
                const unitPriceMinor = parseInt(manualInput.dataset.unitPrice || "0", 10);
                const unitTokensVal = parseInt(manualInput.dataset.unitTokens || "0", 10);
                const bonusBps = parseInt(manualInput.dataset.bonusBps || "0", 10);
                const currency = manualInput.dataset.currency || "TRY";
                const symbol = manualInput.dataset.symbol || "IOH";

                const formattedUnit = (unitPriceMinor / 100).toLocaleString("tr-TR", { style: "currency", currency });
                const formattedTotal = ((val * unitPriceMinor) / 100).toLocaleString("tr-TR", { style: "currency", currency });
                const baseTokens = val * unitTokensVal;
                const bonusTokens = (baseTokens * bonusBps) / 10000;
                const totalTokens = baseTokens + bonusTokens;
                const formattedTokens = `${totalTokens.toLocaleString("tr-TR")} ${symbol}`;
                const formattedBonus = `%${bonusBps / 100}`;

                if (qtyVal) decryptText(qtyVal, String(val));
                if (unitVal) decryptText(unitVal, formattedUnit);
                if (totalVal) decryptText(totalVal, formattedTotal);
                if (tokensVal) decryptText(tokensVal, formattedTokens);
                if (bonusVal) decryptText(bonusVal, formattedBonus);
              }
              if (statusVal) decryptText(statusVal, isWalletConnected ? "SECURE ACCOUNT // WALLET DETECTED" : "SECURE SYSTEM // AWAITING CONNECT");
            });

            // Range / Slider Input
            rangeInput?.addEventListener("input", (e) => {
              const slider = e.target as HTMLInputElement;
              const val = parseInt(slider.value, 10);
              syncInputs(val, true, false); // Update manual input, don't update range slider to avoid feedback loop
              addLog(`[SYS] Range adjusted: ${val} units. WebGL flux accelerated.`);
            });

            // Manual Number Input
            manualInput?.addEventListener("input", (e) => {
              const input = e.target as HTMLInputElement;
              const val = parseInt(input.value, 10);
              
              if (!isNaN(val)) {
                const maxLimit = parseInt(manualInput?.max || "30", 10);
                if (val > maxLimit) {
                  syncInputs(maxLimit, true, true);
                  addLog(`[SYS] Quantity manual input clamped to max: ${maxLimit}`);
                } else if (val >= 1) {
                  syncInputs(val, false, true); // Update range slider, don't update manual input text
                  addLog(`[SYS] Quantity manual entry: ${val} units.`);
                }
              }
            });

            // Handle Blur to clean up empty/invalid values
            manualInput?.addEventListener("blur", (e) => {
              const input = e.target as HTMLInputElement;
              const val = parseInt(input.value, 10);
              // Clamp value fully on focus out
              syncInputs(isNaN(val) ? 1 : val, true, true);
            });

            // Checkbox Change
            checkbox?.addEventListener("change", (e) => {
              const checked = (e.target as HTMLInputElement).checked;
              addLog(checked 
                ? "[SECURE] Signature generated. Authorized." 
                : "[WARNING] Signature revoked. Unauthorized."
              );
            });

            // Submit Button Hover
            submitBtn?.addEventListener("pointerenter", () => {
              addLog("[GATEWAY] Handshake initialized. Awaiting user click.");
            });
          });
        }
        setupTelemetryBindings();



        // ================= WebGL THREE.JS COIN EVRENİ =================
        const canvas = document.getElementById("ts-webgl") as HTMLCanvasElement;
        if (canvas) {
          const count = window.innerWidth < 768 ? 2200 : 5200;
          const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          renderer.setSize(window.innerWidth, window.innerHeight);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
          camera.position.set(0, 0, 16);

          const coinGeoData = formCoin(count);
          const helixGeoData = formHelix(count);

          const seeds = new Float32Array(count);
          for (let i = 0; i < count; i++) {
            seeds[i] = Math.random();
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(coinGeoData.slice(), 3));
          geo.setAttribute("aFrom", new THREE.BufferAttribute(coinGeoData, 3));
          geo.setAttribute("aTo", new THREE.BufferAttribute(helixGeoData, 3));
          geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

          const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uMix: { value: 0 },
              uSize: { value: 1.5 },
              uPx: { value: Math.min(window.devicePixelRatio, 2) },
              uColor: { value: new THREE.Color("#00d2ff") },
              uRippleCenter: { value: new THREE.Vector3(0, 0, 0) },
              uRippleRadius: { value: 0.0 },
              uRippleStrength: { value: 0.0 },
            },
            vertexShader: `
              attribute vec3 aFrom;
              attribute vec3 aTo;
              attribute float aSeed;
              uniform float uTime;
              uniform float uMix;
              uniform float uSize;
              uniform float uPx;
              uniform vec3 uRippleCenter;
              uniform float uRippleRadius;
              uniform float uRippleStrength;
              varying float vTw;
              varying float vWave;
              void main() {
                vec3 pos = mix(aFrom, aTo, uMix);
                pos.x += sin(uTime * 0.45 + aSeed * 43.0) * 0.12;
                pos.y += cos(uTime * 0.38 + aSeed * 77.0) * 0.12;
                pos.z += sin(uTime * 0.32 + aSeed * 91.0) * 0.12;
                
                vec3 rippleDir = pos - uRippleCenter;
                float dist = length(rippleDir);
                float wave = smoothstep(1.8, 0.0, abs(dist - uRippleRadius));
                pos += normalize(rippleDir + 0.001) * wave * uRippleStrength * 0.4;
                
                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = uSize * uPx * (0.45 + aSeed) * (20.0 / -mv.z) * (1.0 + wave * 0.6);
                vTw = 0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 100.0);
                vWave = wave;
              }
            `,
            fragmentShader: `
              uniform vec3 uColor;
              varying float vTw;
              varying float vWave;
              void main() {
                float d = length(gl_PointCoord - 0.5);
                float a = smoothstep(0.5, 0.05, d);
                vec3 finalColor = mix(uColor, vec3(1.0), vWave * 0.3);
                gl_FragColor = vec4(finalColor, a * (0.35 + 0.65 * vTw) * (1.0 + vWave * 0.8));
              }
            `
          });

          const points = new THREE.Points(geo, mat);
          scene.add(points);
          (window as any).__tsShaderMaterial = mat;

          // Store WebGL references
          pointsRef = points;
          cameraRef = camera;

          // Setup Wallet connection meshes
          lineMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#00d2ff"),
            transparent: true,
            opacity: 0
          });
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
          ]);
          connectionLine = new THREE.Line(lineGeo, lineMat);
          scene.add(connectionLine);

          const nodeGeo = new THREE.SphereGeometry(0.18, 24, 24);
          nodeMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#00d2ff"),
            transparent: true,
            opacity: 0
          });
          connectionNode = new THREE.Mesh(nodeGeo, nodeMat);
          scene.add(connectionNode);

          const mouseNDC = { x: 0, y: 0 };
          window.addEventListener("pointermove", (e) => {
            mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
          });

          // Interactive Particle Shockwaves & Telemetry
          let isDragging = false;
          let lastRippleTime = 0;

          const triggerShockwave = (clientX: number, clientY: number) => {
            const ndcX = (clientX / window.innerWidth) * 2 - 1;
            const ndcY = -(clientY / window.innerHeight) * 2 + 1;

            const ndcVec = new THREE.Vector3(ndcX, ndcY, 0.5);
            ndcVec.unproject(camera);
            const dir = ndcVec.sub(camera.position).normalize();
            const dist = -camera.position.z / dir.z;
            const mouseWorld = camera.position.clone().addScaledVector(dir, dist);

            mat.uniforms.uRippleCenter.value.copy(points.worldToLocal(mouseWorld));

            gsap.killTweensOf(mat.uniforms.uRippleRadius);
            gsap.killTweensOf(mat.uniforms.uRippleStrength);

            mat.uniforms.uRippleRadius.value = 0.0;
            mat.uniforms.uRippleStrength.value = 1.0;

            gsap.to(mat.uniforms.uRippleRadius, {
              value: 12.0,
              duration: 2.8,
              ease: "sine.out",
            });

            gsap.to(mat.uniforms.uRippleStrength, {
              value: 0.0,
              duration: 2.8,
              ease: "sine.out",
            });

            addLog("[ENERGY] Quantum shockwave wave-front expanding.");
          };

          const handlePointerDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target && (
              target.closest("button") || 
              target.closest("a") || 
              target.closest("input") || 
              target.closest("label") ||
              target.closest("textarea")
            )) {
              return;
            }
            isDragging = true;
            lastRippleTime = Date.now();
            triggerShockwave(e.clientX, e.clientY);
          };

          const handlePointerMove = (e: PointerEvent) => {
            if (isDragging) {
              const now = Date.now();
              if (now - lastRippleTime > 500) {
                lastRippleTime = now;
                triggerShockwave(e.clientX, e.clientY);
              }
            }
          };

          const handlePointerUp = () => {
            isDragging = false;
          };

          window.addEventListener("pointerdown", handlePointerDown);
          window.addEventListener("pointermove", handlePointerMove);
          window.addEventListener("pointerup", handlePointerUp);

          const clock = new THREE.Clock();
          gsap.ticker.add(() => {
            const t = clock.getElapsedTime();
            mat.uniforms.uTime.value = t;

            // Gentle rotation (with speed multiplier from slider)
            const speedMult = (window as any).__tsSpeedMultiplier || 1.0;
            points.rotation.y += 0.007 * speedMult;
            points.rotation.z += 0.002 * speedMult;

            // Parallax movement based on mouse
            points.position.x += (mouseNDC.x * 2.2 - points.position.x) * 0.04;
            points.position.y += (mouseNDC.y * 1.6 - points.position.y) * 0.04;

            // Recalculate wallet input unprojected positions on scroll/render loop to keep line attached
            if ((isWalletConnected || lineProgress.value > 0) && connectionLine && cameraRef && pointsRef) {
              const inputEl = document.getElementById("ts-wallet-input");
              if (inputEl) {
                const rect = inputEl.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                const ndcVec = new THREE.Vector3(
                  (x / window.innerWidth) * 2 - 1,
                  -(y / window.innerHeight) * 2 + 1,
                  0.5
                );
                ndcVec.unproject(cameraRef);
                const dir = ndcVec.sub(cameraRef.position).normalize();
                const dist = -cameraRef.position.z / dir.z;
                walletWorldPos.copy(cameraRef.position.clone().addScaledVector(dir, dist));

                const localEnd = pointsRef.worldToLocal(walletWorldPos.clone());
                const currentEnd = new THREE.Vector3().lerpVectors(
                  new THREE.Vector3(0, 0, 0),
                  localEnd,
                  lineProgress.value
                );

                const posAttr = connectionLine.geometry.attributes.position;
                const positions = posAttr.array as Float32Array;
                positions[3] = currentEnd.x;
                positions[4] = currentEnd.y;
                positions[5] = currentEnd.z;
                posAttr.needsUpdate = true;

                if (connectionNode) {
                  connectionNode.position.copy(currentEnd);
                }
              }
            }

            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
          });

          window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            mat.uniforms.uPx.value = Math.min(window.devicePixelRatio, 2);
          });

          // Morphing ScrollTrigger
          gsap.to(mat.uniforms.uMix, {
            value: 1.0,
            scrollTrigger: {
              trigger: "#ts-usage-header",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            }
          });
        }

        // ================= METİN SPLIT & REVEALS =================
        const titleEl = document.getElementById("ts-hero-title");
        if (titleEl) {
          splitChars(titleEl);
        }

        const heroChars = document.querySelectorAll("#ts-hero-title .ch");
        const heroKicker = document.getElementById("ts-hero-kicker");
        const heroLead = document.getElementById("ts-hero-lead");
        const heroActions = document.getElementById("ts-hero-actions");
        const heroCoin = document.getElementById("ts-hero-coin");
        const heroCoordinates = document.getElementById("ts-hero-coordinates");

        // Set initial states
        gsap.set(heroChars, { yPercent: 115 });
        gsap.set([heroKicker, heroLead, heroActions, heroCoordinates], { opacity: 0, y: 24 });
        gsap.set(heroCoin, { scale: 0.8, opacity: 0 });
        gsap.set(terminal, { opacity: 0, x: -30 });

        // Hero Entrance Timeline
        const tl = gsap.timeline();
        tl.to(heroCoin, { scale: 1, opacity: 1, duration: 1.4, ease: "power3.out" }, 0.2)
          .to(heroChars, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.035 }, 0.4)
          .to(heroKicker, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.7)
          .to(heroLead, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.85)
          .to(heroActions, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 1.0)
          .to(heroCoordinates, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 1.15)
          .to(terminal, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              addLog("[SYS] System initialized in SECTOR 02.");
              addLog("[SYS] Terminal diagnostics online.");
            }
          }, 1.3);

        // Scroll reveals
        const manifesto = document.getElementById("ts-manifesto");
        if (manifesto) {
          gsap.from(manifesto, {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: manifesto,
              start: "top 85%",
            },
          });
        }

        const usageHeader = document.getElementById("ts-usage-header");
        if (usageHeader) {
          gsap.from(usageHeader, {
            opacity: 0,
            y: 30,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: usageHeader,
              start: "top 85%",
            },
          });
        }

        const usageGrid = document.getElementById("ts-usage-grid");
        if (usageGrid) {
          const cards = usageGrid.querySelectorAll("article");
          gsap.from(cards, {
            opacity: 0,
            y: 50,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: usageGrid,
              start: "top 80%",
            },
          });
        }

        const campaignsHeader = document.getElementById("ts-campaigns-header");
        if (campaignsHeader) {
          gsap.from(campaignsHeader, {
            opacity: 0,
            y: 30,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: campaignsHeader,
              start: "top 85%",
            },
          });
        }

        const packageGrids = document.querySelectorAll('div[class*="packageGrid"]');
        packageGrids.forEach((grid) => {
          const cards = grid.querySelectorAll("form");
          gsap.from(cards, {
            opacity: 0,
            y: 50,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: grid,
              start: "top 80%",
            },
          });
        });

        const trustList = document.getElementById("ts-trust-list");
        if (trustList) {
          const items = trustList.querySelectorAll("li");
          gsap.from(items, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: trustList,
              start: "top 85%",
            },
          });
        }

        // ================= SMOOTH SCROLL BINDING =================
        const exploreBtn = document.querySelector('#ts-hero-actions a[href="#campaigns"]');
        if (exploreBtn) {
          exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('campaigns');
            if (target) {
              const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 90;
              window.scrollTo({
                top: topOffset,
                behavior: 'smooth'
              });
            }
          });
        }

        // ================= WALLET CONNECT PANEL BINDING =================
        function setupWalletConnect() {
          const connectBtn = document.getElementById("ts-wallet-connect-btn");
          const walletInput = document.getElementById("ts-wallet-input") as HTMLInputElement | null;
          const statusText = document.getElementById("ts-wallet-status-text");
          const holoStatus = document.getElementById("ts-holo-status");

          connectBtn?.addEventListener("click", () => {
            if (!walletInput) return;
            const addr = walletInput.value.trim();
            if (addr.length < 16) {
              addLog("[ERROR] Invalid wallet address. Format unrecognized.");
              gsap.fromTo(walletInput, { x: -10 }, { x: 0, duration: 0.4, ease: "rough" });
              return;
            }

            addLog("[SYS] Wallet handshake requested. Contacting ledger...");
            connectBtn.textContent = "Bağlanıyor...";
            connectBtn.style.pointerEvents = "none";

            setTimeout(() => {
              isWalletConnected = true;
              
              if (lineMat && nodeMat) {
                gsap.to(lineMat, { opacity: 0.8, duration: 0.5 });
                gsap.to(nodeMat, { opacity: 0.8, duration: 0.5 });
              }

              lineProgress.value = 0;
              gsap.to(lineProgress, {
                value: 1.0,
                duration: 2.0,
                ease: "power2.out",
                onComplete: () => {
                  addLog("[SECURE] Wallet linked successfully. Node active.");
                  if (statusText) decryptText(statusText, "BAGLANDI");
                  if (holoStatus) decryptText(holoStatus, "SECURE ACCOUNT // WALLET DETECTED");
                  
                  connectBtn.textContent = "BAĞLANDI";
                  connectBtn.classList.add(styles.walletConnectBtnConnected);

                  if (connectionNode) {
                    gsap.killTweensOf(connectionNode.scale);
                    connectionNode.scale.set(1, 1, 1);
                    gsap.to(connectionNode.scale, {
                      x: 1.6, y: 1.6, z: 1.6,
                      duration: 0.8,
                      repeat: -1,
                      yoyo: true,
                      ease: "sine.inOut"
                    });
                  }
                }
              });

              addLog("[ENERGY] Establishing orbital data line from particle grid...");
            }, 1200);
          });
        }
        setupWalletConnect();

      } catch (err) {
        console.warn("WebGL or animation init failed:", err);
      }
    })();
  }, []);

  return null;
}
