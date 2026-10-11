import React, { useEffect, useRef, useCallback } from 'react';
import { QuestionItem, Particle } from '../types/game';
import { WorldData, buildGameWorld } from './GameWorld';
import { drawFadhika, drawStarCollectible, drawPlatform, CharacterAction } from './GameRenderer';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  questions: QuestionItem[];
  score: number;
  lives: number;
  isPaused: boolean;
  activeScreen: string;
  onStarTouched: (questionIndex: number) => void;
  onFallPenalty: () => void;
  celebratingQuestionIndex: number | null;
  confusedQuestionIndex: number | null;
}

export interface GameCanvasHandle {
  triggerJump: () => void;
  triggerMoveLeft: (active: boolean) => void;
  triggerMoveRight: (active: boolean) => void;
  restartGame: () => void;
}

export const GameCanvas = React.forwardRef<GameCanvasHandle, GameCanvasProps>(
  (
    {
      questions,
      isPaused,
      activeScreen,
      onStarTouched,
      onFallPenalty,
      celebratingQuestionIndex,
      confusedQuestionIndex,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // World & Level state
    const worldRef = useRef<WorldData>(buildGameWorld(questions.length));

    // Player state
    const playerRef = useRef({
      x: 120,
      y: 380,
      vx: 0,
      vy: 0,
      width: 36,
      height: 48,
      isGrounded: false,
      jumpCount: 0,
      canDoubleJump: true,
      facingRight: true,
      action: 'idle' as CharacterAction,
      runCycle: 0,
      blinkTimer: 180,
      spinAngle: 0,
      celebrateTimer: 0,
      confusedTimer: 0,
    });

    // Camera state
    const cameraRef = useRef({ x: 0, y: 0 });
    const shakeRef = useRef({ amount: 0 });

    // Controls state
    const controlsRef = useRef({
      left: false,
      right: false,
      jump: false,
      lastTapTime: 0,
    });

    // Visual particles
    const particlesRef = useRef<Particle[]>([]);

    // Rebuild world if question count changed
    useEffect(() => {
      worldRef.current = buildGameWorld(questions.length);
    }, [questions.length]);

    // React to celebrate trigger
    useEffect(() => {
      if (celebratingQuestionIndex !== null) {
        playerRef.current.action = 'victory';
        playerRef.current.celebrateTimer = 90; // frames
        // Mark star answered
        const star = worldRef.current.stars.find((s) => s.questionIndex === celebratingQuestionIndex);
        if (star) {
          star.isAnswered = true;
          // Spawn celebratory particles
          spawnStarBurst(star.x, star.y, 25);
        }
      }
    }, [celebratingQuestionIndex]);

    // React to confused trigger
    useEffect(() => {
      if (confusedQuestionIndex !== null) {
        playerRef.current.action = 'confused';
        playerRef.current.confusedTimer = 60;
      }
    }, [confusedQuestionIndex]);

    const spawnStarBurst = (x: number, y: number, count = 15) => {
      const colors = ['#FACC15', '#F59E0B', '#38BDF8', '#4ADE80', '#F43F5E', '#A855F7'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02,
          type: Math.random() > 0.4 ? 'star' : 'confetti',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    const spawnJumpDust = (x: number, y: number) => {
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + 4,
          vx: (Math.random() - 0.5) * 2,
          vy: -0.5 - Math.random() * 1.5,
          color: 'rgba(241, 245, 249, 0.7)',
          size: 3 + Math.random() * 3,
          alpha: 0.8,
          decay: 0.05,
          type: 'dust',
        });
      }
    };

    // Jump / Double Jump execution
    const executeJump = useCallback(() => {
      const p = playerRef.current;
      const now = performance.now();
      const timeSinceLastTap = now - controlsRef.current.lastTapTime;
      controlsRef.current.lastTapTime = now;

      // Double Jump condition:
      // Either in air with double jump available, or quick double tap within 300ms while airborne
      if (!p.isGrounded && p.canDoubleJump) {
        p.vy = -11.5;
        p.canDoubleJump = false;
        p.jumpCount = 2;
        p.action = 'double_jump';
        p.spinAngle = 0;
        sound.playDoubleJump();
        // Double jump golden star burst & ring
        spawnStarBurst(p.x + p.width / 2, p.y + p.height / 2, 14);
        particlesRef.current.push({
          x: p.x + p.width / 2,
          y: p.y + p.height / 2,
          vx: 0,
          vy: 0,
          color: '#FACC15',
          size: 16,
          alpha: 1,
          decay: 0.06,
          type: 'ring',
        });
      } else if (p.isGrounded) {
        // Ground Jump
        p.vy = -12.5;
        p.isGrounded = false;
        p.jumpCount = 1;
        p.canDoubleJump = true;
        p.action = 'jump';
        sound.playJump();
        spawnJumpDust(p.x + p.width / 2, p.y + p.height);
      } else if (timeSinceLastTap < 320 && p.canDoubleJump) {
        // Quick double tap safety fallback
        p.vy = -11.5;
        p.canDoubleJump = false;
        p.jumpCount = 2;
        p.action = 'double_jump';
        p.spinAngle = 0;
        sound.playDoubleJump();
        spawnStarBurst(p.x + p.width / 2, p.y + p.height / 2, 14);
      }
    }, []);

    // Expose control handles to parent
    React.useImperativeHandle(ref, () => ({
      triggerJump: executeJump,
      triggerMoveLeft: (active: boolean) => {
        controlsRef.current.left = active;
      },
      triggerMoveRight: (active: boolean) => {
        controlsRef.current.right = active;
      },
      restartGame: () => {
        playerRef.current.x = 120;
        playerRef.current.y = 380;
        playerRef.current.vx = 0;
        playerRef.current.vy = 0;
        playerRef.current.isGrounded = true;
        playerRef.current.canDoubleJump = true;
        playerRef.current.jumpCount = 0;
        playerRef.current.action = 'idle';
        cameraRef.current.x = 0;
        // Reset stars answered status
        worldRef.current.stars.forEach((s) => {
          s.isCollected = false;
          s.isAnswered = false;
        });
      },
    }));

    // Keyboard handlers
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (activeScreen !== 'playing') return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          controlsRef.current.left = true;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          controlsRef.current.right = true;
        } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          executeJump();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          controlsRef.current.left = false;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          controlsRef.current.right = false;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [activeScreen, executeJump]);

    // Canvas click / tap handler for Jump and Double Jump
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (activeScreen !== 'playing' || isPaused) return;
      // Tap on game canvas triggers jump / double jump
      executeJump();
    };

    // Main Game Loop (Physics, Collisions, Parallax, Rendering)
    useEffect(() => {
      let animId: number;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gravity = 0.58;
      const maxVy = 13;
      const moveSpeed = 4.6;

      const render = () => {
        if (!isPaused && activeScreen === 'playing') {
          const p = playerRef.current;
          const world = worldRef.current;

          // 1. HORIZONTAL MOVEMENT
          if (controlsRef.current.left) {
            p.vx = -moveSpeed;
            p.facingRight = false;
          } else if (controlsRef.current.right) {
            p.vx = moveSpeed;
            p.facingRight = true;
          } else {
            p.vx *= 0.65; // friction
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
          }

          p.x += p.vx;

          // Horizontal bounds
          if (p.x < 10) p.x = 10;
          if (p.x > world.worldWidth - 60) p.x = world.worldWidth - 60;

          // 2. GRAVITY & VERTICAL MOVEMENT
          p.vy += gravity;
          if (p.vy > maxVy) p.vy = maxVy;
          p.y += p.vy;

          // 3. DOUBLE JUMP ROTATION
          if (p.action === 'double_jump') {
            p.spinAngle += 0.32;
            if (p.spinAngle >= Math.PI * 2) {
              p.spinAngle = 0;
              p.action = 'jump';
            }
          }

          // 4. PLATFORM COLLISION DETECTION
          let groundedThisFrame = false;
          const playerFeet = p.y + p.height;
          const playerPrevFeet = playerFeet - p.vy;

          for (const plat of world.platforms) {
            // Horizontal overlap
            const overlapX = p.x + p.width * 0.7 > plat.x && p.x + p.width * 0.3 < plat.x + plat.width;
            if (overlapX) {
              // Landing from above
              if (p.vy >= 0 && playerPrevFeet <= plat.y + 12 && playerFeet >= plat.y) {
                p.y = plat.y - p.height;
                p.vy = 0;
                groundedThisFrame = true;
                p.jumpCount = 0;
                p.canDoubleJump = true;
                break;
              }
            }
          }

          p.isGrounded = groundedThisFrame;

          // 5. UPDATE CHARACTER ACTION STATE
          if (p.celebrateTimer > 0) {
            p.celebrateTimer--;
            p.action = 'victory';
          } else if (p.confusedTimer > 0) {
            p.confusedTimer--;
            p.action = 'confused';
          } else if (!p.isGrounded) {
            if (p.jumpCount >= 2 && p.action === 'double_jump') {
              // keep double_jump until spin completes
            } else {
              p.action = 'jump';
            }
          } else if (Math.abs(p.vx) > 0.5) {
            p.action = 'run';
            p.runCycle += 0.28;
            // Spawn tiny dust trail when running
            if (Math.random() < 0.25) {
              spawnJumpDust(p.x + (p.facingRight ? 4 : p.width - 4), p.y + p.height);
            }
          } else {
            p.action = 'idle';
          }

          // Blink timer countdown
          p.blinkTimer--;
          if (p.blinkTimer <= 0) {
            p.blinkTimer = 160 + Math.floor(Math.random() * 80);
          }

          // 6. PIT DETECTION & CHECKPOINT RESPAWN
          if (p.y > world.worldHeight + 80) {
            // Player fell down
            sound.playHurtOrFall();
            shakeRef.current.amount = 8;
            onFallPenalty();

            // Find closest checkpoint behind player
            let safeCheckpoint = world.checkpoints[0];
            for (const cp of world.checkpoints) {
              if (cp.x <= p.x + 100) {
                safeCheckpoint = cp;
              }
            }
            p.x = safeCheckpoint.x;
            p.y = safeCheckpoint.y;
            p.vx = 0;
            p.vy = 0;
            p.isGrounded = true;
            p.canDoubleJump = true;
          }

          // 7. STAR COLLECTIBLES COLLISION
          const playerCenterX = p.x + p.width / 2;
          const playerCenterY = p.y + p.height / 2;

          for (const star of world.stars) {
            // Floating sinusoidal animation
            star.glowOffset += 0.05;
            star.y = star.baseY + Math.sin(star.glowOffset) * 6;

            if (!star.isCollected && !star.isAnswered) {
              const dist = Math.hypot(playerCenterX - star.x, playerCenterY - star.y);
              if (dist < star.radius + 24) {
                // Touched!
                star.isCollected = true;
                sound.playStarTouch();
                spawnStarBurst(star.x, star.y, 20);
                p.vx = 0; // stop player
                onStarTouched(star.questionIndex);
                break;
              }
            }
          }

          // 8. CAMERA TRACKING
          const targetCamX = p.x - canvas.width * 0.38;
          const maxCamX = Math.max(0, world.worldWidth - canvas.width);
          cameraRef.current.x += (Math.max(0, Math.min(targetCamX, maxCamX)) - cameraRef.current.x) * 0.12;

          // Decay screen shake
          if (shakeRef.current.amount > 0) {
            shakeRef.current.amount *= 0.88;
            if (shakeRef.current.amount < 0.2) shakeRef.current.amount = 0;
          }
        }

        // ==========================================
        // 9. DRAWING EVERYTHING TO CANVAS
        // ==========================================
        const camX = cameraRef.current.x;
        const shakeX = (Math.random() - 0.5) * shakeRef.current.amount;
        const shakeY = (Math.random() - 0.5) * shakeRef.current.amount;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- PARALLAX LAYER 0: Sky Gradient & Sun ---
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#38BDF8'); // Sky blue
        skyGrad.addColorStop(0.65, '#BAE6FD'); // Soft sky
        skyGrad.addColorStop(1, '#FEF08A'); // Warm sunny horizon
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Warm Cheerful Sun
        const sunX = 140 - (camX * 0.03) % 400;
        const sunY = 90;
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Parallax Clouds (Layer 1)
        drawParallaxClouds(ctx, camX, canvas.width);

        // Parallax Distant Pastel Mountains (Layer 2)
        drawDistantMountains(ctx, camX, canvas.width, canvas.height);

        // Parallax Rolling Green Hills with Trees (Layer 3)
        drawRollingHills(ctx, camX, canvas.width, canvas.height);

        // --- WORLD LAYER (Platforms, Stars, Player, Particles) ---
        ctx.save();
        ctx.translate(-camX + shakeX, shakeY);

        // Platforms
        for (const plat of worldRef.current.platforms) {
          // Viewport culling
          if (plat.x + plat.width >= camX - 100 && plat.x <= camX + canvas.width + 100) {
            drawPlatform(ctx, plat);
          }
        }

        // Checkpoint Flags / Beacons
        for (let i = 0; i < worldRef.current.checkpoints.length; i++) {
          const cp = worldRef.current.checkpoints[i];
          if (cp.x >= camX - 50 && cp.x <= camX + canvas.width + 50) {
            drawCheckpointFlag(ctx, cp.x, cp.y, i + 1);
          }
        }

        // Stars
        for (const star of worldRef.current.stars) {
          if (star.x >= camX - 60 && star.x <= camX + canvas.width + 60) {
            drawStarCollectible(
              ctx,
              star.x,
              star.y,
              star.radius,
              star.numberLabel,
              star.isAnswered,
              star.glowOffset
            );
          }
        }

        // Fadhika Character
        const p = playerRef.current;
        drawFadhika(ctx, p.x, p.y, p.width, p.height, {
          action: p.action,
          facingRight: p.facingRight,
          runCycle: p.runCycle,
          blinkTimer: p.blinkTimer,
          spinAngle: p.spinAngle,
          celebrateTimer: p.celebrateTimer,
        });

        // Particles
        updateAndDrawParticles(ctx, particlesRef.current);

        ctx.restore();

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animId);
    }, [isPaused, activeScreen, onStarTouched, onFallPenalty]);

    return (
      <div className="relative w-full h-full select-none overflow-hidden bg-slate-900 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasClick}
          className="w-full h-full object-contain cursor-pointer max-h-screen"
        />
      </div>
    );
  }
);

// Parallax Decorative Helper Functions
function drawParallaxClouds(ctx: CanvasRenderingContext2D, camX: number, viewW: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  const cloudOffset = camX * 0.08;

  const clouds = [
    { x: 80, y: 55, w: 90, h: 32 },
    { x: 380, y: 75, w: 120, h: 38 },
    { x: 740, y: 45, w: 100, h: 34 },
    { x: 1100, y: 80, w: 130, h: 42 },
    { x: 1500, y: 50, w: 110, h: 35 },
  ];

  for (const c of clouds) {
    const rx = ((c.x - cloudOffset) % (viewW + 200)) - 50;
    ctx.beginPath();
    ctx.roundRect(rx, c.y, c.w, c.h, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx + c.w * 0.35, c.y - 4, 16, 0, Math.PI * 2);
    ctx.arc(rx + c.w * 0.65, c.y - 8, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDistantMountains(ctx: CanvasRenderingContext2D, camX: number, viewW: number, viewH: number) {
  ctx.save();
  ctx.fillStyle = '#93C5FD'; // Soft blue mountain silhouette
  const offset = camX * 0.16;

  ctx.beginPath();
  ctx.moveTo(0, viewH);

  for (let x = -100; x <= viewW + 150; x += 120) {
    const worldX = x + offset;
    const peakY = 260 + Math.sin(worldX * 0.005) * 60 + Math.cos(worldX * 0.012) * 35;
    ctx.lineTo(x, peakY);
  }

  ctx.lineTo(viewW, viewH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRollingHills(ctx: CanvasRenderingContext2D, camX: number, viewW: number, viewH: number) {
  ctx.save();
  // Hill Layer 1 (Medium Green)
  ctx.fillStyle = '#86EFAC';
  const offset = camX * 0.38;

  ctx.beginPath();
  ctx.moveTo(0, viewH);
  for (let x = -80; x <= viewW + 100; x += 90) {
    const worldX = x + offset;
    const hillY = 360 + Math.sin(worldX * 0.008) * 38;
    ctx.lineTo(x, hillY);
  }
  ctx.lineTo(viewW, viewH);
  ctx.closePath();
  ctx.fill();

  // Cartoon Pine Trees on the hills
  ctx.fillStyle = '#16A34A';
  for (let x = -50; x <= viewW + 80; x += 140) {
    const worldX = x + offset;
    const hillY = 360 + Math.sin(worldX * 0.008) * 38;
    // Tree trunk & foliage
    ctx.fillRect(x - 2, hillY - 8, 4, 10);
    ctx.beginPath();
    ctx.moveTo(x, hillY - 26);
    ctx.lineTo(x - 9, hillY - 6);
    ctx.lineTo(x + 9, hillY - 6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawCheckpointFlag(ctx: CanvasRenderingContext2D, x: number, y: number, index: number) {
  ctx.save();
  // Pole
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(x - 2, y - 40, 4, 40);

  // Little golden base
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Flag pennant
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 40);
  ctx.lineTo(x + 24, y - 30);
  ctx.lineTo(x + 2, y - 20);
  ctx.closePath();
  ctx.fill();

  // Star icon on flag
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(x + 10, y - 30, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updateAndDrawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.rotation !== undefined && p.vRot !== undefined) {
      p.rotation += p.vRot;
    }

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);

    if (p.type === 'ring') {
      p.size += 1.8;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'star') {
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const spikes = 5;
      const r = p.size;
      const innerR = r * 0.45;
      for (let s = 0; s < spikes * 2; s++) {
        const currR = s % 2 === 0 ? r : innerR;
        const angle = (s * Math.PI) / spikes - Math.PI / 2;
        const px = currR * Math.cos(angle);
        const py = currR * Math.sin(angle);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'confetti') {
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      // Dust / Sparkle dot
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
