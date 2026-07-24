import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Real 3D hero visual: two interlocking open ribbon-rings in a
 * pearlescent clearcoat material, gold/cream rim lighting, a small
 * floating emissive sphere, and a faint grid floor with a soft AO
 * blob. The whole group auto-rotates; the sphere gently bobs.
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
    camera.position.set(0.4, 0.7, 4.4);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    holder.appendChild(renderer.domElement);

    // ---- lighting ----
    scene.add(new THREE.AmbientLight(0xfff3e2, 0.55));

    const key = new THREE.DirectionalLight(0xfff6e8, 0.9);
    key.position.set(2, 3, 2);
    scene.add(key);

    const rimGold = new THREE.PointLight(0xedaa3c, 3.2, 12);
    rimGold.position.set(2.4, 0.6, 1.2);
    scene.add(rimGold);

    const rimCream = new THREE.PointLight(0xfff3d6, 2.2, 12);
    rimCream.position.set(-2.2, 1.2, 1.6);
    scene.add(rimCream);

    const bounce = new THREE.PointLight(0xb87c1e, 1.2, 10);
    bounce.position.set(0, -1.6, 1);
    scene.add(bounce);

    // ---- group ----
    const group = new THREE.Group();
    scene.add(group);

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xfdf8ef,
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      reflectivity: 0.6,
    });

    const torus1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.16, 40, 120, Math.PI * 1.55),
      ribbonMat
    );
    torus1.rotation.set(0.5, 0.7, 0.3);
    group.add(torus1);

    const torus2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.12, 40, 120, Math.PI * 1.25),
      ribbonMat.clone()
    );
    torus2.rotation.set(-0.4, 1.6, 1.1);
    torus2.position.set(0.1, -0.05, 0.05);
    group.add(torus2);

    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xedaa3c,
      emissive: 0xb87c1e,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.65,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 48), sphereMat);
    sphere.position.set(0.75, 0.55, 0.5);
    group.add(sphere);
    const sphereBaseY = sphere.position.y;

    group.rotation.set(0.15, -0.3, 0);

    // ---- floor grid ----
    const grid = new THREE.GridHelper(7, 26, 0xd9971f, 0xe8d7be);
    grid.position.y = -1.35;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.22;
    scene.add(grid);

    // soft AO blob under the objects
    const aoCanvas = document.createElement("canvas");
    aoCanvas.width = 256;
    aoCanvas.height = 256;
    const actx = aoCanvas.getContext("2d")!;
    const grad = actx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "rgba(36,22,8,0.35)");
    grad.addColorStop(1, "rgba(36,22,8,0)");
    actx.fillStyle = grad;
    actx.fillRect(0, 0, 256, 256);
    const aoTex = new THREE.CanvasTexture(aoCanvas);
    const aoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false })
    );
    aoPlane.rotation.x = -Math.PI / 2;
    aoPlane.position.y = -1.34;
    scene.add(aoPlane);

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

    let t = 0;
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 1;
      group.rotation.y += 0.0028;
      sphere.position.y = sphereBaseY + Math.sin(t * 0.02) * 0.09;
      sphere.position.x = 0.75 + Math.cos(t * 0.015) * 0.04;
      renderer.render(scene, camera);
    }
    animate();

    // ---- cleanup on unmount ----
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      holder.removeChild(renderer.domElement);
      renderer.dispose();
      ribbonMat.dispose();
      sphereMat.dispose();
      torus1.geometry.dispose();
      torus2.geometry.dispose();
      sphere.geometry.dispose();
      aoTex.dispose();
    };
  }, []);

  return <div ref={holderRef} className="ih-3d-holder" aria-hidden="true" />;
}
