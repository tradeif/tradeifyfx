"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
  GoldenChargingBull – True 3D photorealistic gold bull using Three.js
  ─────────────────────────────────────────────────────────────────────
  • Rebuilt to match the muscularity, power, and charging pose of the reference image.
  • Features tapered curved horns constructed out of a chain of spheres.
  • Muscular body constructed from detailed overlapping muscle segments (deltoids, traps, haunches).
  • Gold PBR material: MeshPhysicalMaterial with metalness=1, roughness=0.09, and clearcoat=1
    giving a highly polished, reflective sculptured-gold look.
  • Environment: Coloured key lights + RoomEnvironment for realistic metal reflections.
  • Animation: Galloping leg gait + charging lunge + golden financial growth particles/sparks rushing past.
*/

export default function GoldenChargingBull() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Renderer ── */
    const W = mount.clientWidth || 500;
    const H = mount.clientHeight || 450;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0.2, 0.8, 7.2);
    camera.lookAt(0.2, -0.1, 0);

    /* ── Polished Gold PBR Material ── */
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfb43a,       // Rich shiny gold
      metalness: 1.0,
      roughness: 0.08,       // Highly polished reflection
      clearcoat: 1.0,        // Polyurethane clear protective layer
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 2.5,
    });

    // Slightly darker brushed gold for hooves
    const goldDark = new THREE.MeshStandardMaterial({
      color: 0x8b6010,
      metalness: 1.0,
      roughness: 0.28,
    });

    /* ── Environment map ── */
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    /* ── Lights ── */
    // Key light – warm upper-left (main illumination)
    const keyLight = new THREE.PointLight(0xfff5d6, 300, 20);
    keyLight.position.set(-3, 6, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light – cool right side
    const fillLight = new THREE.PointLight(0xc0d8ff, 120, 18);
    fillLight.position.set(4, 2, 4);
    scene.add(fillLight);

    // Rim light – back-top edge
    const rimLight = new THREE.PointLight(0xffd97a, 150, 15);
    rimLight.position.set(-2, 5, -4);
    scene.add(rimLight);

    // Ambient Light
    const ambient = new THREE.AmbientLight(0x664422, 0.6);
    scene.add(ambient);

    /* ── Ground shadow plane ── */
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.20 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.82;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    /* ════════════════════════════════════════════════
       BUILD THE HIGHLY DETAILED MUSCULAR BULL
    ════════════════════════════════════════════════ */
    const bull = new THREE.Group();
    scene.add(bull);

    const addPart = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number, y: number, z: number,
      rx = 0, ry = 0, rz = 0,
      sx = 1, sy = 1, sz = 1
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      bull.add(mesh);
      return mesh;
    };

    /* ── 1. TORSO & SPINE ── */
    // Core abdominal barrel
    addPart(new THREE.SphereGeometry(1.0, 48, 36), goldMat,
      0, 0, 0, 0, 0, 0, 1.6, 1.08, 1.08);

    // Brisket / Pectorals bulge
    addPart(new THREE.SphereGeometry(0.85, 32, 24), goldMat,
      0.65, -0.2, 0, 0, 0, 0, 1.25, 1.08, 1.15);

    // Muscular Rump
    addPart(new THREE.SphereGeometry(0.88, 32, 24), goldMat,
      -0.78, 0.05, 0, 0, 0, 0, 1.05, 1.05, 1.02);

    // Spine Ridge Muscle
    addPart(new THREE.SphereGeometry(0.24, 24, 18), goldMat,
      -0.1, 0.45, 0, 0, 0, 0, 1.8, 0.4, 0.6);

    // Flank line muscle Left
    addPart(new THREE.SphereGeometry(0.18, 24, 18), goldMat,
      -0.25, 0.08, 0.45, 0, 0, 0, 1.4, 0.6, 0.6);

    // Flank line muscle Right
    addPart(new THREE.SphereGeometry(0.18, 24, 18), goldMat,
      -0.25, 0.08, -0.45, 0, 0, 0, 1.4, 0.6, 0.6);

    /* ── 2. HUGE NECK & DELTOIDS ── */
    // Neck base
    addPart(new THREE.CylinderGeometry(0.55, 0.72, 1.1, 32), goldMat,
      0.9, 0.25, 0, 0, 0, -Math.PI * 0.22);

    // Neck hump crest (massiveness)
    addPart(new THREE.SphereGeometry(0.75, 32, 24), goldMat,
      0.5, 0.45, 0, 0, 0, 0, 1.2, 1.0, 0.9);

    addPart(new THREE.SphereGeometry(0.6, 32, 24), goldMat,
      0.8, 0.6, 0, 0, 0, 0, 1.1, 0.9, 0.8);

    // Neck folds (dewlap)
    addPart(new THREE.SphereGeometry(0.48, 32, 24), goldMat,
      1.05, 0.35, 0, 0, 0, 0, 1.0, 0.85, 0.9);

    addPart(new THREE.SphereGeometry(0.5, 32, 24), goldMat,
      1.05, -0.25, 0, 0, 0, -Math.PI * 0.12, 1.1, 1.2, 0.7);

    addPart(new THREE.SphereGeometry(0.4, 32, 24), goldMat,
      0.8, -0.45, 0, 0, 0, 0, 1.0, 1.0, 0.65);

    // Deltoid muscle bulge Left
    addPart(new THREE.SphereGeometry(0.55, 32, 24), goldMat,
      0.42, -0.12, 0.55, 0, 0, 0, 1.0, 1.2, 0.8);

    // Deltoid muscle bulge Right
    addPart(new THREE.SphereGeometry(0.55, 32, 24), goldMat,
      0.42, -0.12, -0.55, 0, 0, 0, 1.0, 1.2, 0.8);

    // Thigh muscle bulge Left
    addPart(new THREE.SphereGeometry(0.68, 32, 24), goldMat,
      -0.65, -0.12, 0.52, 0, 0, 0, 1.0, 1.3, 0.9);

    // Thigh muscle bulge Right
    addPart(new THREE.SphereGeometry(0.68, 32, 24), goldMat,
      -0.65, -0.12, -0.52, 0, 0, 0, 1.0, 1.3, 0.9);

    /* ── 3. SKULL & CURVED TAPERING HORNS ── */
    // Main skull
    addPart(new THREE.SphereGeometry(0.5, 32, 24), goldMat,
      1.5, 0.05, 0, 0, 0, -Math.PI * 0.1, 1.0, 0.8, 0.95);

    // Muzzle / Snout
    addPart(new THREE.SphereGeometry(0.3, 32, 24), goldMat,
      1.85, -0.15, 0, 0, 0, -Math.PI * 0.15, 1.2, 0.75, 0.88);

    // Muscular Jaw Left
    addPart(new THREE.SphereGeometry(0.28, 24, 18), goldMat,
      1.4, -0.1, 0.32, 0, 0, 0, 1.1, 0.8, 0.6);

    // Muscular Jaw Right
    addPart(new THREE.SphereGeometry(0.28, 24, 18), goldMat,
      1.4, -0.1, -0.32, 0, 0, 0, 1.1, 0.8, 0.6);

    // Brow Ridge
    addPart(new THREE.SphereGeometry(0.32, 24, 18), goldMat,
      1.48, 0.28, 0, 0, 0, 0, 0.9, 0.7, 0.8);

    // Curved Horns (Chain of 22 spheres creating tapered curving horns)
    const segments = 22;
    const hornGroupR = new THREE.Group();
    const hornGroupL = new THREE.Group();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 0.58;
      
      // Right Horn coords (curving out, forward, up, and slightly inward)
      const dxR = Math.sin(angle) * 0.65;
      const dyR = (1 - Math.cos(angle)) * 0.45 + t * 0.25;
      const dzR = Math.sin(t * Math.PI * 0.45) * 0.42 + t * 0.1;
      
      const r = 0.12 * (1 - t * 0.92);
      const segMeshR = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), goldMat);
      segMeshR.position.set(dxR, dyR, dzR);
      segMeshR.castShadow = true;
      segMeshR.receiveShadow = true;
      hornGroupR.add(segMeshR);

      // Left Horn coords (symmetric along z-axis)
      const dxL = Math.sin(angle) * 0.65;
      const dyL = (1 - Math.cos(angle)) * 0.45 + t * 0.25;
      const dzL = -(Math.sin(t * Math.PI * 0.45) * 0.42 + t * 0.1);
      
      const segMeshL = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), goldMat);
      segMeshL.position.set(dxL, dyL, dzL);
      segMeshL.castShadow = true;
      segMeshL.receiveShadow = true;
      hornGroupL.add(segMeshL);
    }

    hornGroupR.position.set(1.58, 0.28, 0.28);
    hornGroupR.rotation.set(0.1, 0.1, 0.2);
    bull.add(hornGroupR);

    hornGroupL.position.set(1.58, 0.28, -0.28);
    hornGroupL.rotation.set(-0.1, -0.1, 0.2);
    bull.add(hornGroupL);

    // Ears
    addPart(new THREE.SphereGeometry(0.14, 16, 12), goldMat,
      1.45, 0.18, 0.42, 0.2, 0, -0.3, 0.6, 1.0, 0.4);
    addPart(new THREE.SphereGeometry(0.14, 16, 12), goldMat,
      1.45, 0.18, -0.42, -0.2, 0, -0.3, 0.6, 1.0, 0.4);

    /* ── 4. LEGS (Articulated parts to allow running/charging animation) ── */
    // Front-Right Leg Group
    const legFR = new THREE.Group();
    legFR.position.set(0.62, -0.75, 0.65);
    const humerusFR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.75, 16), goldMat);
    humerusFR.rotation.set(0.1, 0, -Math.PI * 0.12);
    humerusFR.castShadow = true;
    humerusFR.receiveShadow = true;
    legFR.add(humerusFR);
    const kneeFR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), goldMat);
    kneeFR.position.set(0.18, -0.4, 0.03);
    legFR.add(kneeFR);
    const forearmFR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.6, 16), goldMat);
    forearmFR.position.set(0.28, -0.7, 0.05);
    forearmFR.rotation.set(0, 0, -Math.PI * 0.05);
    forearmFR.castShadow = true;
    forearmFR.receiveShadow = true;
    legFR.add(forearmFR);
    const hoofFR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.18, 16), goldDark);
    hoofFR.position.set(0.33, -1.03, 0.06);
    hoofFR.castShadow = true;
    hoofFR.receiveShadow = true;
    legFR.add(hoofFR);
    bull.add(legFR);

    // Front-Left Leg Group
    const legFL = new THREE.Group();
    legFL.position.set(0.38, -0.75, -0.65);
    const humerusFL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.75, 16), goldMat);
    humerusFL.rotation.set(-0.1, 0, Math.PI * 0.2);
    humerusFL.castShadow = true;
    humerusFL.receiveShadow = true;
    legFL.add(humerusFL);
    const kneeFL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), goldMat);
    kneeFL.position.set(-0.2, -0.35, -0.03);
    legFL.add(kneeFL);
    const forearmFL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.6, 16), goldMat);
    forearmFL.position.set(-0.13, -0.65, -0.01);
    forearmFL.rotation.set(0, 0, -Math.PI * 0.15);
    forearmFL.castShadow = true;
    forearmFL.receiveShadow = true;
    legFL.add(forearmFL);
    const hoofFL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.18, 16), goldDark);
    hoofFL.position.set(-0.03, -0.97, 0.01);
    hoofFL.castShadow = true;
    hoofFL.receiveShadow = true;
    legFL.add(hoofFL);
    bull.add(legFL);

    // Hind-Right Leg Group
    const legHR = new THREE.Group();
    legHR.position.set(-0.75, -0.75, 0.58);
    const femurHR = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.8, 16), goldMat);
    femurHR.rotation.set(0.1, 0, Math.PI * 0.1);
    femurHR.castShadow = true;
    femurHR.receiveShadow = true;
    legHR.add(femurHR);
    const hockHR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), goldMat);
    hockHR.position.set(-0.15, -0.43, -0.04);
    legHR.add(hockHR);
    const cannonHR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.65, 16), goldMat);
    cannonHR.position.set(-0.10, -0.75, -0.06);
    cannonHR.rotation.set(0, 0, -Math.PI * 0.08);
    cannonHR.castShadow = true;
    cannonHR.receiveShadow = true;
    legHR.add(cannonHR);
    const hoofHR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.18, 16), goldDark);
    hoofHR.position.set(-0.03, -1.05, -0.08);
    hoofHR.castShadow = true;
    hoofHR.receiveShadow = true;
    legHR.add(hoofHR);
    bull.add(legHR);

    // Hind-Left Leg Group
    const legHL = new THREE.Group();
    legHL.position.set(-0.68, -0.75, -0.58);
    const femurHL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.8, 16), goldMat);
    femurHL.rotation.set(-0.1, 0, Math.PI * 0.22);
    femurHL.castShadow = true;
    femurHL.receiveShadow = true;
    legHL.add(femurHL);
    const hockHL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), goldMat);
    hockHL.position.set(-0.2, -0.4, 0.04);
    legHL.add(hockHL);
    const cannonHL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.65, 16), goldMat);
    cannonHL.position.set(-0.32, -0.73, 0.07);
    cannonHL.rotation.set(0, 0, Math.PI * 0.12);
    cannonHL.castShadow = true;
    cannonHL.receiveShadow = true;
    legHL.add(cannonHL);
    const hoofHL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.18, 16), goldDark);
    hoofHL.position.set(-0.42, -1.05, 0.09);
    hoofHL.castShadow = true;
    hoofHL.receiveShadow = true;
    legHL.add(hoofHL);
    bull.add(legHL);

    /* ── 5. CURLED TAIL WITH TUFT ── */
    const tailGroup = new THREE.Group();
    const tailSegments = 16;
    for (let i = 0; i <= tailSegments; i++) {
      const t = i / tailSegments;
      const dx = -t * 0.65 - Math.sin(t * Math.PI) * 0.15;
      const dy = 0.2 + Math.sin(t * Math.PI * 0.8) * 0.5 - t * 0.25;
      const dz = -t * 0.12 + Math.cos(t * Math.PI * 0.5) * 0.1;
      const r = 0.06 * (1 - t * 0.4);
      
      const tailNode = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), goldMat);
      tailNode.position.set(dx, dy, dz);
      tailNode.castShadow = true;
      tailNode.receiveShadow = true;
      tailGroup.add(tailNode);
    }
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), goldMat);
    tuft.position.set(-0.65, -0.05, -0.02);
    tuft.scale.set(1.4, 0.9, 0.9);
    tailGroup.add(tuft);
    tailGroup.position.set(-1.42, 0.1, 0);
    bull.add(tailGroup);

    /* ── Initial Position Setup ── */
    bull.rotation.y = Math.PI * 0.12;
    bull.position.set(0.1, 0.12, 0);

    /* ── 6. GOLDEN FINANCIAL GROWTH PARTICLES ── */
    // Create floating sparks that rush from front to back, indicating high-speed forward charge
    const particlesCount = 45;
    const particleGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffd966,
      transparent: true,
      opacity: 0.8,
    });
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const particleData: Array<{ mesh: THREE.Mesh; speed: number }> = [];
    for (let i = 0; i < particlesCount; i++) {
      const mesh = new THREE.Mesh(particleGeo, particleMat);
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.3) * 4;
      const z = (Math.random() - 0.5) * 6;
      mesh.position.set(x, y, z);
      particlesGroup.add(mesh);
      particleData.push({
        mesh,
        speed: 0.05 + Math.random() * 0.08,
      });
    }

    /* ── Resize handler ── */
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ── Animation Loop ── */
    let frame = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.01;

      // Slowly oscillate camera/bull scan angle
      bull.rotation.y = Math.PI * 0.12 + Math.sin(t * 0.4) * 0.12;

      // Galloping Leg Stride Gait Simulation (rotational oscillation)
      const legSpeed = 3.8;

      // Front right limb swings forward / back
      legFR.rotation.z = Math.sin(t * legSpeed) * 0.15;
      legFR.rotation.x = Math.cos(t * legSpeed) * 0.08;

      // Front left limb swings in anti-phase
      legFL.rotation.z = -Math.sin(t * legSpeed) * 0.15;
      legFL.rotation.x = -Math.cos(t * legSpeed) * 0.08;

      // Hind limbs swing symmetrically
      legHR.rotation.z = -Math.cos(t * legSpeed) * 0.12;
      legHL.rotation.z = Math.cos(t * legSpeed) * 0.12;

      // Muscle contraction / breathing simulation
      const breathScale = 1.0 + Math.sin(t * 2.2) * 0.012;
      bull.scale.set(breathScale, breathScale, breathScale);

      // Rhythmic lunging motion representing financial upward surge
      bull.position.x = 0.1 + Math.sin(t * 1.8) * 0.08;
      bull.position.y = 0.12 + Math.cos(t * 2.2) * 0.03;

      // Update financial growth sparks (running trails) flowing past the bull
      particleData.forEach(p => {
        p.mesh.position.x -= p.speed;
        p.mesh.position.y += Math.sin(frame * 0.04 + p.mesh.position.x) * 0.006;
        if (p.mesh.position.x < -6) {
          p.mesh.position.x = 6;
          p.mesh.position.y = (Math.random() - 0.3) * 4;
          p.mesh.position.z = (Math.random() - 0.5) * 6;
        }
      });

      // Slowly rotate light source for gorgeous metallic specular highlights
      keyLight.position.x = -3 + Math.sin(t * 0.5) * 1.5;
      keyLight.position.z = 5 + Math.cos(t * 0.5) * 1.0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      envTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full"
      style={{ minHeight: 400 }}
    />
  );
}
