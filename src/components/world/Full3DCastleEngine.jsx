import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { buildDynamicCastleRooms } from './CastleRoomsData';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';
import { 
  createStoneTileTexture, 
  createBookshelfTexture, 
  createStainedGlassTexture, 
  createCelestialSkyTexture, 
  createCarpetTexture, 
  createParticleGlowTexture, 
  createRuneDaisTexture 
} from './CastleTextureGenerator';
import { 
  Compass, 
  BookOpen, 
  MapPin, 
  Lock, 
  Unlock
} from 'lucide-react';

export default function Full3DCastleEngine() {
  const containerRef = useRef(null);
  const { 
    cameraMode, 
    ambientMode, 
    selectPostById,
    posts,
    categories,
    activeCategory 
  } = useClandestine();

  const activeCastleRooms = useMemo(() => {
    return buildDynamicCastleRooms(categories, posts);
  }, [categories, posts]);

  // Player position in 3D world space (Eye height = 1.7, in front of Observatory Lectern)
  const playerPos = useRef(new THREE.Vector3(0, 1.7, -0.8));
  const playerYaw = useRef(0); // Facing North toward -Z (at lectern and celestial balcony)
  const playerPitch = useRef(-0.08);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const playerVelocityY = useRef(0);
  const isGrounded = useRef(true);
  const keysDown = useRef({});
  const isMouseDown = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const walkCycle = useRef(0);
  const lastFootstepTime = useRef(0);

  // Active room and nearby interactive book
  const [currentRoom, setCurrentRoom] = useState(() => activeCastleRooms[0]);
  const [nearbyBook, setNearbyBook] = useState(null);
  const [roomBanner, setRoomBanner] = useState(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // References to dynamic Three.js objects
  const sceneRef = useRef(null);
  const castleWorldGroupRef = useRef(null);
  const builtRoomIdsRef = useRef(new Set());
  const lightsRef = useRef({ ambient: null, dir: null, roomPoints: [], torchLights: [] });
  const lecternMeshes = useRef([]);
  const torchFlamesRef = useRef([]);
  const manaParticlesRef = useRef(null);
  const materialsRef = useRef(null);
  const makeCorridorRef = useRef(null);
  const buildRoomGeometryRef = useRef(null);
  const prevCategoryRef = useRef(activeCategory);

  // Teleport player directly to a room
  const teleportToRoom = useCallback((room) => {
    playerPos.current.set(room.x, 1.7, room.z - 0.8);
    velocity.current.set(0, 0, 0);
    playerVelocityY.current = 0;
    isGrounded.current = true;
    playerYaw.current = 0;
    playerPitch.current = -0.08;
    soundEngine.playGlissandoWhoosh();
    setRoomBanner(`FAST TRAVEL: ${room.name.toUpperCase()}`);
    setTimeout(() => setRoomBanner(null), 3800);
  }, []);

  // Synchronize category selection with 3D castle exploration
  useEffect(() => {
    if (prevCategoryRef.current === activeCategory) return;
    prevCategoryRef.current = activeCategory;

    const targetRoom = activeCastleRooms.find(r => 
      (r.category && r.category.toLowerCase() === activeCategory.toLowerCase()) ||
      r.categoryId === activeCategory
    ) || (activeCategory === 'all' ? activeCastleRooms[0] : null);

    if (targetRoom) {
      teleportToRoom(targetRoom);
    }
  }, [activeCategory, activeCastleRooms, teleportToRoom]);

  // Pointer Lock Toggle
  const togglePointerLock = useCallback(() => {
    if (!containerRef.current) return;
    if (document.pointerLockElement === containerRef.current) {
      document.exitPointerLock?.();
    } else {
      containerRef.current.requestPointerLock?.();
    }
  }, []);

  // Main Three.js Scene, Camera, and Game Loop Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x04060d);
    scene.fog = new THREE.FogExp2(0x060914, 0.012);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    castleWorldGroupRef.current = worldGroup;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.copy(playerPos.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(
      ambientMode === 'warm' ? 0xffe6c4 : 0x7dd3fc, 
      ambientMode === 'warm' ? 2.4 : 1.3
    );
    scene.add(ambientLight);
    lightsRef.current.ambient = ambientLight;

    const sunLight = new THREE.DirectionalLight(
      ambientMode === 'warm' ? 0xffbe6b : 0x38bdf8, 
      ambientMode === 'warm' ? 3.0 : 1.9
    );
    sunLight.position.set(30, 60, 40);
    scene.add(sunLight);
    lightsRef.current.dir = sunLight;

    // 3. Anime Celestial Sky Dome (Painterly Twilight Vista)
    const skyTex = createCelestialSkyTexture();
    const skyGeo = new THREE.SphereGeometry(260, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 4. Twinkling Starfield in Upper Celestial Sphere
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 440;
      starPositions[i + 1] = Math.random() * 160 + 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 440;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.95, 
      transparent: true, 
      opacity: 0.9 
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 5. Atmospheric Floating Mana Motes & Gold Dust System
    const moteCount = 650;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 180;
      motePos[i * 3 + 1] = Math.random() * 15 + 0.3;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteTexture = createParticleGlowTexture();
    const moteMat = new THREE.PointsMaterial({
      map: moteTexture,
      size: 1.15,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.78
    });
    const moteSystem = new THREE.Points(moteGeo, moteMat);
    scene.add(moteSystem);
    manaParticlesRef.current = { mesh: moteSystem, positions: motePos };

    // 6. Procedural Textures & Materials
    const floorTileTex = createStoneTileTexture();
    const bookshelfTex = createBookshelfTexture();
    const stainedGlassTex = createStainedGlassTexture();
    const carpetTex = createCarpetTexture();
    const runeDaisTex = createRuneDaisTexture();

    const stoneFloorMat = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughness: 0.42,
      metalness: 0.28
    });

    const gothicWallMat = new THREE.MeshStandardMaterial({
      map: bookshelfTex,
      roughness: 0.65,
      metalness: 0.12
    });

    const stainedGlassMat = new THREE.MeshBasicMaterial({
      map: stainedGlassTex,
      transparent: true,
      opacity: 0.88
    });

    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      roughness: 0.68,
      metalness: 0.22
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.88,
      emissive: 0x785614,
      emissiveIntensity: 0.15
    });

    const runnerCarpetMat = new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.85,
      metalness: 0.05
    });

    const parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xf5ebd6,
      roughness: 0.9,
      metalness: 0.05
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x542611,
      roughness: 0.6,
      metalness: 0.1
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x2b180d,
      roughness: 0.75,
      metalness: 0.15
    });

    materialsRef.current = {
      stoneFloorMat,
      gothicWallMat,
      stainedGlassMat,
      columnMat,
      goldTrimMat,
      runnerCarpetMat,
      parchmentMat,
      leatherMat,
      darkWoodMat,
      runeDaisTex
    };

    lecternMeshes.current = [];
    lightsRef.current.roomPoints = [];
    lightsRef.current.torchLights = [];
    torchFlamesRef.current = [];
    builtRoomIdsRef.current = new Set();

    // --- Modular 3D Castle Props Builders ---

    // 1. Brass Telescope on Tripod Stand
    const buildTelescope = (targetGroup, tx, ty, tz) => {
      const scopeGroup = new THREE.Group();
      scopeGroup.position.set(tx, ty, tz);

      // Tripod legs
      const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.45, 6);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(legGeo, goldTrimMat);
        leg.position.set(Math.sin(angle) * 0.35, 0.7, Math.cos(angle) * 0.35);
        leg.rotation.z = Math.cos(angle) * 0.28;
        leg.rotation.x = -Math.sin(angle) * 0.28;
        scopeGroup.add(leg);
      }

      // Center mount
      const mount = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), goldTrimMat);
      mount.position.y = 1.42;
      scopeGroup.add(mount);

      // Main telescope tube (angled up towards eclipse)
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.18, 2.1, 12), goldTrimMat);
      tube.position.set(0, 1.7, -0.4);
      tube.rotation.x = Math.PI / 3.4;
      scopeGroup.add(tube);

      // Glowing lens
      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.16, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      lens.position.set(0, 2.45, -1.25);
      lens.rotation.x = -Math.PI / 6;
      scopeGroup.add(lens);

      targetGroup.add(scopeGroup);
    };

    // 2. Colossal Vaulted Chandelier with Candles
    const buildChandelier = (targetGroup, cx, cy, cz) => {
      const chanGroup = new THREE.Group();
      chanGroup.position.set(cx, cy, cz);

      // Suspension chain
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 7.5, 6), goldTrimMat);
      chain.position.y = 3.75;
      chanGroup.add(chain);

      // Chandelier ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 8, 24), goldTrimMat);
      ring.rotation.x = Math.PI / 2;
      chanGroup.add(ring);

      // Candles around ring
      const candleCount = 8;
      for (let i = 0; i < candleCount; i++) {
        const angle = (i * Math.PI * 2) / candleCount;
        const kx = Math.sin(angle) * 2.4;
        const kz = Math.cos(angle) * 2.4;

        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 6), parchmentMat);
        candle.position.set(kx, 0.14, kz);
        chanGroup.add(candle);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        flame.position.set(kx, 0.35, kz);
        chanGroup.add(flame);
      }

      // Warm chandelier light
      const cLight = new THREE.PointLight(0xfef08a, 1.4, 28, 1.8);
      cLight.position.set(0, 0.5, 0);
      chanGroup.add(cLight);

      targetGroup.add(chanGroup);
    };

    // 3. Ornate 3D Wooden Bookshelf with Multi-colored Books
    const buildBookshelf = (targetGroup, bx, by, bz, rotY = 0) => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(bx, by, bz);
      shelfGroup.rotation.y = rotY;

      // Wooden Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.0, 0.7), darkWoodMat);
      frame.position.y = 2.0;
      shelfGroup.add(frame);

      // 3 Shelves with books
      const bookColors = [0x991b1b, 0x1e3a8a, 0x065f46, 0x854d0e, 0x581c87, 0x78350f];
      for (let s = 0; s < 3; s++) {
        const sy = 0.8 + s * 1.2;
        for (let b = -1.6; b <= 1.6; b += 0.22) {
          const color = bookColors[Math.floor(Math.random() * bookColors.length)];
          const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
          const bHeight = 0.65 + Math.random() * 0.35;
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.16, bHeight, 0.48), bMat);
          book.position.set(b, sy + bHeight / 2, 0.05);
          shelfGroup.add(book);
        }
      }

      targetGroup.add(shelfGroup);
    };

    // 4. Study Writing Desk with Parchment Scroll & Quill
    const buildStudyDesk = (targetGroup, dx, dy, dz, rotY = 0) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(dx, dy, dz);
      deskGroup.rotation.y = rotY;

      // Desk tabletop
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.3), darkWoodMat);
      top.position.y = 0.85;
      deskGroup.add(top);

      // Desk 4 legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.8, 8);
      [[-1.15, -0.5], [1.15, -0.5], [-1.15, 0.5], [1.15, 0.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, columnMat);
        leg.position.set(lx, 0.4, lz);
        deskGroup.add(leg);
      });

      // Parchment scroll on desk
      const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), parchmentMat);
      scroll.rotation.z = Math.PI / 2;
      scroll.position.set(-0.5, 0.93, 0.1);
      deskGroup.add(scroll);

      // Inkwell and white quill feather
      const inkwell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), columnMat);
      inkwell.position.set(0.6, 0.94, 0.2);
      deskGroup.add(inkwell);

      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.035, 0.45, 6), parchmentMat);
      quill.position.set(0.65, 1.1, 0.2);
      quill.rotation.z = -0.35;
      deskGroup.add(quill);

      targetGroup.add(deskGroup);
    };

    // 5. Alchemist Chemistry Bench with Glowing Retorts and Flasks
    const buildAlchemistBench = (targetGroup, ax, ay, az, rotY = 0) => {
      const labGroup = new THREE.Group();
      labGroup.position.set(ax, ay, az);
      labGroup.rotation.y = rotY;

      // Heavy wood workbench
      const benchTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.4), darkWoodMat);
      benchTop.position.y = 0.88;
      labGroup.add(benchTop);

      const legGeo = new THREE.BoxGeometry(0.15, 0.82, 0.15);
      [[-1.5, -0.55], [1.5, -0.55], [-1.5, 0.55], [1.5, 0.55]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, darkWoodMat);
        leg.position.set(lx, 0.41, lz);
        labGroup.add(leg);
      });

      // Glass distillation apparatus with glowing solutions
      const liquids = [0x10b981, 0x06b6d4, 0xa855f7];
      liquids.forEach((color, idx) => {
        const flaskX = -0.8 + idx * 0.8;
        const flaskBulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 12, 12),
          new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.65,
            transparent: true,
            opacity: 0.85
          })
        );
        flaskBulb.position.set(flaskX, 1.12, 0);
        labGroup.add(flaskBulb);

        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8), goldTrimMat);
        flaskNeck.position.set(flaskX, 1.36, 0);
        labGroup.add(flaskNeck);
      });

      // Distillation coiled tubing
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 20), goldTrimMat);
      coil.position.set(0.4, 1.25, -0.2);
      coil.rotation.x = Math.PI / 2;
      labGroup.add(coil);

      targetGroup.add(labGroup);
    };

    // 6. Knightly Heraldic Wall Shield with Crossed Swords
    const buildHeraldicShield = (targetGroup, hx, hy, hz, rotY = 0) => {
      const shieldGroup = new THREE.Group();
      shieldGroup.position.set(hx, hy, hz);
      shieldGroup.rotation.y = rotY;

      // Crossed swords behind shield
      const bladeGeo = new THREE.BoxGeometry(0.04, 1.6, 0.02);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

      const sword1 = new THREE.Mesh(bladeGeo, bladeMat);
      sword1.rotation.z = Math.PI / 4;
      shieldGroup.add(sword1);

      const sword2 = new THREE.Mesh(bladeGeo, bladeMat);
      sword2.rotation.z = -Math.PI / 4;
      shieldGroup.add(sword2);

      // Heraldic Shield Plate
      const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.08), goldTrimMat);
      shieldPlate.position.z = 0.05;
      shieldGroup.add(shieldPlate);

      targetGroup.add(shieldGroup);
    };

    // 7. Hanging Fabric Banner
    const buildHangingBanner = (targetGroup, hx, hy, hz, rotY = 0, accentColor = '#38bdf8') => {
      const bannerGroup = new THREE.Group();
      bannerGroup.position.set(hx, hy, hz);
      bannerGroup.rotation.y = rotY;

      // Brass horizontal rod
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), goldTrimMat);
      rod.rotation.z = Math.PI / 2;
      rod.position.y = 2.0;
      bannerGroup.add(rod);

      // Hanging velvet tapestry
      const bannerMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        roughness: 0.7,
        side: THREE.DoubleSide
      });
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.8), bannerMat);
      cloth.position.set(0, 0, 0.02);
      bannerGroup.add(cloth);

      targetGroup.add(bannerGroup);
    };

    // --- Master 3D Room Builder ---
    const buildRoomGeometry = (room, targetGroup) => {
      const {
        stoneFloorMat,
        gothicWallMat,
        stainedGlassMat,
        columnMat,
        goldTrimMat,
        runnerCarpetMat,
        parchmentMat,
        leatherMat,
        runeDaisTex
      } = materialsRef.current;

      const roomGroup = new THREE.Group();
      roomGroup.name = `room-${room.id}`;

      // Room Floor
      const floorGeo = new THREE.PlaneGeometry(room.width, room.depth);
      const roomFloorMat = stoneFloorMat.clone();
      roomFloorMat.color.setHex(room.floorColor);
      const floorMesh = new THREE.Mesh(floorGeo, roomFloorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(room.x, 0, room.z);
      roomGroup.add(floorMesh);

      // Central Room Carpet
      const carpetGeo = new THREE.PlaneGeometry(room.width * 0.4, room.depth * 0.7);
      const roomCarpet = new THREE.Mesh(carpetGeo, runnerCarpetMat);
      roomCarpet.rotation.x = -Math.PI / 2;
      roomCarpet.position.set(room.x, 0.015, room.z);
      roomGroup.add(roomCarpet);

      // Room Ceiling (omitted on open-air observatory terrace)
      if (!room.hasBalcony) {
        const ceilingGeo = new THREE.PlaneGeometry(room.width, room.depth);
        const ceilingMesh = new THREE.Mesh(ceilingGeo, gothicWallMat);
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.set(room.x, room.height, room.z);
        roomGroup.add(ceilingMesh);
      }

      // Back Gothic Wall (Only for interior rooms; Balcony rooms have open horizon)
      if (!room.hasBalcony) {
        const wallBackGeo = new THREE.PlaneGeometry(room.width, room.height);
        const wallBackMesh = new THREE.Mesh(wallBackGeo, gothicWallMat);
        wallBackMesh.position.set(room.x, room.height / 2, room.z - room.depth / 2);
        roomGroup.add(wallBackMesh);

        // Stained Glass Window in Back Wall
        const windowGeo = new THREE.PlaneGeometry(6.5, 11);
        const windowMesh = new THREE.Mesh(windowGeo, stainedGlassMat);
        windowMesh.position.set(room.x, room.height / 2 + 0.8, room.z - room.depth / 2 + 0.1);
        roomGroup.add(windowMesh);

        // Volumetric Light Shaft from the window
        const beamGeo = new THREE.ConeGeometry(4.5, 15, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: room.lightColor,
          transparent: true,
          opacity: 0.11,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.set(room.x, room.height / 2, room.z - room.depth / 2 + 6.5);
        beamMesh.rotation.x = Math.PI / 2.75;
        roomGroup.add(beamMesh);
      } else {
        // Open Balcony Terrace with Stone Balustrade overlooking the Celestial Vista
        const railGeo = new THREE.BoxGeometry(room.width - 2, 0.25, 0.45);
        const railMesh = new THREE.Mesh(railGeo, goldTrimMat);
        railMesh.position.set(room.x, 1.15, room.z - room.depth / 2);
        roomGroup.add(railMesh);

        // Balusters
        const balusterCount = 16;
        for (let b = 0; b <= balusterCount; b++) {
          const bx = room.x - (room.width - 2) / 2 + (b * ((room.width - 2) / balusterCount));
          const balGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.05, 8);
          const balMesh = new THREE.Mesh(balGeo, columnMat);
          balMesh.position.set(bx, 0.55, room.z - room.depth / 2);
          roomGroup.add(balMesh);
        }
      }

      // Side Walls (Left and Right)
      const wallSideGeo = new THREE.PlaneGeometry(room.depth, room.height);
      const wallLeft = new THREE.Mesh(wallSideGeo, gothicWallMat);
      wallLeft.position.set(room.x - room.width / 2, room.height / 2, room.z);
      wallLeft.rotation.y = Math.PI / 2;
      roomGroup.add(wallLeft);

      const wallRight = new THREE.Mesh(wallSideGeo, gothicWallMat);
      wallRight.position.set(room.x + room.width / 2, room.height / 2, room.z);
      wallRight.rotation.y = -Math.PI / 2;
      roomGroup.add(wallRight);

      // 4 Perimeter Fluted Columns per room placed in corners
      const colRadius = 0.6;
      const colGeo = new THREE.CylinderGeometry(colRadius, colRadius * 1.18, room.height, 12);
      const halfW = room.width / 2 - 1.2;
      const halfD = room.depth / 2 - 1.2;
      const colCorners = [
        [room.x - halfW, room.z - halfD],
        [room.x + halfW, room.z - halfD],
        [room.x - halfW, room.z + halfD],
        [room.x + halfW, room.z + halfD]
      ];

      colCorners.forEach(([cx, cz], cIdx) => {
        const colMesh = new THREE.Mesh(colGeo, columnMat);
        colMesh.position.set(cx, room.height / 2, cz);
        roomGroup.add(colMesh);

        // Torch Bracket & Sconce
        const bracketGeo = new THREE.BoxGeometry(0.12, 0.12, 0.35);
        const bracketMesh = new THREE.Mesh(bracketGeo, goldTrimMat);
        bracketMesh.position.set(cx, 2.5, cz);
        roomGroup.add(bracketMesh);

        // Emissive Flame Core
        const flameGeo = new THREE.ConeGeometry(0.14, 0.38, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        flameMesh.position.set(cx, 2.75, cz);
        roomGroup.add(flameMesh);

        // Warm Flickering Torch Point Light
        const torchLight = new THREE.PointLight(0xf59e0b, 0.85, 12, 1.8);
        torchLight.position.set(cx, 2.85, cz);
        roomGroup.add(torchLight);

        lightsRef.current.torchLights.push({ light: torchLight, baseIntensity: 0.85, offset: cIdx * 1.5 });
        torchFlamesRef.current.push(flameMesh);
      });

      // Warm Room Center Light
      const pointLight = new THREE.PointLight(room.lightColor, room.lightIntensity, 24, 1.6);
      pointLight.position.set(room.x, 4.2, room.z);
      roomGroup.add(pointLight);
      lightsRef.current.roomPoints.push({ light: pointLight, baseIntensity: room.lightIntensity });

      // Physical 3D Lectern Pedestal holding the Book
      const [px, , pz] = room.pedestalPos;
      
      // Glowing circular dais with animated magic rune circle under lectern
      const daisGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.12, 32);
      const daisMat = new THREE.MeshStandardMaterial({
        map: runeDaisTex,
        color: room.lightColor,
        roughness: 0.25,
        metalness: 0.6,
        emissive: room.lightColor,
        emissiveIntensity: 0.35
      });
      const daisMesh = new THREE.Mesh(daisGeo, daisMat);
      daisMesh.position.set(px, 0.06, pz);
      roomGroup.add(daisMesh);

      // Pedestal Base
      const pedBaseGeo = new THREE.CylinderGeometry(0.65, 0.9, 1.1, 10);
      const pedBase = new THREE.Mesh(pedBaseGeo, columnMat);
      pedBase.position.set(px, 0.55, pz);
      roomGroup.add(pedBase);

      // Angled Lectern Top
      const topGeo = new THREE.BoxGeometry(1.65, 0.12, 1.25);
      const pedTop = new THREE.Mesh(topGeo, goldTrimMat);
      pedTop.position.set(px, 1.15, pz);
      pedTop.rotation.x = 0.28;
      roomGroup.add(pedTop);

      // Open 3D Leatherbound Book on Lectern
      const bookCoverGeo = new THREE.BoxGeometry(1.32, 0.06, 0.98);
      const bookCover = new THREE.Mesh(bookCoverGeo, leatherMat);
      bookCover.position.set(px, 1.24, pz);
      bookCover.rotation.x = 0.28;
      roomGroup.add(bookCover);

      const bookPagesGeo = new THREE.BoxGeometry(1.26, 0.08, 0.92);
      const bookPages = new THREE.Mesh(bookPagesGeo, parchmentMat);
      bookPages.position.set(px, 1.27, pz);
      bookPages.rotation.x = 0.28;
      roomGroup.add(bookPages);

      // Floating Glowing Rune Orb above the Lectern
      const orbGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(px, 1.88, pz);
      roomGroup.add(orbMesh);

      lecternMeshes.current.push({
        roomId: room.id,
        roomName: room.name,
        roomCategory: room.category,
        roomCategoryId: room.categoryId,
        articleId: room.articleId,
        pedestalPos: new THREE.Vector3(px, 1.7, pz),
        orbMesh: orbMesh,
        daisMesh: daisMesh
      });

      // --- Room Distinctive Props ---
      if (room.id === 'observatory') {
        buildTelescope(roomGroup, room.x, 0, room.z - 8.5);
      } else if (room.id === 'cathedral') {
        buildChandelier(roomGroup, room.x, 14, room.z);
        buildHeraldicShield(roomGroup, room.x - halfW, 3.8, room.z, Math.PI / 2);
        buildHeraldicShield(roomGroup, room.x + halfW, 3.8, room.z, -Math.PI / 2);
        buildHangingBanner(roomGroup, room.x - room.width / 2 + 0.2, 6, room.z - 4, Math.PI / 2, '#EAB308');
        buildHangingBanner(roomGroup, room.x + room.width / 2 - 0.2, 6, room.z - 4, -Math.PI / 2, '#EAB308');
      } else if (room.id === 'alchemist') {
        buildAlchemistBench(roomGroup, room.x - 5.5, 0, room.z, Math.PI / 2);
        buildAlchemistBench(roomGroup, room.x + 5.5, 0, room.z, -Math.PI / 2);
      } else if (room.id === 'library') {
        buildBookshelf(roomGroup, room.x - 7.5, 0, room.z, Math.PI / 2);
        buildBookshelf(roomGroup, room.x + 7.5, 0, room.z, -Math.PI / 2);
        buildStudyDesk(roomGroup, room.x, 0, room.z + 5.5, 0);
      } else if (room.id === 'scribe') {
        buildStudyDesk(roomGroup, room.x - 4.5, 0, room.z, Math.PI / 2);
        buildStudyDesk(roomGroup, room.x + 4.5, 0, room.z, -Math.PI / 2);
        buildBookshelf(roomGroup, room.x, 0, room.z - room.depth / 2 + 1.2, 0);
      } else if (room.id === 'arena' || room.id === 'crypts') {
        buildHeraldicShield(roomGroup, room.x - halfW, 3.2, room.z, Math.PI / 2);
        buildHeraldicShield(roomGroup, room.x + halfW, 3.2, room.z, -Math.PI / 2);
      } else if (room.isDynamic) {
        buildHangingBanner(roomGroup, room.x - room.width / 2 + 0.2, 4.5, room.z, Math.PI / 2, room.accentColor || '#38BDF8');
        buildHangingBanner(roomGroup, room.x + room.width / 2 - 0.2, 4.5, room.z, -Math.PI / 2, room.accentColor || '#38BDF8');
      }

      targetGroup.add(roomGroup);
    };

    buildRoomGeometryRef.current = buildRoomGeometry;

    // 7. Construct Initial 3D Castle Architecture
    activeCastleRooms.forEach((room) => {
      buildRoomGeometry(room, worldGroup);
      builtRoomIdsRef.current.add(room.id);
    });

    // 8. Connective Corridors between Doorways (Zero Obstruction inside Rooms)
    const corridorMat = stoneFloorMat.clone();
    corridorMat.color.setHex(0x111622);

    const makeCorridor = (x1, z1, x2, z2, width = 6.0) => {
      const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      if (length < 0.1) return;
      const angle = Math.atan2(x2 - x1, z2 - z1);

      // Stone Corridor Floor
      const cGeo = new THREE.PlaneGeometry(width, length);
      const cMesh = new THREE.Mesh(cGeo, corridorMat);
      cMesh.rotation.x = -Math.PI / 2;
      cMesh.rotation.z = -angle;
      cMesh.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
      worldGroup.add(cMesh);

      // Central Velvet Carpet Runner
      const rGeo = new THREE.PlaneGeometry(width * 0.45, length);
      const rMesh = new THREE.Mesh(rGeo, runnerCarpetMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.rotation.z = -angle;
      rMesh.position.set((x1 + x2) / 2, 0.03, (z1 + z2) / 2);
      worldGroup.add(rMesh);

      // Arched Portal Gateways at Entrance & Exit Doorways
      [ [x1, z1], [x2, z2] ].forEach(([gx, gz]) => {
        const archPillarGeo = new THREE.CylinderGeometry(0.32, 0.38, 4.4, 10);
        const pLeft = new THREE.Mesh(archPillarGeo, columnMat);
        const pRight = new THREE.Mesh(archPillarGeo, columnMat);

        const perpX = Math.cos(angle) * (width / 2);
        const perpZ = -Math.sin(angle) * (width / 2);

        pLeft.position.set(gx + perpX, 2.2, gz + perpZ);
        pRight.position.set(gx - perpX, 2.2, gz - perpZ);
        worldGroup.add(pLeft, pRight);

        // Archway Crossbeam / Lintel
        const lintelGeo = new THREE.BoxGeometry(width + 0.8, 0.5, 0.6);
        const lintel = new THREE.Mesh(lintelGeo, goldTrimMat);
        lintel.position.set(gx, 4.4, gz);
        lintel.rotation.y = -angle + Math.PI / 2;
        worldGroup.add(lintel);

        // Hanging Amber Lantern
        const lanternGeo = new THREE.BoxGeometry(0.28, 0.5, 0.28);
        const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const lantern = new THREE.Mesh(lanternGeo, lanternMat);
        lantern.position.set(gx, 3.8, gz);
        worldGroup.add(lantern);

        const lanternLight = new THREE.PointLight(0xf59e0b, 0.65, 9, 2);
        lanternLight.position.set(gx, 3.7, gz);
        worldGroup.add(lanternLight);
      });
    };

    makeCorridorRef.current = makeCorridor;

    // Connect standard room doorways without encroaching on room centers
    makeCorridor(0, 12, 0, 15);      // Observatory to Cathedral (South)
    makeCorridor(-12, 0, -20, 0);    // Observatory to Astrolabe (West)
    makeCorridor(12, 0, 19, 0);      // Observatory to Tech Vault (East)
    makeCorridor(-30, -10, -30, -19); // Astrolabe to Scribe (South)
    makeCorridor(30, -11, 30, -19);   // Tech Vault to Alchemist (South)
    makeCorridor(-40, 0, -49, 0);    // Astrolabe to Gaming Nexus (West)
    makeCorridor(41, 0, 49, 0);      // Tech Vault to Speed Gallery (East)
    makeCorridor(0, 49, 0, 57);      // Cathedral to Sovereign Spire (South)
    makeCorridor(-19, 32, -13, 32);  // Arena to Cathedral (East)
    makeCorridor(19, 32, 13, 32);    // Philosophy to Cathedral (West)
    makeCorridor(-60, 11, -60, 20);  // Gaming Nexus to Cloister (South)
    makeCorridor(-50, -30, -40, -30); // Crypts to Scribe (East)
    makeCorridor(50, -30, 40, -30);  // Comments to Alchemist (West)
    makeCorridor(0, -43, 0, -50);    // Library to Map Room (South)
    makeCorridor(-20, -30, -11, -30); // Scribe to Library (East)

    // 9. Giant Rotating Brass Astrolabe Apparatus in Zone 3
    const astrolabeGroup = new THREE.Group();
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.13, 12, 48), goldTrimMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.1, 12, 48), goldTrimMat);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.08, 12, 48), goldTrimMat);
    ring2.rotation.x = Math.PI / 3;
    ring3.rotation.y = Math.PI / 4;
    astrolabeGroup.add(ring1, ring2, ring3);
    astrolabeGroup.position.set(-30, 4.8, 0);
    worldGroup.add(astrolabeGroup);

    // 10. Input Event Listeners
    const onKeyDown = (e) => {
      if (cameraMode === 'reading' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keysDown.current[e.key.toLowerCase()] = true;

      // [E] interact with nearest book
      if (e.key.toLowerCase() === 'e') {
        if (nearbyBook) {
          selectPostById(nearbyBook.articleId, true);
        }
      }
      // [M] toggle mini-map
      if (e.key.toLowerCase() === 'm') {
        setIsMiniMapOpen(m => !m);
      }
      // [Space] jump
      if (e.key === ' ' && isGrounded.current) {
        playerVelocityY.current = 5.6;
        isGrounded.current = false;
        soundEngine.playPageTurn();
      }
    };

    const onKeyUp = (e) => {
      delete keysDown.current[e.key.toLowerCase()];
    };

    const onMouseDown = (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      isMouseDown.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const isLocked = document.pointerLockElement === container;
      const sensitivity = 0.0032;

      if (isLocked) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        playerYaw.current -= dx * sensitivity;
        playerPitch.current -= dy * sensitivity;
        playerPitch.current = Math.max(-1.42, Math.min(1.42, playerPitch.current));
      } else if (isMouseDown.current) {
        const dx = e.clientX - prevMousePos.current.x;
        const dy = e.clientY - prevMousePos.current.y;
        prevMousePos.current = { x: e.clientX, y: e.clientY };

        playerYaw.current -= dx * sensitivity;
        playerPitch.current -= dy * sensitivity;
        playerPitch.current = Math.max(-1.42, Math.min(1.42, playerPitch.current));
      }
    };

    const onMouseUp = () => {
      isMouseDown.current = false;
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === container);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    // 11. Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // 12. Main 60 FPS Render & Physics Loop
    let animId;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Rotate Astrolabe apparatus rings
      ring1.rotation.z += 0.004;
      ring2.rotation.y += 0.006;
      ring3.rotation.x += 0.008;

      // Animate floating mana particles (drifting upward and swaying)
      if (manaParticlesRef.current) {
        const pos = manaParticlesRef.current.positions;
        for (let i = 0; i < moteCount; i++) {
          pos[i * 3 + 1] += delta * 0.45; // upward drift
          pos[i * 3] += Math.sin(now * 0.001 + i) * 0.008;
          pos[i * 3 + 2] += Math.cos(now * 0.001 + i) * 0.008;
          if (pos[i * 3 + 1] > 14) {
            pos[i * 3 + 1] = 0.4;
          }
        }
        manaParticlesRef.current.mesh.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Torch Sconce Flames and Light Flicker
      lightsRef.current.torchLights.forEach(({ light, baseIntensity, offset }, idx) => {
        const flicker = Math.sin(now * 0.015 + offset) * 0.18 + (Math.random() - 0.5) * 0.05;
        light.intensity = Math.max(0.3, baseIntensity + flicker);
        if (torchFlamesRef.current[idx]) {
          torchFlamesRef.current[idx].scale.y = 1 + Math.sin(now * 0.02 + offset) * 0.2;
        }
      });

      // Animate floating book rune orbs
      lecternMeshes.current.forEach((item, idx) => {
        item.orbMesh.position.y = 1.88 + Math.sin(now * 0.0035 + idx) * 0.12;
        item.orbMesh.rotation.y += 0.02;
      });

      // Character Movement Physics
      if (cameraMode !== 'reading') {
        const isSprinting = keysDown.current['shift'];
        const moveSpeed = (isSprinting ? 13.5 : 8.0) * delta;
        const forward = new THREE.Vector3(
          -Math.sin(playerYaw.current),
          0,
          -Math.cos(playerYaw.current)
        );
        const right = new THREE.Vector3(
          Math.cos(playerYaw.current),
          0,
          -Math.sin(playerYaw.current)
        );

        let moveX = 0;
        let moveZ = 0;
        if (keysDown.current['w'] || keysDown.current['arrowup']) {
          moveX += forward.x;
          moveZ += forward.z;
        }
        if (keysDown.current['s'] || keysDown.current['arrowdown']) {
          moveX -= forward.x;
          moveZ -= forward.z;
        }
        if (keysDown.current['a'] || keysDown.current['arrowleft']) {
          moveX -= right.x;
          moveZ -= right.z;
        }
        if (keysDown.current['d'] || keysDown.current['arrowright']) {
          moveX += right.x;
          moveZ += right.z;
        }

        const moveDir = new THREE.Vector3(moveX, 0, moveZ);
        if (moveDir.lengthSq() > 0) {
          moveDir.normalize();
          playerPos.current.x += moveDir.x * moveSpeed;
          playerPos.current.z += moveDir.z * moveSpeed;

          // Head bobbing cadence synchronized with footsteps
          walkCycle.current += delta * (isSprinting ? 16 : 11);
          if (isGrounded.current) {
            playerPos.current.y = 1.7 + Math.sin(walkCycle.current) * 0.055;
          }

          if (now - lastFootstepTime.current > (isSprinting ? 320 : 440)) {
            soundEngine.playPageTurn();
            lastFootstepTime.current = now;
          }
        } else if (isGrounded.current) {
          playerPos.current.y = 1.7;
        }

        // Jump & Gravity Physics
        if (!isGrounded.current) {
          playerPos.current.y += playerVelocityY.current * delta;
          playerVelocityY.current -= 18.0 * delta; // Gravity
          if (playerPos.current.y <= 1.7) {
            playerPos.current.y = 1.7;
            playerVelocityY.current = 0;
            isGrounded.current = true;
          }
        }
      }

      // Update Camera Orientation from Yaw & Pitch
      const euler = new THREE.Euler(playerPitch.current, playerYaw.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
      camera.position.copy(playerPos.current);

      // Check current room by proximity
      let foundRoom = activeCastleRooms[0];
      let shortestRoomDist = Infinity;
      activeCastleRooms.forEach((r) => {
        const dist = Math.sqrt((playerPos.current.x - r.x) ** 2 + (playerPos.current.z - r.z) ** 2);
        if (dist < shortestRoomDist) {
          shortestRoomDist = dist;
          foundRoom = r;
        }
      });

      if (foundRoom && foundRoom.id !== currentRoom?.id) {
        setCurrentRoom(foundRoom);
        setRoomBanner(`${foundRoom.name.toUpperCase()}`);
        setTimeout(() => setRoomBanner(null), 3200);
      }

      // Check nearby interactive lectern book
      let closeBook = null;
      for (const item of lecternMeshes.current) {
        const dist = playerPos.current.distanceTo(item.pedestalPos);
        if (dist < 3.4) {
          const matchedPost = (posts && posts.length > 0)
            ? (posts.find(p => 
                p.id === item.articleId || 
                (p.categoryId && p.categoryId === item.roomCategoryId) || 
                (p.category && item.roomCategory && p.category.toLowerCase() === item.roomCategory.toLowerCase())
              ) || posts[0])
            : null;

          if (matchedPost) {
            closeBook = {
              ...item,
              articleId: matchedPost.id,
              title: matchedPost.title,
              category: matchedPost.category
            };
          }
          break;
        }
      }
      setNearbyBook(closeBook);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cameraMode, posts, selectPostById]);

  // Reactive Dynamic 3D Room Spawner:
  // When arbitrary new categories are added, immediately spawn their 3D hall,
  // lectern, and corridor in the running Three.js scene without page reload.
  useEffect(() => {
    if (!castleWorldGroupRef.current || !buildRoomGeometryRef.current || !makeCorridorRef.current) return;

    activeCastleRooms.forEach((room) => {
      if (!builtRoomIdsRef.current.has(room.id)) {
        buildRoomGeometryRef.current(room, castleWorldGroupRef.current);
        builtRoomIdsRef.current.add(room.id);

        // Find nearest existing room to connect corridor
        let nearest = activeCastleRooms[0];
        let minDist = Infinity;
        activeCastleRooms.forEach((other) => {
          if (other.id !== room.id && builtRoomIdsRef.current.has(other.id)) {
            const dist = Math.hypot(room.x - other.x, room.z - other.z);
            if (dist < minDist) {
              minDist = dist;
              nearest = other;
            }
          }
        });

        if (nearest) {
          makeCorridorRef.current(room.x, room.z, nearest.x, nearest.z);
        }
      }
    });
  }, [activeCastleRooms]);

  // Update Three.js lighting dynamically when ambientMode changes
  useEffect(() => {
    if (!lightsRef.current.ambient || !lightsRef.current.dir) return;

    if (ambientMode === 'warm') {
      lightsRef.current.ambient.color.setHex(0xffe6c4);
      lightsRef.current.ambient.intensity = 2.4;
      lightsRef.current.dir.color.setHex(0xffbe6b);
      lightsRef.current.dir.intensity = 3.0;
      lightsRef.current.roomPoints.forEach(({ light, baseIntensity }) => {
        light.intensity = baseIntensity;
      });
    } else {
      lightsRef.current.ambient.color.setHex(0x7dd3fc);
      lightsRef.current.ambient.intensity = 1.1;
      lightsRef.current.dir.color.setHex(0x38bdf8);
      lightsRef.current.dir.intensity = 1.6;
      lightsRef.current.roomPoints.forEach(({ light, baseIntensity }) => {
        light.intensity = baseIntensity * 0.65;
      });
    }
  }, [ambientMode]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      
      {/* 1. Full-Screen Real-Time WebGL 3D Canvas */}
      <div 
        ref={containerRef} 
        onClick={togglePointerLock}
        className={`w-full h-full ${isPointerLocked ? 'cursor-none' : 'cursor-grab active:cursor-grabbing'}`}
      />

      {/* 2. Room Entrance Cinematic Announcement Banner */}
      {roomBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-fade-in flex flex-col items-center">
          <div className="px-7 py-2.5 rounded-full bg-black/95 border-2 border-brightGold shadow-[0_0_40px_rgba(232,199,126,0.85)] backdrop-blur-xl flex items-center space-x-3">
            <Compass className="w-4 h-4 text-brightGold animate-spin-slow" />
            <span className="text-xs font-cinzel font-bold text-brightGold tracking-[0.25em]">
              {roomBanner}
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 mt-1">
            * WASD Walk • Shift Sprint • Space Jump • Drag or Lock Mouse to Look *
          </span>
        </div>
      )}

      {/* 3. In-Eye Interaction Prompt when near a 3D Book */}
      {nearbyBook && cameraMode !== 'reading' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fade-in">
          <button
            onClick={() => selectPostById(nearbyBook.articleId, true)}
            className="px-6 py-3 rounded-2xl bg-black/95 hover:bg-black text-amber-100 border-2 border-brightGold shadow-[0_0_45px_rgba(245,158,11,0.9)] backdrop-blur-2xl flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer font-cinzel text-xs font-bold tracking-wider"
          >
            <span className="px-2.5 py-1 rounded-lg bg-brightGold text-obsidian font-mono text-xs font-bold">
              PRESS [E]
            </span>
            <BookOpen className="w-4 h-4 text-brightGold animate-bounce" />
            <span>READ POST: "{nearbyBook.title}" ({nearbyBook.category})</span>
          </button>
        </div>
      )}

      {/* 4. Minimalist HUD: Current Location & Controls Legend */}
      <div className="fixed bottom-4 left-6 z-30 pointer-events-auto flex items-center space-x-3 text-xs font-mono">
        <div className="bg-black/85 px-4 py-2 rounded-xl border border-brightGold/50 text-amber-200 backdrop-blur-md flex items-center space-x-2 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-brightGold animate-pulse" />
          <span className="font-bold font-cinzel">{currentRoom?.name || 'Observatory'}</span>
        </div>

        <button
          onClick={() => setIsMiniMapOpen(!isMiniMapOpen)}
          className="bg-black/85 hover:bg-black px-3.5 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-brightGold transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
          title="Toggle Castle Directory (Key: M)"
        >
          <Compass className="w-3.5 h-3.5 text-brightGold" />
          <span>MAP [M]</span>
        </button>

        <button
          onClick={togglePointerLock}
          className={`px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
            isPointerLocked 
              ? 'bg-amber-500/20 border-brightGold text-brightGold font-bold' 
              : 'bg-black/85 hover:bg-black border-white/20 text-slate-300 hover:text-white'
          }`}
          title="Toggle Mouse Pointer Lock (True FPS Look)"
        >
          {isPointerLocked ? <Lock className="w-3.5 h-3.5 text-brightGold" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isPointerLocked ? 'MOUSE LOCKED (ESC TO FREE)' : 'LOCK MOUSE LOOK'}</span>
        </button>

        <div className="hidden lg:flex items-center space-x-2 bg-black/70 px-3 py-2 rounded-xl border border-white/10 text-slate-400 text-[10px]">
          <span>[W][A][S][D] Walk</span>
          <span>•</span>
          <span>[Shift] Sprint</span>
          <span>•</span>
          <span>[Space] Jump</span>
          <span>•</span>
          <span>[E] Read Post</span>
        </div>
      </div>

      {/* 5. 16-Room Castle Mini-Map & Fast Travel Overlay */}
      {isMiniMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
          <div 
            onClick={() => setIsMiniMapOpen(false)}
            className="fixed inset-0 cursor-pointer pointer-events-auto"
          />

          <div className="relative w-full max-w-3xl p-6 rounded-3xl bg-black/95 border-2 border-brightGold/70 shadow-2xl z-10 pointer-events-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <Compass className="w-5 h-5 text-brightGold" />
                <h3 className="text-base font-bold font-cinzel text-brightGold">
                  CASTLE DIRECTORY — EXPLORE CATEGORIES
                </h3>
              </div>
              <button 
                onClick={() => setIsMiniMapOpen(false)}
                className="px-2.5 py-1 rounded bg-white/10 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close [M]
              </button>
            </div>

            <p className="text-xs font-mono text-slate-400 mb-4">
              Click any room to fast-travel your first-person perspective immediately:
            </p>

            {/* Dynamic Rooms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[55vh] overflow-y-auto pr-1 folio-scroll">
              {activeCastleRooms.map((room) => {
                const isCurrent = currentRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      teleportToRoom(room);
                      setIsMiniMapOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent 
                        ? 'border-brightGold bg-amber-500/25 text-brightGold shadow-[0_0_20px_rgba(232,199,126,0.5)] scale-102'
                        : 'border-white/10 bg-white/5 hover:border-brightGold/60 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono text-antiqueGold/80 uppercase">
                        {room.category === 'all' ? 'CENTRAL HALL' : room.category}
                      </div>
                      <div className="text-xs font-bold font-cinzel mt-0.5 line-clamp-1">
                        {room.name}
                      </div>
                    </div>

                    <div className="mt-2 text-[9px] font-mono flex items-center justify-between text-slate-400">
                      <span>Coordinates: [{room.x}, {room.z}]</span>
                      {isCurrent && <span className="text-brightGold font-bold">• YOU ARE HERE</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Press <strong>[M]</strong> anytime to toggle directory</span>
              <button 
                onClick={() => {
                  teleportToRoom(activeCastleRooms[0]);
                  setIsMiniMapOpen(false);
                }}
                className="text-antiqueGold hover:text-brightGold underline cursor-pointer"
              >
                Return to Observatory Terrace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
