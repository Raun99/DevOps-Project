import * as THREE from 'three';

// 1. Procedural Polished Gothic Stone Tile Texture
export function createStoneTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep obsidian stone base
  ctx.fillStyle = '#1e2433';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      // Flagstone subtle noise variation
      const v = Math.floor(Math.sin(x * 0.08 + y * 0.08) * 16);
      ctx.fillStyle = `rgb(${48 + v}, ${56 + v}, ${74 + v})`;
      ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);

      // Gold bevel edge highlight
      ctx.strokeStyle = 'rgba(232, 199, 126, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 5, y + 5, tileSize - 10, tileSize - 10);

      // Grout shadow
      ctx.strokeStyle = '#0d121c';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, tileSize, tileSize);

      // Celestial gold rune circle at tile center
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x + 64, y + 64, 26, 0, Math.PI * 2);
      ctx.stroke();

      // Tiny cross in circle
      ctx.beginPath();
      ctx.moveTo(x + 64, y + 54);
      ctx.lineTo(x + 64, y + 74);
      ctx.moveTo(x + 54, y + 64);
      ctx.lineTo(x + 74, y + 64);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 2. Procedural Gothic Bookshelf Texture
export function createBookshelfTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#120d09';
  ctx.fillRect(0, 0, 512, 512);

  const shelfH = 128;
  const bookColors = [
    '#7f1d1d', '#1e3a8a', '#14532d', '#78350f', 
    '#581c87', '#0f766e', '#831843', '#854d0e',
    '#312e81', '#3b0764', '#1f2937'
  ];

  for (let s = 0; s < 4; s++) {
    const sy = s * shelfH;
    // Carved dark oak plank
    ctx.fillStyle = '#2e190e';
    ctx.fillRect(0, sy + shelfH - 16, 512, 16);
    ctx.fillStyle = '#4a2817';
    ctx.fillRect(0, sy + shelfH - 16, 512, 3);
    ctx.fillStyle = '#1a0d07';
    ctx.fillRect(0, sy + shelfH - 2, 512, 2);

    // Book Spines
    let bx = 12;
    while (bx < 490) {
      const bw = Math.floor(Math.random() * 16 + 10);
      const bh = Math.floor(Math.random() * 28 + 84);
      const bColor = bookColors[Math.floor(Math.random() * bookColors.length)];

      ctx.fillStyle = bColor;
      ctx.fillRect(bx, sy + shelfH - 16 - bh, bw, bh);

      // Gold spine ribs and gilded title foil
      ctx.fillStyle = 'rgba(232, 199, 126, 0.85)';
      ctx.fillRect(bx + 1, sy + shelfH - 16 - bh + 14, bw - 2, 2);
      ctx.fillRect(bx + 1, sy + shelfH - 16 - bh + 36, bw - 2, 2);
      ctx.fillRect(bx + 1, sy + shelfH - 16 - bh + 58, bw - 2, 2);

      // Spine shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(bx, sy + shelfH - 16 - bh, 2, bh);

      bx += bw + 2;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Procedural Gothic Stained Glass Tracery
export function createStainedGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Vibrant jewel gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.25, '#ec4899');
  grad.addColorStop(0.55, '#38bdf8');
  grad.addColorStop(0.8, '#8b5cf6');
  grad.addColorStop(1, '#059669');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Lead tracery framing
  ctx.strokeStyle = '#05070d';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, 512, 1024);

  // Gothic pointed arch top
  ctx.beginPath();
  ctx.arc(256, 256, 220, Math.PI, 0);
  ctx.lineWidth = 12;
  ctx.stroke();

  // Central Rose Window with 8 radiating foil petals
  ctx.beginPath();
  ctx.arc(256, 256, 120, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(angle) * 120, 256 + Math.sin(angle) * 120);
    ctx.stroke();

    // Petal circle
    ctx.beginPath();
    ctx.arc(256 + Math.cos(angle) * 70, 256 + Math.sin(angle) * 70, 30, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Diamond leaded lattice for bottom half
  ctx.lineWidth = 5;
  for (let y = 380; y < 1024; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + 45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, y);
    ctx.lineTo(0, y + 45);
    ctx.stroke();
  }

  // Gold halo highlights
  ctx.strokeStyle = 'rgba(255, 235, 150, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 114, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 4. Procedural Painterly Anime Sky Dome (Makoto Shinkai / Genshin Celestial Twilight)
export function createCelestialSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Multi-stop anime twilight celestial gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0.0, '#02040b'); // Cosmic void zenith
  skyGrad.addColorStop(0.25, '#0a1026'); // Luminous dark midnight
  skyGrad.addColorStop(0.55, '#191c47'); // Royal indigo twilight
  skyGrad.addColorStop(0.75, '#2e1c45'); // Lavender nebula aura
  skyGrad.addColorStop(0.88, '#63251a'); // Warm dusk ember
  skyGrad.addColorStop(0.96, '#b45309'); // Amber horizon line
  skyGrad.addColorStop(1.0, '#f59e0b'); // Radiant gold rim

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Swirling Anime Nebula Clouds (soft atmospheric bands)
  const drawNebula = (cx, cy, rx, ry, color) => {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, color);
    g.addColorStop(0.7, color.replace(/[\d\.]+\)$/, '0.2)'));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawNebula(320, 220, 240, 90, 'rgba(129, 140, 248, 0.28)'); // Indigo nebula
  drawNebula(760, 240, 260, 85, 'rgba(236, 72, 153, 0.22)'); // Sakura magenta band
  drawNebula(520, 290, 300, 70, 'rgba(56, 189, 248, 0.25)'); // Azure glow

  // Giant Celestial Moon / Solar Eclipse
  const mx = 680;
  const my = 150;
  const mr = 54;

  // Outer radiant corona
  const corona = ctx.createRadialGradient(mx, my, mr * 0.7, mx, my, mr * 2.8);
  corona.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
  corona.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
  corona.addColorStop(1, 'transparent');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(mx, my, mr * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Moon surface
  const moonGrad = ctx.createRadialGradient(mx - 15, my - 15, 5, mx, my, mr);
  moonGrad.addColorStop(0, '#fffbeb');
  moonGrad.addColorStop(0.7, '#fde68a');
  moonGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();

  // Subtle craters & lunar maria
  ctx.fillStyle = 'rgba(180, 83, 9, 0.2)';
  ctx.beginPath();
  ctx.arc(mx - 18, my + 8, 14, 0, Math.PI * 2);
  ctx.arc(mx + 12, my - 10, 16, 0, Math.PI * 2);
  ctx.arc(mx + 18, my + 14, 11, 0, Math.PI * 2);
  ctx.fill();

  // Clouds drifting across moon
  ctx.fillStyle = 'rgba(25, 28, 71, 0.55)';
  ctx.beginPath();
  ctx.ellipse(mx - 20, my + 18, 75, 12, -0.08, 0, Math.PI * 2);
  ctx.ellipse(mx + 30, my - 12, 65, 9, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Distant Floating Sanctuary Islands & Mountain Silhouettes on Horizon
  ctx.fillStyle = '#060a14';
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(0, 440);
  ctx.lineTo(90, 405);
  ctx.lineTo(180, 435);
  ctx.lineTo(260, 395);
  ctx.lineTo(350, 445);
  ctx.lineTo(440, 410);
  ctx.lineTo(540, 450);
  ctx.lineTo(620, 390);
  ctx.lineTo(720, 430);
  ctx.lineTo(810, 400);
  ctx.lineTo(920, 440);
  ctx.lineTo(1024, 415);
  ctx.lineTo(1024, 512);
  ctx.closePath();
  ctx.fill();

  // Floating Island Citadel Silhouettes
  ctx.fillStyle = '#0a1020';
  // Island 1
  ctx.beginPath();
  ctx.ellipse(220, 340, 45, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(212, 315, 16, 18); // Castle tower
  // Island 2
  ctx.beginPath();
  ctx.ellipse(840, 310, 55, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(835, 280, 18, 22);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 5. Procedural Imperial Velvet Runner Carpet (Crimson & Gold Damask)
export function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep royal crimson velvet
  ctx.fillStyle = '#4c0519';
  ctx.fillRect(0, 0, 256, 512);

  // Gold fretwork outer border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 0, 236, 512);

  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 0, 220, 512);

  // Repeating Damask Fleur-de-lis / Crest in Center
  for (let y = 32; y < 512; y += 64) {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(128, y, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Inner gold diamond
    ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.beginPath();
    ctx.moveTo(128, y - 10);
    ctx.lineTo(138, y);
    ctx.lineTo(128, y + 10);
    ctx.lineTo(118, y);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

// 6. Procedural Soft Glow Particle Texture for Floating Mana Motes
export function createParticleGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
  radGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.4)');
  radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

// 7. Procedural Magic Rune Dais Texture
export function createRuneDaisTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Concentric Gold Rune Circles
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 215, 0, Math.PI * 2);
  ctx.arc(256, 256, 175, 0, Math.PI * 2);
  ctx.arc(256, 256, 110, 0, Math.PI * 2);
  ctx.stroke();

  // 12 radiating runic rays
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * 110, 256 + Math.sin(a) * 110);
    ctx.lineTo(256 + Math.cos(a) * 215, 256 + Math.sin(a) * 215);
    ctx.stroke();
  }

  // Intersecting triangles (Celestial Hexagram)
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
  for (let t = 0; t < 2; t++) {
    const offset = (Math.PI / 3) * t;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = (Math.PI * 2 / 3) * k + offset;
      const x = 256 + Math.cos(a) * 160;
      const y = 256 + Math.sin(a) * 160;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
