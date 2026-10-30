import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Escena 3D del inicio: un galpón de acero se levanta pieza por pieza, dos soldadores
 * unen los nudos (arco azul, chispas, cordón incandescente) y al final se techa
 * con planchas de aluzinc. Se carga solo en el navegador (import dinámico).
 */

export interface ForgeOptions {
  /** Texto de estado para el panel del inicio, p. ej. "Soldando nudo 07/24" */
  onStatus?: (text: string) => void;
  reduceMotion?: boolean;
}

interface Piece {
  obj: THREE.Object3D;
  to: THREE.Vector3; toQ: THREE.Quaternion;
  from: THREE.Vector3; fromQ: THREE.Quaternion;
  start: number; dur: number; back?: boolean; placed: boolean;
}
interface Joint { pos: THREE.Vector3; pieces: Piece[]; bead: THREE.Mesh; heat: number; welded: boolean; taken: boolean; }
interface Welder { joint: Joint | null; t: number; light: THREE.PointLight; glow: THREE.Sprite; last: THREE.Vector3; }

const W = 3.4;            // media luz del galpón
const H = 3.0;            // altura de columnas
const R = 4.6;            // altura de cumbrera
const FRAMES = [-3.6, -1.2, 1.2, 3.6];
const ZMAX = 3.6;
const WELD_TIME = 0.22;
const SHEET_EVERY = 0.13;

export function createForge(container: HTMLElement, opts: ForgeOptions = {}): { dispose: () => void } {
  // Equipos modestos: menos resolución y menos partículas para que vaya fluido
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(max-width: 700px)').matches;
  const MAX_SPARKS = lowPower ? 700 : 1600;

  const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Fondo claro, por debajo del umbral del brillo para que no se queme
  const bg = new THREE.Color(0xf3efea);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 34, 70);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.6;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);

  // ---------- Texturas generadas (sin descargas) ----------
  const radial = (stops: [number, string][]) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  const dotTex = radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']]);
  const arcTex = radial([[0, 'rgba(255,255,255,1)'], [0.15, 'rgba(220,240,255,.95)'], [0.4, 'rgba(110,190,255,.35)'], [1, 'rgba(60,140,255,0)']]);
  const poolTex = radial([[0, 'rgba(120,70,30,.22)'], [0.55, 'rgba(120,70,30,.08)'], [1, 'rgba(120,70,30,0)']]);

  // ---------- Luces: día claro y cálido + contraluz frío ----------
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0x9c8f83, 1.1));
  const key = new THREE.DirectionalLight(0xffd2a0, 2.4);
  key.position.set(9, 13, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfdcff, 0.9);
  rim.position.set(-11, 7, -9);
  scene.add(rim);

  // ---------- Piso del taller ----------
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0xe7e0d8, roughness: 0.85, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(70, 70, 0xff7a00, 0xff7a00);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.14;
  grid.position.y = 0.003;
  scene.add(grid);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.01;
  scene.add(pool);

  // ---------- Materiales ----------
  // Estructura pintada en rojo óxido, el color de la marca sobre el acero
  const paint = new THREE.MeshPhysicalMaterial({ color: 0x9c3a12, metalness: 0.45, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const web = new THREE.MeshPhysicalMaterial({ color: 0x7c2f10, metalness: 0.45, roughness: 0.45, clearcoat: 0.5 });
  const galv = new THREE.MeshStandardMaterial({ color: 0xb9c0c7, metalness: 0.95, roughness: 0.32 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0x1c1e22, metalness: 0.8, roughness: 0.5 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x55595f, metalness: 0.85, roughness: 0.45 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0x5b5751, roughness: 0.95, metalness: 0 });
  // Aluzinc: plateado con reflejo propio, aunque el resto de la escena refleje poco
  const aluzinc = new THREE.MeshPhysicalMaterial({
    color: 0xc6cdd3, metalness: 1, roughness: 0.3, envMap: envTex, envMapIntensity: 0.85,
    clearcoat: 0.3, clearcoatRoughness: 0.2, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  scene.add(group);
  const pieces: Piece[] = [];
  const zAxis = new THREE.Vector3(0, 0, 1);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  function place(obj: THREE.Object3D, to: THREE.Vector3, toQ: THREE.Quaternion, start: number, lift = 7): Piece {
    // Bajan como colgadas de una grúa: desde arriba, un poco giradas
    const from = to.clone().add(v(rnd(-1.2, 1.2), lift + rnd(0, 3), rnd(-1.2, 1.2)));
    const twist = new THREE.Quaternion().setFromAxisAngle(v(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), rnd(0.5, 1.1));
    const piece: Piece = { obj, to, toQ, from, fromQ: toQ.clone().multiply(twist), start, dur: 0.8, placed: false };
    obj.visible = false;
    group.add(obj);
    pieces.push(piece);
    return piece;
  }

  const memberGeos: THREE.BufferGeometry[] = [];
  function member(a: THREE.Vector3, b: THREE.Vector3, t: number, mat: THREE.Material, start: number, round = true): Piece {
    const len = a.distanceTo(b);
    const geo = round ? new RoundedBoxGeometry(t, t, len + t * 0.5, 2, Math.min(0.03, t * 0.2)) : new THREE.CylinderGeometry(t / 2, t / 2, len, 8).rotateX(Math.PI / 2);
    memberGeos.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const to = a.clone().add(b).multiplyScalar(0.5);
    const toQ = new THREE.Quaternion().setFromUnitVectors(zAxis, b.clone().sub(a).normalize());
    const p = place(mesh, to, toQ, start);
    (p as Piece & { ends: THREE.Vector3[] }).ends = [a.clone(), b.clone()];
    return p;
  }
  const endsOf = (p: Piece) => (p as Piece & { ends?: THREE.Vector3[] }).ends ?? [];

  // 0. Zapatas y planchas base (ya están en el piso al empezar)
  const footGeo = new THREE.BoxGeometry(0.7, 0.24, 0.7);
  const plateGeo = new THREE.BoxGeometry(0.46, 0.04, 0.46);
  FRAMES.forEach(z => [-W, W].forEach(x => {
    const f = new THREE.Mesh(footGeo, concrete);
    f.position.set(x, 0.12, z);
    f.receiveShadow = true;
    group.add(f);
    const pl = new THREE.Mesh(plateGeo, plateMat);
    pl.position.set(x, 0.26, z);
    pl.castShadow = true;
    group.add(pl);
  }));

  const yTop = (x: number) => H + (R - H) * (1 - Math.abs(x) / W);
  const columns: Piece[] = [];
  const structure: Piece[] = [];
  let s = 0.25;

  // 1. Columnas
  FRAMES.forEach(z => [-W, W].forEach(x => { columns.push(member(v(x, 0.28, z), v(x, H, z), 0.26, paint, s)); s += 0.09; }));

  // 2. Tijerales reticulados
  s += 0.2;
  FRAMES.forEach(z => {
    const list: [THREE.Vector3, THREE.Vector3, number, THREE.Material][] = [
      [v(-W, H, z), v(W, H, z), 0.17, paint],
      [v(-W, H, z), v(0, R, z), 0.2, paint],
      [v(0, R, z), v(W, H, z), 0.2, paint],
      [v(0, H, z), v(0, R, z), 0.1, web],
    ];
    [-1, 1].forEach(sx => {
      list.push([v(sx * W / 3, H, z), v(sx * W / 3, yTop(W / 3), z), 0.08, web]);
      list.push([v(sx * 2 * W / 3, H, z), v(sx * 2 * W / 3, yTop(2 * W / 3), z), 0.08, web]);
      list.push([v(sx * 2 * W / 3, H, z), v(sx * W / 3, yTop(W / 3), z), 0.075, web]);
      list.push([v(sx * W / 3, H, z), v(0, R, z), 0.075, web]);
      list.push([v(sx * W, H, z), v(sx * 2 * W / 3, yTop(2 * W / 3), z), 0.075, web]);
    });
    list.forEach(([a, b, t, m], i) => structure.push(member(a, b, t, m, s + i * 0.035)));
    s += 0.45;
  });

  // 3. Vigas longitudinales, correas galvanizadas y arriostres en cruz
  const slopeU = (sx: number) => v(-sx * W, R - H, 0).normalize();          // de alero a cumbrera
  const slopeN = (sx: number) => v(sx * (R - H), W, 0).normalize();          // normal hacia arriba
  const longi: Piece[] = [];
  longi.push(member(v(-W, H, -ZMAX), v(-W, H, ZMAX), 0.18, paint, s));
  longi.push(member(v(W, H, -ZMAX), v(W, H, ZMAX), 0.18, paint, s + 0.06));
  longi.push(member(v(0, R, -ZMAX), v(0, R, ZMAX), 0.16, paint, s + 0.12));
  s += 0.25;
  const purlinT = [0.04, 0.3, 0.55, 0.8];
  [-1, 1].forEach(sx => purlinT.forEach((f, i) => {
    const base = v(sx * W, H, 0).add(slopeU(sx).multiplyScalar(f * Math.hypot(W, R - H))).add(slopeN(sx).multiplyScalar(0.18));
    longi.push(member(v(base.x, base.y, -ZMAX - 0.35), v(base.x, base.y, ZMAX + 0.35), 0.11, galv, s + i * 0.07 + (sx > 0 ? 0.035 : 0)));
  }));
  s += 0.4;
  [-1, 1].forEach(sx => [[-ZMAX, -1.2], [1.2, ZMAX]].forEach(([z0, z1]) => {
    longi.push(member(v(sx * W, 0.5, z0), v(sx * W, H - 0.15, z1), 0.035, rodMat, s, false));
    longi.push(member(v(sx * W, 0.5, z1), v(sx * W, H - 0.15, z0), 0.035, rodMat, s + 0.05, false));
    s += 0.06;
  }));
  const frameDone = s + 0.9;

  // ---------- Nudos de soldadura ----------
  const beadGeo = new THREE.SphereGeometry(0.1, 14, 10);
  const joints: Joint[] = [];
  const map = new Map<string, Joint>();
  const keyOf = (p: THREE.Vector3) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;
  const addJoint = (p: THREE.Vector3, piece: Piece) => {
    const k = keyOf(p);
    let j = map.get(k);
    if (!j) {
      const bead = new THREE.Mesh(beadGeo, new THREE.MeshStandardMaterial({ color: 0x35312d, emissive: 0xff6a00, emissiveIntensity: 0, metalness: 0.6, roughness: 0.5 }));
      bead.position.copy(p);
      bead.visible = false;
      group.add(bead);
      j = { pos: p.clone(), pieces: [], bead, heat: 0, welded: false, taken: false };
      map.set(k, j);
      joints.push(j);
    }
    j.pieces.push(piece);
  };
  [...columns, ...structure].forEach(p => endsOf(p).forEach(e => addJoint(e, p)));
  const weldable = joints.filter(j => j.pieces.length > 1 || j.pos.y < 0.3);

  // ---------- Planchas de aluzinc (perfil trapezoidal) ----------
  const SHEET_W = 0.9;
  const rib = new THREE.Shape();
  {
    const period = SHEET_W / 4, h = 0.07, top = period * 0.28, slope = period * 0.12, t = 0.012;
    const pts: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const x0 = i * period;
      const flat = (period - top - 2 * slope) / 2;
      pts.push([x0, 0], [x0 + flat, 0], [x0 + flat + slope, h], [x0 + flat + slope + top, h], [x0 + flat + 2 * slope + top, 0]);
    }
    pts.push([SHEET_W, 0]);
    rib.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => rib.lineTo(x, y));
    [...pts].reverse().forEach(([x, y]) => rib.lineTo(x, y + t));
    rib.closePath();
  }
  const slopeLen = Math.hypot(W, R - H) + 0.55;
  const sheetGeo = new THREE.ExtrudeGeometry(rib, { depth: slopeLen, bevelEnabled: false, curveSegments: 1 });
  sheetGeo.translate(-SHEET_W / 2, 0, 0);
  const sheets: Piece[] = [];
  const zStart = -ZMAX - 0.45, zEnd = ZMAX + 0.45;
  const perSide = Math.ceil((zEnd - zStart) / (SHEET_W * 0.92));
  for (let i = 0; i < perSide; i++) {
    [-1, 1].forEach(sx => {
      const u = slopeU(sx), n = slopeN(sx);
      const xAxis = n.clone().cross(u);
      const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, n, u));
      const zc = zStart + SHEET_W / 2 + i * SHEET_W * 0.92;
      const eave = v(sx * W, H, zc).sub(u.clone().multiplyScalar(0.55)).add(n.clone().multiplyScalar(0.25));
      const mesh = new THREE.Mesh(sheetGeo, aluzinc);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const p = place(mesh, eave, q, 0, 3.5);
      p.from = eave.clone().add(n.clone().multiplyScalar(2.6)).add(v(0, 1.2, 0));
      p.fromQ = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), sx * 0.25));
      p.dur = 0.7;
      p.back = true;
      p.start = Infinity; // se programa al terminar de soldar
      sheets.push(p);
    });
  }
  // Cumbrera
  const capGeo = new THREE.BoxGeometry(0.42, 0.014, zEnd - zStart + 0.1);
  const cap = new THREE.Group();
  [-1, 1].forEach(sx => {
    const m = new THREE.Mesh(capGeo, aluzinc);
    m.position.set(sx * 0.19, -0.06, 0);
    m.rotation.z = -sx * Math.atan2(R - H, W);
    m.castShadow = true;
    cap.add(m);
  });
  const capPiece = place(cap, v(0, R + 0.36, 0), new THREE.Quaternion(), Infinity, 3);
  capPiece.back = true;

  // ---------- Chispas ----------
  const sparkPos = new Float32Array(MAX_SPARKS * 3);
  const sparkCol = new Float32Array(MAX_SPARKS * 3);
  const sparkVel = new Float32Array(MAX_SPARKS * 3);
  const sparkLife = new Float32Array(MAX_SPARKS);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
  // Mezcla normal: sobre fondo claro la suma de luz no se vería
  const sparkMat = new THREE.PointsMaterial({ size: 0.08, map: dotTex, vertexColors: true, transparent: true, alphaTest: 0.05, depthWrite: false });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  group.add(sparks);
  let sparkHead = 0;
  function emit(p: THREE.Vector3, n: number) {
    for (let i = 0; i < n; i++) {
      const k = sparkHead; sparkHead = (sparkHead + 1) % MAX_SPARKS;
      sparkPos[k * 3] = p.x; sparkPos[k * 3 + 1] = p.y; sparkPos[k * 3 + 2] = p.z;
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.5;
      sparkVel[k * 3] = Math.cos(a) * sp * 0.6;
      sparkVel[k * 3 + 1] = 0.5 + Math.random() * 4;
      sparkVel[k * 3 + 2] = Math.sin(a) * sp * 0.6;
      sparkLife[k] = 0.7 + Math.random() * 0.5;
    }
  }

  // Brasas que flotan en el aire del taller
  const EMBERS = lowPower ? 90 : 220;
  const emberPos = new Float32Array(EMBERS * 3);
  const emberSeed = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    emberPos[i * 3] = rnd(-12, 12); emberPos[i * 3 + 1] = rnd(0, 9); emberPos[i * 3 + 2] = rnd(-10, 10);
    emberSeed[i] = Math.random() * 100;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({ size: 0.06, map: dotTex, color: 0xff7a1a, transparent: true, opacity: 0.6, depthWrite: false }));
  scene.add(embers);

  // ---------- Tres soldadores ----------
  const welders: Welder[] = [0, 1, 2].map(() => {
    const light = new THREE.PointLight(0xcfe6ff, 0, 7, 1.8);
    scene.add(light);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: arcTex, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false }));
    glow.scale.setScalar(0);
    scene.add(glow);
    return { joint: null, t: 0, light, glow, last: v(0, H, 0) };
  });

  // ---------- Animación ----------
  let t = 0;
  let weldedCount = 0;
  let roofStart = Infinity;
  let sheetsDone = 0;
  const mouse = new THREE.Vector2();
  const hot = new THREE.Color(0xfff2c0), warm = new THREE.Color(0xff6a00);
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
  const easeBack = (x: number) => { const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const status = (txt: string) => opts.onStatus?.(txt);
  const pad = (n: number) => String(n).padStart(2, '0');

  function updatePieces() {
    for (const p of pieces) {
      const raw = THREE.MathUtils.clamp((t - p.start) / p.dur, 0, 1);
      const k = p.back ? easeBack(raw) : easeOut(raw);
      p.obj.position.lerpVectors(p.from, p.to, k);
      p.obj.quaternion.slerpQuaternions(p.fromQ, p.toQ, Math.min(1, k));
      p.obj.visible = raw > 0;
      if (raw >= 1 && !p.placed) {
        p.placed = true;
        if (sheets.includes(p)) sheetsDone++;
      }
    }
  }

  function pickJoint(w: Welder): Joint | null {
    let best: Joint | null = null, bestD = Infinity;
    for (const j of weldable) {
      if (j.welded || j.taken || !j.pieces.every(p => p.placed)) continue;
      const d = j.pos.distanceToSquared(w.last);
      if (d < bestD) { bestD = d; best = j; }
    }
    return best;
  }

  function step(dt: number) {
    t += dt;
    updatePieces();

    const allWelded = weldedCount === weldable.length;
    for (const w of welders) {
      if (!w.joint) {
        const j = pickJoint(w);
        if (j) { j.taken = true; w.joint = j; w.t = 0; }
        else if (allWelded && sheetsDone === sheets.length && capPiece.placed && Math.random() < dt * 0.35) {
          w.joint = weldable[Math.floor(Math.random() * weldable.length)]; w.t = -0.6; // repaso ocasional
        }
      }
      const j = w.joint;
      if (j) {
        w.t += dt;
        if (w.t >= 0) {
          j.bead.visible = true;
          j.heat = 1;
          w.light.position.copy(j.pos);
          w.light.intensity = 10 + Math.random() * 16;
          w.glow.position.copy(j.pos);
          w.glow.scale.setScalar(0.32 + Math.random() * 0.28);
          emit(j.pos, lowPower ? 4 : 7);
        }
        if (w.t > (j.welded ? 0.9 : WELD_TIME)) {
          if (!j.welded) { j.welded = true; weldedCount++; }
          w.last.copy(j.pos);
          w.joint = null;
        }
      } else {
        w.light.intensity *= 0.6;
        w.glow.scale.multiplyScalar(0.5);
      }
    }

    // Al terminar de soldar, se techa con aluzinc plancha por plancha
    if (allWelded && roofStart === Infinity && t > frameDone) {
      roofStart = t + 0.3;
      sheets.forEach((p, i) => { p.start = roofStart + i * SHEET_EVERY; });
      capPiece.start = roofStart + sheets.length * SHEET_EVERY + 0.3;
    }

    if (!allWelded) {
      const placed = columns.filter(p => p.placed).length;
      status(placed < columns.length && weldedCount === 0 ? `Montando columnas ${pad(placed)}/${pad(columns.length)}` : `Soldando nudo ${pad(weldedCount)}/${pad(weldable.length)}`);
    } else if (sheetsDone < sheets.length) {
      status(`Techando con aluzinc · plancha ${pad(sheetsDone)}/${pad(sheets.length)}`);
    } else if (!capPiece.placed) {
      status('Colocando la cumbrera');
    } else {
      status(`Galpón terminado · ${weldable.length} nudos · ${sheets.length} planchas`);
    }

    // Cordones que se enfrían
    for (const j of joints) {
      if (!j.bead.visible) continue;
      j.heat = Math.max(0, j.heat - dt * 0.55);
      const m = j.bead.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = j.heat * 3.2;
      m.emissive.copy(warm).lerp(hot, Math.max(0, j.heat - 0.6) * 2.5);
    }

    // Chispas con gravedad y rebote
    for (let k = 0; k < MAX_SPARKS; k++) {
      if (sparkLife[k] <= 0) { sparkPos[k * 3 + 1] = -50; continue; }
      sparkVel[k * 3 + 1] -= 9.8 * dt;
      sparkPos[k * 3] += sparkVel[k * 3] * dt;
      sparkPos[k * 3 + 1] += sparkVel[k * 3 + 1] * dt;
      sparkPos[k * 3 + 2] += sparkVel[k * 3 + 2] * dt;
      if (sparkPos[k * 3 + 1] < 0.02) { sparkPos[k * 3 + 1] = 0.02; sparkVel[k * 3 + 1] *= -0.3; sparkVel[k * 3] *= 0.6; sparkVel[k * 3 + 2] *= 0.6; }
      sparkLife[k] -= dt * 0.9;
      const l = Math.max(0, sparkLife[k]);
      sparkCol[k * 3] = 1;
      sparkCol[k * 3 + 1] = 0.25 + 0.6 * l;
      sparkCol[k * 3 + 2] = 0.05 + 0.3 * l * l;
    }
    sparkGeo.attributes['position'].needsUpdate = true;
    sparkGeo.attributes['color'].needsUpdate = true;

    for (let i = 0; i < EMBERS; i++) {
      emberPos[i * 3 + 1] += dt * (0.25 + (emberSeed[i] % 1) * 0.4);
      emberPos[i * 3] += Math.sin(t * 0.7 + emberSeed[i]) * dt * 0.25;
      if (emberPos[i * 3 + 1] > 10) emberPos[i * 3 + 1] = 0;
    }
    emberGeo.attributes['position'].needsUpdate = true;

    // Cámara: se acerca al empezar, luego órbita lenta + paralaje con el puntero
    const intro = easeOut(Math.min(1, t / 6));
    const ang = 0.85 + Math.sin(t * 0.07) * 0.38 + mouse.x * 0.14 - (1 - intro) * 0.5;
    const dist = (27 - intro * 5) * distScale;
    camera.position.set(Math.sin(ang) * dist, 5.6 + mouse.y * 0.9 + (1 - intro) * 3, Math.cos(ang) * dist);
    camera.lookAt(lookTarget);
  }

  // Sin posprocesado: sobre fondo claro el brillo velaba toda la escena (y así pesa menos)
  const render = () => renderer.render(scene, camera);

  const lookTarget = new THREE.Vector3(0, 2.3, 0);
  let distScale = 1;
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En pantallas anchas la estructura va a la derecha del texto
    const wide = w > 900;
    lookTarget.set(0, 2.4, 0);
    distScale = wide ? 1 : 1.65;
    camera.fov = wide ? 31 : 44;
    // En celular sube a la parte superior, encima del texto
    if (wide) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.24, w, h);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const onMove = (e: PointerEvent) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  };
  addEventListener('pointermove', onMove, { passive: true });

  // Pausa cuando el inicio no está a la vista o la pestaña está oculta
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(container);

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    step(dt);
    render();
  };
  if (opts.reduceMotion) {
    pieces.forEach(p => { p.start = -10; });
    weldable.forEach(j => { j.bead.visible = true; j.welded = true; });
    weldedCount = weldable.length;
    roofStart = 0;
    t = 30;
    updatePieces();
    step(0);
    render();
  } else {
    loop();
  }

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener('pointermove', onMove);
      pmrem.dispose();
      [dotTex, arcTex, poolTex, envTex].forEach(x => x.dispose());
      memberGeos.forEach(g => g.dispose());
      scene.traverse(o => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
