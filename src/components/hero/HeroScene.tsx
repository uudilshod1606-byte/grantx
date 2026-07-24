import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * "Floating Glass Intelligence Orb" hero visual.
 *
 * - A refractive glass sphere (real MeshPhysicalMaterial transmission)
 * - ~160 tiny gold light points drifting inside it in a true 3D volume
 * - 3 independent energy rings orbiting at different axes/speeds, each
 *   carrying a small glowing node
 * - Pointer-follow tilt: the whole group eases toward the cursor
 * - Soft gold rim lights + a faint grid floor with an AO blob, matching
 *   the previous scene's lighting language
 *
 * Requires: `npm install three` (or `bun add three`)
 * If you use TypeScript strictly, also: `npm install -D @types/three`
 */
export function HeroScene() {
  const holderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0.3, 0.5, 4.6);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    holder.appendChild(renderer.domElement);

    // ---- lighting ----
    scene.add(new THREE.AmbientLight(0xfff3e2, 0.5));

    const key = new THREE.DirectionalLight(0xfff6e8, 0.85);
    key.position.set(2, 3, 2);
    scene.add(key);

    const rimGold = new THREE.PointLight(0xedaa3c, 3.4, 12);
    rimGold.position.set(2.3, 0.6, 1.2);
    scene.add(rimGold);

    const rimCream = new THREE.PointLight(0xfff3d6, 2.4, 12);
    rimCream.position.set(-2.1, 1.2, 1.6);
    scene.add(rimCream);

    const bounce = new THREE.PointLight(0xb87c1e, 1.1, 10);
    bounce.position.set(0, -1.6, 1);
    scene.add(bounce);

    // ---- root group (tilt target) ----
    const group = new THREE.Group();
    scene.add(group);

    // ---- glass sphere ----
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffdf7,
      roughness: 0.05,
      metalness: 0,
      transmission: 1,
      thickness: 1.1,
      ior: 1.35,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.1,
      attenuationColor: new THREE.Color(0xf5cb7e),
      attenuationDistance: 1.4,
    });
    const glassSphere = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), glassMat);
    group.add(glassSphere);

    // subtle inner core glow so the glass has something to refract
    const coreLight = new THREE.PointLight(0xffe2a6, 1.4, 3.2);
    coreLight.position.set(0, 0, 0);
    group.add(coreLight);

    // ---- inner floating light particles ----
    const PARTICLE_COUNT = 160;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const thetas = new Float32Array(PARTICLE_COUNT);
    const phis = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 0.92 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      radii[i] = r;
      thetas[i] = theta;
      phis[i] = phi;
      speeds[i] = (Math.random() * 0.35 + 0.15) * (Math.random() < 0.5 ? 1 : -1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // soft round sprite generated on a canvas (no external asset needed)
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext("2d")!;
    const sgrad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sgrad.addColorStop(0, "rgba(255,250,235,1)");
    sgrad.addColorStop(0.35, "rgba(255,225,160,0.9)");
    sgrad.addColorStop(1, "rgba(255,200,120,0)");
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(spriteCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      map: spriteTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffe2a6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // ---- orbit rings ----
    const ringMat = (opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: 0xd9971f,
        transparent: true,
        opacity,
      });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.012, 16, 128), ringMat(0.55));
    ring1.rotation.set(Math.PI / 2.3, 0.2, 0);
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.01, 16, 128), ringMat(0.4));
    ring2.rotation.set(Math.PI / 2.6, 1.1, 0.6);
    group.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.008, 16, 128), ringMat(0.3));
    ring3.rotation.set(Math.PI / 3.1, -0.9, 1.2);
    group.add(ring3);

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xedaa3c,
      emissive: 0xb87c1e,
      emissiveIntensity: 0.7,
      roughness: 0.25,
      metalness: 0.6,
    });
    const node1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), nodeMat);
    const node2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 32, 32), nodeMat.clone());
    const node3 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 32, 32), nodeMat.clone());
    ring1.add(node1);
    ring2.add(node2);
    ring3.add(node3);
    node1.position.set(1.55, 0, 0);
    node2.position.set(1.38, 0, 0);
    node3.position.set(1.25, 0, 0);

    group.rotation.set(0.1, -0.25, 0);

    // ---- floor grid ----
    const grid = new THREE.GridHelper(7, 26, 0xd9971f, 0xe8d7be);
    grid.position.y = -1.5;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.18;
    scene.add(grid);

    // soft AO blob under the orb
    const aoCanvas = document.createElement("canvas");
    aoCanvas.width = 256;
    aoCanvas.height = 256;
    const actx = aoCanvas.getContext("2d")!;
    const aoGrad = actx.createRadialGradient(128, 128, 10, 128, 128, 128);
    aoGrad.addColorStop(0, "rgba(36,22,8,0.32)");
    aoGrad.addColorStop(1, "rgba(36,22,8,0)");
    actx.fillStyle = aoGrad;
    actx.fillRect(0, 0, 256, 256);
    const aoTex = new THREE.CanvasTexture(aoCanvas);
    const aoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
    );
    aoPlane.rotation.x = -Math.PI / 2;
    aoPlane.position.y = -1.49;
    scene.add(aoPlane);

    // ---- resize handling ----
    function resize() {
      if (!holder) return;
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(holder);

    // ---- pointer-follow tilt ----
    let targetTiltX = 0.1;
    let targetTiltY = -0.25;
    let curTiltX = 0.1;
    let curTiltY = -0.25;

    function onPointerMove(e: PointerEvent) {
      if (!holder) return;
      const rect = holder.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltX = 0.1 + py * -0.35;
      targetTiltY = -0.25 + px * 0.55;
    }
    function onPointerLeave() {
      targetTiltX = 0.1;
      targetTiltY = -0.25;
    }
    holder.addEventListener("pointermove", onPointerMove);
    holder.addEventListener("pointerleave", onPointerLeave);

    // ---- animation loop ----
    let t = 0;
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 1;

      // gentle bob of the whole orb
      group.position.y = Math.sin(t * 0.012) * 0.08;

      // pointer-follow easing
      curTiltX += (targetTiltX - curTiltX) * 0.05;
      curTiltY += (targetTiltY - curTiltY) * 0.05;
      group.rotation.x = curTiltX;
      group.rotation.y = curTiltY;

      // slow independent particle drift inside the glass
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        thetas[i] += speeds[i] * 0.006;
        const r = radii[i];
        posAttr.setXYZ(
          i,
          r * Math.sin(phis[i]) * Math.cos(thetas[i]),
          r * Math.cos(phis[i]),
          r * Math.sin(phis[i]) * Math.sin(thetas[i])
        );
      }
      posAttr.needsUpdate = true;

      // rings spin independently, each on its own axis/speed
      ring1.rotation.z += 0.006;
      ring2.rotation.z -= 0.0045;
      ring3.rotation.z += 0.0032;

      // core light + glass subtly pulse
      coreLight.intensity = 1.2 + Math.sin(t * 0.03) * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    // ---- cleanup on unmount ----
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      holder.removeEventListener("pointermove", onPointerMove);
      holder.removeEventListener("pointerleave", onPointerLeave);
      ro.disconnect();
      holder.removeChild(renderer.domElement);
      renderer.dispose();
      glassMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      spriteTex.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ring3.geometry.dispose();
      node1.geometry.dispose();
      node2.geometry.dispose();
      node3.geometry.dispose();
      nodeMat.dispose();
      aoTex.dispose();
    };
  }, []);

  return <div ref={holderRef} className="ih-3d-holder" aria-hidden="true" />;
}

