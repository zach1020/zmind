"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CyberGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe wireframe
    const globeGeo = new THREE.SphereGeometry(1.3, 36, 24);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Inner wireframe sphere (slightly smaller, different color)
    const innerGeo = new THREE.SphereGeometry(1.28, 18, 12);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff6ec7,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerGlobe);

    // Latitude rings (extra glow rings)
    const ringGroup = new THREE.Group();
    const ringColors = [0x00e5ff, 0xff6ec7, 0x7b68ee];
    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.RingGeometry(
        1.31 + i * 0.002,
        1.32 + i * 0.002,
        64
      );
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i % ringColors.length],
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (Math.PI / 5) * i - Math.PI / 2;
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    // Orbit ring
    const orbitGeo = new THREE.TorusGeometry(1.8, 0.003, 8, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.15,
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 3;
    orbit.rotation.y = Math.PI / 6;
    scene.add(orbit);

    // Floating particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.015,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animate
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      globe.rotation.x += 0.0005;
      innerGlobe.rotation.y -= 0.001;
      innerGlobe.rotation.x += 0.001;
      ringGroup.rotation.y += 0.001;
      orbit.rotation.z += 0.003;
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
