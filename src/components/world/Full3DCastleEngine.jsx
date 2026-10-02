import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CASTLE_ROOMS } from './CastleRoomsData';
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
  Flame, 
  Volume2, 
  Eye, 
  Maximize2,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

export default function Full3DCastleEngine() {
  const containerRef = useRef(null);
  const { 
    cameraMode, 
    travelTo, 
    ambientMode, 
    toggleAmbientMode, 
    selectPostById,
    posts,
    activeCategory 
  } = useClandestine();

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
  const [currentRoom, setCurrentRoom] = useState(CASTLE_ROOMS[0]);
  const [nearbyBook, setNearbyBook] = useState(null);
  const [roomBanner, setRoomBanner] = useState(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // References to dynamic Three.js objects
  const lightsRef = useRef({ ambient: null, dir: null, roomPoints: [], torchLights: [] });
  const lecternMeshes = useRef([]);
  const torchFlamesRef = useRef([]);
  const manaParticlesRef = useRef(null);
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

    const targetRoom = CASTLE_ROOMS.find(r => 
      r.category.toLowerCase() === activeCategory.toLowerCase()
    ) || (activeCategory === 'all' ? CASTLE_ROOMS[0] : null);

    if (targetRoom) {
      teleportToRoom(targetRoom);
    }
  }, [activeCategory, teleportToRoom]);

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
    scene.background = new THREE.Color(0x04060d);
    scene.fog = new THREE.FogExp2(0x060914, 0.012);

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

    lecternMeshes.current = [];
    lightsRef.current.roomPoints = [];
    lightsRef.current.torchLights = [];
    torchFlamesRef.current = [];

    // 7. Construct 16-Room 3D Castle Architecture
    CASTLE_ROOMS.forEach((room) => {
      // Room Floor
      const floorGeo = new THREE.PlaneGeometry(room.width, room.depth);
      const roomFloorMat = stoneFloorMat.clone();
      roomFloorMat.color.setHex(room.floorColor);
      const floorMesh = new THREE.Mesh(floorGeo, roomFloorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(room.x, 0, room.z);
      scene.add(floorMesh);

      // Central Room Carpet
      const carpetGeo = new THREE.PlaneGeometry(room.width * 0.4, room.depth * 0.7);
      const roomCarpet = new THREE.Mesh(carpetGeo, runnerCarpetMat);
      roomCarpet.rotation.x = -Math.PI / 2;
      roomCarpet.position.set(room.x, 0.015, room.z);
      scene.add(roomCarpet);

      // Room Ceiling (omitted on open-air observatory terrace)
      if (!room.hasBalcony) {
        const ceilingGeo = new THREE.PlaneGeometry(room.width, room.depth);
        const ceilingMesh = new THREE.Mesh(ceilingGeo, gothicWallMat);
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.set(room.x, room.height, room.z);
        scene.add(ceilingMesh);
      }

      // Back Gothic Wall (Only for interior rooms; Balcony rooms have open horizon)
      if (!room.hasBalcony) {
        const wallBackGeo = new THREE.PlaneGeometry(room.width, room.height);
        const wallBackMesh = new THREE.Mesh(wallBackGeo, gothicWallMat);
        wallBackMesh.position.set(room.x, room.height / 2, room.z - room.depth / 2);
        scene.add(wallBackMesh);

        // Stained Glass Window in Back Wall
        const windowGeo = new THREE.PlaneGeometry(6.5, 11);
        const windowMesh = new THREE.Mesh(windowGeo, stainedGlassMat);
        windowMesh.position.set(room.x, room.height / 2 + 0.8, room.z - room.depth / 2 + 0.1);
        scene.add(windowMesh);

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
        scene.add(beamMesh);
      } else {
        // Open Balcony Terrace with Stone Balustrade overlooking the Celestial Vista
        const railGeo = new THREE.BoxGeometry(room.width - 2, 0.25, 0.45);
        const railMesh = new THREE.Mesh(railGeo, goldTrimMat);
        railMesh.position.set(room.x, 1.15, room.z - room.depth / 2);
        scene.add(railMesh);

        // Balusters
        const balusterCount = 16;
        for (let b = 0; b <= balusterCount; b++) {
          const bx = room.x - (room.width - 2) / 2 + (b * ((room.width - 2) / balusterCount));
          const balGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.05, 8);
          const balMesh = new THREE.Mesh(balGeo, columnMat);
          balMesh.position.set(bx, 0.55, room.z - room.depth / 2);
          scene.add(balMesh);
        }
      }

      // Side Walls (Left and Right)
      const wallSideGeo = new THREE.PlaneGeometry(room.depth, room.height);
      
      const wallLeft = new THREE.Mesh(wallSideGeo, gothicWallMat);
      wallLeft.position.set(room.x - room.width / 2, room.height / 2, room.z);
      wallLeft.rotation.y = Math.PI / 2;
      scene.add(wallLeft);

      const wallRight = new THREE.Mesh(wallSideGeo, gothicWallMat);
      wallRight.position.set(room.x + room.width / 2, room.height / 2, room.z);
      wallRight.rotation.y = -Math.PI / 2;
      scene.add(wallRight);

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
        scene.add(colMesh);

        // Torch Bracket & Sconce
        const bracketGeo = new THREE.BoxGeometry(0.12, 0.12, 0.35);
        const bracketMesh = new THREE.Mesh(bracketGeo, goldTrimMat);
        bracketMesh.position.set(cx, 2.5, cz);
        scene.add(bracketMesh);

        // Emissive Flame Core
        const flameGeo = new THREE.ConeGeometry(0.14, 0.38, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        flameMesh.position.set(cx, 2.75, cz);
        scene.add(flameMesh);

        // Warm Flickering Torch Point Light
        const torchLight = new THREE.PointLight(0xf59e0b, 0.85, 12, 1.8);
        torchLight.position.set(cx, 2.85, cz);
        scene.add(torchLight);

        lightsRef.current.torchLights.push({ light: torchLight, baseIntensity: 0.85, offset: cIdx * 1.5 });
        torchFlamesRef.current.push(flameMesh);
      });

      // Warm Room Center Light
      const pointLight = new THREE.PointLight(room.lightColor, room.lightIntensity, 24, 1.6);
      pointLight.position.set(room.x, 4.2, room.z);
      scene.add(pointLight);
      lightsRef.current.roomPoints.push({ light: pointLight, baseIntensity: room.lightIntensity });

      // Physical 3D Lectern Pedestal holding the Book
      const [px, py, pz] = room.pedestalPos;
      
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
      scene.add(daisMesh);

      // Pedestal Base
      const pedBaseGeo = new THREE.CylinderGeometry(0.65, 0.9, 1.1, 10);
      const pedBase = new THREE.Mesh(pedBaseGeo, columnMat);
      pedBase.position.set(px, 0.55, pz);
      scene.add(pedBase);

      // Angled Lectern Top
      const topGeo = new THREE.BoxGeometry(1.65, 0.12, 1.25);
      const pedTop = new THREE.Mesh(topGeo, goldTrimMat);
      pedTop.position.set(px, 1.15, pz);
      pedTop.rotation.x = 0.28;
      scene.add(pedTop);

      // Open 3D Leatherbound Book on Lectern
      const bookCoverGeo = new THREE.BoxGeometry(1.32, 0.06, 0.98);
      const bookCover = new THREE.Mesh(bookCoverGeo, leatherMat);
      bookCover.position.set(px, 1.24, pz);
      bookCover.rotation.x = 0.28;
      scene.add(bookCover);

      const bookPagesGeo = new THREE.BoxGeometry(1.26, 0.08, 0.92);
      const bookPages = new THREE.Mesh(bookPagesGeo, parchmentMat);
      bookPages.position.set(px, 1.27, pz);
      bookPages.rotation.x = 0.28;
      scene.add(bookPages);

      // Floating Glowing Rune Orb above the Lectern
      const orbGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(px, 1.88, pz);
      scene.add(orbMesh);

      lecternMeshes.current.push({
        roomId: room.id,
        roomName: room.name,
        articleId: room.articleId,
        pedestalPos: new THREE.Vector3(px, 1.7, pz),
        orbMesh: orbMesh,
        daisMesh: daisMesh
      });
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
      scene.add(cMesh);

      // Central Imperial Velvet Carpet Runner
      const rGeo = new THREE.PlaneGeometry(width * 0.45, length);
      const rMesh = new THREE.Mesh(rGeo, runnerCarpetMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.rotation.z = -angle;
      rMesh.position.set((x1 + x2) / 2, 0.03, (z1 + z2) / 2);
      scene.add(rMesh);

      // Gothic Arched Portal Gateways at Entrance & Exit Doorways
      [ [x1, z1], [x2, z2] ].forEach(([gx, gz]) => {
        const archPillarGeo = new THREE.CylinderGeometry(0.32, 0.38, 4.4, 10);
        const pLeft = new THREE.Mesh(archPillarGeo, columnMat);
        const pRight = new THREE.Mesh(archPillarGeo, columnMat);

        const perpX = Math.cos(angle) * (width / 2);
        const perpZ = -Math.sin(angle) * (width / 2);

        pLeft.position.set(gx + perpX, 2.2, gz + perpZ);
        pRight.position.set(gx - perpX, 2.2, gz - perpZ);
        scene.add(pLeft, pRight);

        // Archway Crossbeam / Lintel
        const lintelGeo = new THREE.BoxGeometry(width + 0.8, 0.5, 0.6);
        const lintel = new THREE.Mesh(lintelGeo, goldTrimMat);
        lintel.position.set(gx, 4.4, gz);
        lintel.rotation.y = -angle + Math.PI / 2;
        scene.add(lintel);

        // Hanging Amber Lantern
        const lanternGeo = new THREE.BoxGeometry(0.28, 0.5, 0.28);
        const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const lantern = new THREE.Mesh(lanternGeo, lanternMat);
        lantern.position.set(gx, 3.8, gz);
        scene.add(lantern);

        const lanternLight = new THREE.PointLight(0xf59e0b, 0.65, 9, 2);
        lanternLight.position.set(gx, 3.7, gz);
        scene.add(lanternLight);
      });
    };

    // Connect room doorways without encroaching on room centers
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
    scene.add(astrolabeGroup);

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
      let foundRoom = CASTLE_ROOMS[0];
      let shortestRoomDist = Infinity;
      CASTLE_ROOMS.forEach((r) => {
        const dist = Math.sqrt((playerPos.current.x - r.x) ** 2 + (playerPos.current.z - r.z) ** 2);
        if (dist < shortestRoomDist) {
          shortestRoomDist = dist;
          foundRoom = r;
        }
      });

      if (foundRoom.id !== currentRoom?.id) {
        setCurrentRoom(foundRoom);
        setRoomBanner(`${foundRoom.name.toUpperCase()}`);
        setTimeout(() => setRoomBanner(null), 3200);
      }

      // Check nearby interactive lectern book
      let closeBook = null;
      for (const item of lecternMeshes.current) {
        const dist = playerPos.current.distanceTo(item.pedestalPos);
        if (dist < 3.4) {
          const matchedPost = posts.find(p => p.id === item.articleId) || posts[0];
          closeBook = {
            ...item,
            title: matchedPost.title,
            category: matchedPost.category
          };
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
            <span>OPEN BOOK: "{nearbyBook.title}" ({nearbyBook.category})</span>
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
          title="Toggle Castle Map (Key: M)"
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
          <span>[E] Read Book</span>
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
                  IMPERIAL CASTLE MAP — 16 ROOMS
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

            {/* 16 Rooms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[55vh] overflow-y-auto pr-1 folio-scroll">
              {CASTLE_ROOMS.map((room) => {
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
                        {room.category === 'all' ? 'SANCTUARY' : room.category}
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
              <span>Press <strong>[M]</strong> anytime to toggle castle map</span>
              <button 
                onClick={() => {
                  teleportToRoom(CASTLE_ROOMS[0]);
                  setIsMiniMapOpen(false);
                }}
                className="text-antiqueGold hover:text-brightGold underline cursor-pointer"
              >
                Return to Grand Observatory
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
