import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import type * as ThreeNamespace from 'three';
import { buildShapeGroup } from '../../../../shared/icon-3d/shape-builder';
import { Category } from '../../data/categories';

interface Orbit {
  group: ThreeNamespace.Group;
  line: ThreeNamespace.Line;
  linePositions: Float32Array;
  radius: number;
  inclination: number;
  phase: number;
  speed: number;
}

@Component({
  selector: 'app-hero-scene',
  template: `<canvas #canvas class="canvas"></canvas>`,
  styleUrl: './hero-scene.component.scss',
})
export class HeroSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() categories: Category[] = [];
  @Input() hubColor = '#1b8f7a';

  private renderer?: ThreeNamespace.WebGLRenderer;
  private scene?: ThreeNamespace.Scene;
  private camera?: ThreeNamespace.PerspectiveCamera;
  private hub?: ThreeNamespace.Group;
  private hubGlow?: ThreeNamespace.Group;
  private orbitSystem?: ThreeNamespace.Group;
  private particles?: ThreeNamespace.Points;
  private orbits: Orbit[] = [];

  private startTime = 0;
  private frameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityObserver: IntersectionObserver | null = null;
  private isVisible = true;
  private reducedMotion = false;

  private pointerX = 0;
  private pointerY = 0;
  private cameraOffsetX = 0;
  private cameraOffsetY = 0;

  private onPointerMove = (event: PointerEvent) => {
    const host = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.pointerX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    this.pointerY = Math.max(-1, Math.min(1, (y - 0.5) * 2));
  };

  async ngAfterViewInit(): Promise<void> {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const THREE = await import('three');
    this.setupScene(THREE);

    if (this.reducedMotion) {
      this.renderer!.render(this.scene!, this.camera!);
    } else {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.observeVisibility();
      this.startTime = performance.now();
      this.animate(THREE);
    }
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.scene?.traverse((obj) => {
      const mesh = obj as ThreeNamespace.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as ThreeNamespace.Material | ThreeNamespace.Material[] | undefined;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material?.dispose();
      }
    });
    this.renderer?.dispose();
  }

  private setupScene(THREE: typeof ThreeNamespace): void {
    const canvas = this.canvasRef.nativeElement;
    const host = canvas.parentElement as HTMLElement;
    const width = host.clientWidth;
    const height = host.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const keyLight = new THREE.PointLight(0x35d6b8, 2.2, 30);
    keyLight.position.set(4, 4, 6);
    this.scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xffffff, 1, 30);
    rimLight.position.set(-5, -3, -4);
    this.scene.add(rimLight);

    this.orbitSystem = new THREE.Group();
    // Auf breiten Bildschirmen sitzt das System rechts (neben dem Text), auf schmalen mittig
    this.orbitSystem.position.x = width > 992 ? 2.3 : 0;
    this.scene.add(this.orbitSystem);

    // Hub in der Mitte: solider Kern + rotierende Drahtgitter-Schale
    const hubColorObj = new THREE.Color(this.hubColor);
    this.hub = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.85, 1),
      new THREE.MeshStandardMaterial({
        color: hubColorObj,
        emissive: hubColorObj,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.3,
      }),
    );
    this.hub.add(core);
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshBasicMaterial({ color: hubColorObj, wireframe: true, transparent: true, opacity: 0.4 }),
    );
    this.hub.add(shell);
    this.orbitSystem.add(this.hub);

    // Weicher Glow: mehrere durchsichtige Kugelschalen fuer einen sanften Verlauf statt einer harten Kante
    this.hubGlow = new THREE.Group();
    for (const [radius, opacity] of [
      [1.5, 0.09],
      [2.0, 0.05],
      [2.6, 0.025],
    ] as Array<[number, number]>) {
      const layer = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 24),
        new THREE.MeshBasicMaterial({ color: hubColorObj, transparent: true, opacity }),
      );
      this.hubGlow.add(layer);
    }
    this.orbitSystem.add(this.hubGlow);

    // Die 4 Kategorien kreisen auf eigenen, geneigten Bahnen um den Hub
    const inclinations = [0.15, 0.55, -0.35, 0.85];
    const speeds = [0.35, 0.27, 0.31, 0.24];
    this.categories.forEach((category, i) => {
      const planet = buildShapeGroup(THREE, category.id, category.color);
      planet.scale.setScalar(0.55);
      this.orbitSystem!.add(planet);

      const linePositions = new Float32Array([0, 0, 0, 0, 0, 0]);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const line = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: new THREE.Color(category.color),
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
        }),
      );
      this.orbitSystem!.add(line);

      this.orbits.push({
        group: planet,
        line,
        linePositions,
        radius: 2.2 + (i % 2) * 0.35,
        inclination: inclinations[i % inclinations.length],
        phase: (i / this.categories.length) * Math.PI * 2,
        speed: speeds[i % speeds.length],
      });
    });

    // Sternenfeld im Hintergrund fuer Tiefe
    const starCount = 160;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 6 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    });
    this.particles = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.particles);

    this.observeResize(host);
  }

  private animate = (THREE: typeof ThreeNamespace): void => {
    if (!this.isVisible) {
      this.frameId = null;
      return;
    }
    this.frameId = requestAnimationFrame(() => this.animate(THREE));

    const t = (performance.now() - this.startTime) / 1000;

    if (this.hub) {
      this.hub.rotation.y = t * 0.3;
      this.hub.rotation.x = 0.3 + Math.sin(t * 0.4) * 0.05;
    }
    if (this.hubGlow) {
      const pulse = 1 + Math.sin(t * 1.2) * 0.06;
      this.hubGlow.scale.setScalar(pulse);
    }

    for (const orbit of this.orbits) {
      const angle = orbit.phase + t * orbit.speed;
      const baseX = orbit.radius * Math.cos(angle);
      const baseZ = orbit.radius * Math.sin(angle);
      const x = baseX;
      const y = baseZ * Math.sin(orbit.inclination);
      const z = baseZ * Math.cos(orbit.inclination);

      orbit.group.position.set(x, y, z);
      // Sanftes Wiegen statt vollem Umlauf, sonst blitzen flache Formen kurz im Kantenprofil auf
      orbit.group.rotation.y = orbit.phase + Math.sin(t * 0.35 + orbit.phase) * 0.5;
      orbit.group.rotation.x = 0.15 + Math.sin(t * 0.28 + orbit.phase) * 0.2;

      orbit.linePositions[3] = x;
      orbit.linePositions[4] = y;
      orbit.linePositions[5] = z;
      (orbit.line.geometry.attributes['position'] as ThreeNamespace.BufferAttribute).needsUpdate = true;
    }

    if (this.particles) {
      this.particles.rotation.y = t * 0.015;
    }

    // Sanfte Kamera-Parallaxe zur Maus
    this.cameraOffsetX += (this.pointerX * 0.6 - this.cameraOffsetX) * 0.04;
    this.cameraOffsetY += (-this.pointerY * 0.4 - this.cameraOffsetY) * 0.04;
    this.camera!.position.x = this.cameraOffsetX;
    this.camera!.position.y = this.cameraOffsetY;
    this.camera!.lookAt(this.orbitSystem!.position.x * 0.85, 0, 0);

    this.renderer!.render(this.scene!, this.camera!);
  };

  private observeResize(host: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!this.renderer || !this.camera || width === 0 || height === 0) {
        return;
      }
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      if (this.orbitSystem) {
        this.orbitSystem.position.x = width > 992 ? 2.3 : 0;
      }
      if (this.reducedMotion) {
        this.renderer.render(this.scene!, this.camera);
      }
    });
    this.resizeObserver.observe(host);
  }

  private observeVisibility(): void {
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = this.isVisible;
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !wasVisible && this.frameId === null) {
        import('three').then((THREE) => this.animate(THREE));
      }
    });
    this.visibilityObserver.observe(this.canvasRef.nativeElement);
  }
}
