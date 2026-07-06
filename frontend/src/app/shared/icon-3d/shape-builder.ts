import type * as ThreeNamespace from 'three';

// Baut die 3D-Form fuer eine Kategorie, die als Planet in der Hero-Szene umkreist.
export function buildShapeGroup(THREE: typeof ThreeNamespace, shape: string, colorHex: string): ThreeNamespace.Group {
  const color = new THREE.Color(colorHex);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.15,
  });
  const group = new THREE.Group();

  switch (shape) {
    case 'geld': {
      // Ein Stueck: Vertrag mit rundem "Muenz"-Ausschnitt - eine durchgaengige Silhouette,
      // damit sie aus jedem Blickwinkel als eine Form erkennbar bleibt (statt mehrerer
      // gleichfarbiger Teile, die zu einem Klumpen verschwimmen).
      const w = 0.95;
      const h = 1.25;
      const r = 0.14;
      const docShape = new THREE.Shape();
      docShape.moveTo(-w / 2 + r, -h / 2);
      docShape.lineTo(w / 2 - r, -h / 2);
      docShape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      docShape.lineTo(w / 2, h / 2 - r);
      docShape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      docShape.lineTo(-w / 2 + r, h / 2);
      docShape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      docShape.lineTo(-w / 2, -h / 2 + r);
      docShape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

      const coinHole = new THREE.Path();
      coinHole.absarc(0.08, -0.28, 0.26, 0, Math.PI * 2, false);
      docShape.holes.push(coinHole);

      const docGeometry = new THREE.ExtrudeGeometry(docShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });
      docGeometry.center();
      group.add(new THREE.Mesh(docGeometry, material));

      // ein paar angedeutete Textzeilen oben auf dem Dokument
      for (const yOff of [0.22, 0.42]) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.03), material);
        line.position.set(-0.05, yOff, 0.12);
        group.add(line);
      }
      break;
    }
    case 'planung': {
      // Uhr-Ring plus ein "Fortschritts-Keil" - liest sich als Zeit/Timer,
      // ohne duenne Zeiger, die in der gleichen Farbe untergehen wuerden.
      group.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 14, 44), material));

      const wedge = new THREE.Shape();
      wedge.moveTo(0, 0);
      wedge.absarc(0, 0, 0.82, Math.PI / 2, -Math.PI / 2, true);
      wedge.lineTo(0, 0);
      const wedgeGeometry = new THREE.ExtrudeGeometry(wedge, { depth: 0.14, bevelEnabled: false });
      wedgeGeometry.translate(0, 0, -0.07);
      const wedgeMesh = new THREE.Mesh(wedgeGeometry, material);
      wedgeMesh.position.z = 0.01;
      group.add(wedgeMesh);
      break;
    }
    case 'haushalt': {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 1.05), material);
      body.position.y = -0.3;
      group.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.9, 4), material);
      roof.position.y = 0.55;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      break;
    }
    case 'info':
    case 'zentral': {
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), material));
      const positions: Array<[number, number, number]> = [
        [0, 1, 0],
        [0.95, -0.5, 0.3],
        [-0.95, -0.5, -0.3],
      ];
      for (const [x, y, z] of positions) {
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), material);
        sat.position.set(x, y, z);
        group.add(sat);

        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, z),
        ]);
        const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
        group.add(line);
      }
      break;
    }
    case 'ruhig': {
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.5 + i * 0.35, 0.05, 12, 40),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 - i * 0.25 }),
        );
        group.add(ring);
      }
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), material));
      break;
    }
    case 'sicher': {
      group.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), material));
      break;
    }
    default: {
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), material));
      break;
    }
  }

  return group;
}
