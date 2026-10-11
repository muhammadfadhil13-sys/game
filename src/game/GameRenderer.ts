// Procedural Vector 2D Character Renderer for Fadhika & World Elements
// 100% Original Artwork, vibrant chibi adventurer

export type CharacterAction = 'idle' | 'run' | 'jump' | 'double_jump' | 'victory' | 'confused';

export interface FadhikaAnimState {
  action: CharacterAction;
  facingRight: boolean;
  runCycle: number; // 0 to 2PI
  blinkTimer: number; // counts down
  spinAngle: number; // for double jump 360 spin
  celebrateTimer: number;
}

export function drawFadhika(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  anim: FadhikaAnimState
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height);

  // Flip horizontally if facing left
  if (!anim.facingRight) {
    ctx.scale(-1, 1);
  }

  // Handle double jump spin
  if (anim.action === 'double_jump') {
    ctx.translate(0, -height / 2);
    ctx.rotate(anim.spinAngle);
    ctx.translate(0, height / 2);
  }

  const isBlinking = anim.blinkTimer > 0 && anim.blinkTimer < 8;
  const isRunning = anim.action === 'run';
  const isJumping = anim.action === 'jump' || anim.action === 'double_jump';
  const isVictory = anim.action === 'victory';
  const isConfused = anim.action === 'confused';

  // Body bobbing
  let bodyBob = 0;
  if (anim.action === 'idle') {
    bodyBob = Math.sin(Date.now() / 300) * 1.5;
  } else if (isRunning) {
    bodyBob = Math.abs(Math.sin(anim.runCycle * 2)) * 3;
  } else if (isVictory) {
    bodyBob = Math.abs(Math.sin(Date.now() / 150)) * 6;
  }

  ctx.translate(0, -bodyBob);

  // Colors
  const skinColor = '#FBD5B5';
  const skinShadow = '#F4B184';
  const hatColor = '#E0A96D';
  const hatBand = '#F59E0B';
  const hairColor = '#6B4226';
  const shirtColor = '#06B6D4'; // Bright vibrant cyan
  const shirtAccent = '#FBBF24'; // Yellow collar/scarf
  const shortsColor = '#78350F'; // Dark adventurer khaki
  const shoeColor = '#EF4444'; // Red sport sneakers
  const shoeSole = '#F8FAFC';
  const backpackColor = '#92400E';
  const starGold = '#FACC15';

  // --- 1. BACKPACK (drawn behind body on left side) ---
  ctx.save();
  ctx.fillStyle = backpackColor;
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2;
  // rounded backpack
  ctx.beginPath();
  ctx.roundRect(-24, -40, 14, 22, 6);
  ctx.fill();
  ctx.stroke();

  // Mini Golden Star on Backpack
  drawMiniStar(ctx, -17, -29, 5, starGold);
  ctx.restore();

  // --- 2. LEGS & SHOES ---
  const legSwing1 = isRunning ? Math.sin(anim.runCycle) * 12 : 0;
  const legSwing2 = isRunning ? -Math.sin(anim.runCycle) * 12 : 0;

  // Left Leg (Back)
  ctx.save();
  ctx.translate(-7, -18);
  if (isJumping) {
    ctx.rotate(0.3);
  } else {
    ctx.rotate(legSwing2 * (Math.PI / 180));
  }
  ctx.fillStyle = shortsColor;
  ctx.fillRect(-4, 0, 8, 9);
  ctx.fillStyle = skinColor;
  ctx.fillRect(-3, 9, 6, 6);
  // Shoe
  ctx.fillStyle = shoeColor;
  ctx.beginPath();
  ctx.roundRect(-4, 14, 11, 6, [3, 4, 1, 1]);
  ctx.fill();
  ctx.fillStyle = shoeSole;
  ctx.fillRect(-4, 18, 11, 2);
  ctx.restore();

  // Right Leg (Front)
  ctx.save();
  ctx.translate(7, -18);
  if (isJumping) {
    ctx.rotate(-0.35);
  } else {
    ctx.rotate(legSwing1 * (Math.PI / 180));
  }
  ctx.fillStyle = shortsColor;
  ctx.fillRect(-4, 0, 8, 9);
  ctx.fillStyle = skinColor;
  ctx.fillRect(-3, 9, 6, 6);
  // Shoe
  ctx.fillStyle = shoeColor;
  ctx.beginPath();
  ctx.roundRect(-4, 14, 11, 6, [3, 4, 1, 1]);
  ctx.fill();
  ctx.fillStyle = shoeSole;
  ctx.fillRect(-4, 18, 11, 2);
  ctx.restore();

  // --- 3. TORSO / CLOTHES ---
  ctx.save();
  // Shorts waist
  ctx.fillStyle = shortsColor;
  ctx.beginPath();
  ctx.roundRect(-10, -22, 20, 8, [2, 2, 4, 4]);
  ctx.fill();

  // Adventure Shirt
  ctx.fillStyle = shirtColor;
  ctx.strokeStyle = '#0891B2';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-11, -38, 22, 18, [5, 5, 2, 2]);
  ctx.fill();
  ctx.stroke();

  // Scarf / Collar
  ctx.fillStyle = shirtAccent;
  ctx.beginPath();
  ctx.moveTo(-7, -38);
  ctx.lineTo(0, -31);
  ctx.lineTo(7, -38);
  ctx.lineTo(0, -34);
  ctx.closePath();
  ctx.fill();

  // Explorer Belt
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-10, -22, 20, 3);
  ctx.fillStyle = starGold;
  ctx.fillRect(-2.5, -23, 5, 5);
  ctx.restore();

  // --- 4. ARMS ---
  // Left Hand (Back)
  ctx.save();
  ctx.translate(-11, -34);
  if (isVictory) {
    ctx.rotate(-2.4); // Hand raised high in victory
  } else if (isJumping) {
    ctx.rotate(-1.8);
  } else if (isRunning) {
    ctx.rotate(-legSwing1 * (Math.PI / 180) * 1.5);
  } else {
    ctx.rotate(0.2);
  }
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 9, 3);
  ctx.fill();
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- 5. HEAD & FACE ---
  ctx.save();
  const headY = -47;

  // Hair back tufts
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(-11, headY + 3, 6, 0, Math.PI * 2);
  ctx.arc(11, headY + 3, 6, 0, Math.PI * 2);
  ctx.fill();

  // Cute Chibi Face
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, headY, 14, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.arc(-8, headY + 4, 3, 0, Math.PI * 2);
  ctx.arc(8, headY + 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Hair bangs peeking out under hat
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.moveTo(-12, headY - 4);
  ctx.quadraticCurveTo(-6, headY - 1, -2, headY - 5);
  ctx.quadraticCurveTo(4, headY - 1, 10, headY - 4);
  ctx.lineTo(8, headY - 9);
  ctx.lineTo(-12, headY - 9);
  ctx.closePath();
  ctx.fill();

  // EYES
  if (isBlinking) {
    // Blinking eye arcs
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-5, headY, 3, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, headY, 3, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
  } else if (isVictory) {
    // Happy squinting eyes ^ ^
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, headY + 1);
    ctx.lineTo(-5, headY - 2);
    ctx.lineTo(-2, headY + 1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(2, headY + 1);
    ctx.lineTo(5, headY - 2);
    ctx.lineTo(8, headY + 1);
    ctx.stroke();
  } else {
    // Big expressive cartoon eyes with pupil & shine
    // Left eye
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(-5, headY, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, headY - 1.5, 1.4, 0, Math.PI * 2);
    ctx.arc(-4, headY + 1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(5, headY, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4, headY - 1.5, 1.4, 0, Math.PI * 2);
    ctx.arc(6, headY + 1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // MOUTH
  ctx.fillStyle = '#BE123C';
  ctx.strokeStyle = '#881337';
  ctx.lineWidth = 1;
  if (isVictory) {
    // Big open cheerful smile
    ctx.beginPath();
    ctx.arc(0, headY + 4, 4.5, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (isConfused) {
    // Wavy or tilted mouth
    ctx.beginPath();
    ctx.moveTo(-4, headY + 5);
    ctx.quadraticCurveTo(0, headY + 7, 4, headY + 4);
    ctx.stroke();
  } else {
    // Cheerful friendly smile
    ctx.beginPath();
    ctx.arc(0, headY + 3.5, 3.2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  // Confused question mark effect if wrong
  if (isConfused) {
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('?', 12, headY - 8);
  }

  // --- 6. ADVENTURER EXPLORER HAT ---
  // Hat Brim
  ctx.fillStyle = hatColor;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, headY - 8, 19, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hat Crown / Dome
  ctx.beginPath();
  ctx.moveTo(-11, headY - 9);
  ctx.quadraticCurveTo(-10, headY - 22, 0, headY - 23);
  ctx.quadraticCurveTo(10, headY - 22, 11, headY - 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hat decorative ribbon band
  ctx.fillStyle = hatBand;
  ctx.beginPath();
  ctx.moveTo(-11, headY - 10);
  ctx.quadraticCurveTo(0, headY - 12, 11, headY - 10);
  ctx.lineTo(10.5, headY - 13);
  ctx.quadraticCurveTo(0, headY - 15, -10.5, headY - 13);
  ctx.closePath();
  ctx.fill();

  // Little green explorer leaf / feather on the side
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(7, headY - 14, 4, 2, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // --- 7. RIGHT ARM (Front) ---
  ctx.save();
  ctx.translate(9, -34);
  if (isVictory) {
    ctx.rotate(-2.4); // Both hands raised up!
  } else if (isConfused) {
    ctx.rotate(-1.6); // Scratching head
  } else if (isJumping) {
    ctx.rotate(-1.6);
  } else if (isRunning) {
    ctx.rotate(legSwing1 * (Math.PI / 180) * 1.5);
  } else {
    ctx.rotate(-0.2);
  }
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 9, 3);
  ctx.fill();
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawMiniStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 5;
  const innerR = r * 0.45;
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? r : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw Floating Star Collectible
export function drawStarCollectible(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  numberLabel: number,
  isAnswered: boolean,
  glowOffset: number
) {
  ctx.save();

  if (isAnswered) {
    // Answered star turns into vibrant green glowing checkmark medallion ✓
    ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
    ctx.shadowBlur = 12;

    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx - 2, cy + 6);
    ctx.lineTo(cx + 8, cy - 6);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Floating active star: Golden Glow
  const glow = 10 + Math.sin(glowOffset) * 6;
  ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
  ctx.shadowBlur = glow;

  // Star geometry with slight breathing scale
  const scale = 1 + Math.sin(glowOffset * 1.5) * 0.08;
  const r = radius * scale;
  const innerR = r * 0.42;

  // Outer Star Outline & Gradient
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
  grad.addColorStop(0, '#FEF08A');
  grad.addColorStop(0.7, '#FBBF24');
  grad.addColorStop(1, '#F59E0B');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  const spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const currR = i % 2 === 0 ? r : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + currR * Math.cos(angle);
    const y = cy + currR * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Number Badge (white circle with crisp number)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 11px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(numberLabel), cx, cy + 0.5);

  ctx.restore();
}

// Draw Platform with cute cartoon details
export function drawPlatform(ctx: CanvasRenderingContext2D, p: { x: number; y: number; width: number; height: number; type: string }) {
  ctx.save();
  if (p.type === 'grass') {
    // Dirt body
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y + 8, p.width, p.height - 8, [0, 0, 8, 8]);
    ctx.fill();
    ctx.stroke();

    // Grass top with scalloped fringe
    ctx.fillStyle = '#22C55E';
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, 10, [6, 6, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Grass fringes
    ctx.fillStyle = '#16A34A';
    for (let gx = p.x + 8; gx < p.x + p.width - 8; gx += 16) {
      ctx.beginPath();
      ctx.moveTo(gx - 4, p.y + 10);
      ctx.lineTo(gx, p.y + 16);
      ctx.lineTo(gx + 4, p.y + 10);
      ctx.fill();
    }
  } else if (p.type === 'wood') {
    // Wooden plank platform
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 6);
    ctx.fill();
    ctx.stroke();

    // Wood grain accents
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x + 6, p.y + p.height / 2);
    ctx.lineTo(p.x + p.width - 6, p.y + p.height / 2);
    ctx.stroke();

    // Metal nails at edges
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(p.x + 6, p.y + p.height / 2, 2, 0, Math.PI * 2);
    ctx.arc(p.x + p.width - 6, p.y + p.height / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'cloud') {
    // Fluffy cloud platform
    ctx.shadowColor = 'rgba(147, 197, 253, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2;

    ctx.beginPath();
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    ctx.roundRect(p.x, p.y + 4, p.width, p.height - 4, 12);
    ctx.fill();
    ctx.stroke();

    // Cloud puff bubbles on top
    ctx.beginPath();
    ctx.arc(p.x + p.width * 0.25, p.y + 4, 10, 0, Math.PI * 2);
    ctx.arc(cx, p.y, 14, 0, Math.PI * 2);
    ctx.arc(p.x + p.width * 0.75, p.y + 4, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Stone platform
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 6);
    ctx.fill();
    ctx.stroke();

    // Stone highlights
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(p.x + 4, p.y + 3, p.width - 8, 3);
  }
  ctx.restore();
}
