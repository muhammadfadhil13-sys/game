import { Platform, StarCollectible, Checkpoint } from '../types/game';

export interface WorldData {
  platforms: Platform[];
  stars: StarCollectible[];
  checkpoints: Checkpoint[];
  worldWidth: number;
  worldHeight: number;
}

export function buildGameWorld(totalQuestionsCount: number): WorldData {
  const count = Math.max(1, totalQuestionsCount);
  const platforms: Platform[] = [];
  const stars: StarCollectible[] = [];
  const checkpoints: Checkpoint[] = [];

  const groundY = 460;
  const worldHeight = 560;

  // Initial starting safe area
  checkpoints.push({ x: 120, y: groundY - 50 });
  platforms.push({
    x: 0,
    y: groundY,
    width: 600,
    height: 120,
    type: 'grass',
  });

  let currentX = 500;
  const starSpacing = 320; // Average distance between stars

  for (let i = 0; i < count; i++) {
    const starIndex = i + 1;
    const isCheckpointLocation = i > 0 && i % 4 === 0;

    // Determine platform style and elevation
    const variety = i % 5;
    let starX = currentX + 160;
    let starY = groundY - 70;

    if (variety === 0) {
      // Standard gentle grass platform
      const pWidth = 360;
      platforms.push({
        x: currentX,
        y: groundY,
        width: pWidth,
        height: 120,
        type: 'grass',
      });
      starX = currentX + pWidth / 2;
      starY = groundY - 60;
      currentX += pWidth + 100;
    } else if (variety === 1) {
      // Elevated wood step requiring jump
      platforms.push({
        x: currentX,
        y: groundY,
        width: 180,
        height: 120,
        type: 'grass',
      });
      // Raised wooden platform
      platforms.push({
        x: currentX + 150,
        y: groundY - 80,
        width: 140,
        height: 20,
        type: 'wood',
        passThrough: true,
      });
      // Continuing ground
      platforms.push({
        x: currentX + 320,
        y: groundY,
        width: 200,
        height: 120,
        type: 'grass',
      });
      starX = currentX + 220;
      starY = groundY - 140; // Collect by jumping onto wooden platform
      currentX += 540;
    } else if (variety === 2) {
      // Cloud hopping platform (double jump challenge!)
      platforms.push({
        x: currentX,
        y: groundY,
        width: 160,
        height: 120,
        type: 'grass',
      });
      platforms.push({
        x: currentX + 190,
        y: groundY - 110,
        width: 130,
        height: 22,
        type: 'cloud',
        passThrough: true,
      });
      platforms.push({
        x: currentX + 350,
        y: groundY,
        width: 220,
        height: 120,
        type: 'grass',
      });
      starX = currentX + 255;
      starY = groundY - 170;
      currentX += 580;
    } else if (variety === 3) {
      // Stepping stones
      platforms.push({
        x: currentX,
        y: groundY,
        width: 130,
        height: 120,
        type: 'grass',
      });
      platforms.push({
        x: currentX + 170,
        y: groundY - 45,
        width: 100,
        height: 22,
        type: 'stone',
      });
      platforms.push({
        x: currentX + 310,
        y: groundY - 85,
        width: 110,
        height: 22,
        type: 'wood',
      });
      platforms.push({
        x: currentX + 460,
        y: groundY,
        width: 180,
        height: 120,
        type: 'grass',
      });
      starX = currentX + 365;
      starY = groundY - 145;
      currentX += 660;
    } else {
      // Low bridge with floating star
      platforms.push({
        x: currentX,
        y: groundY,
        width: 400,
        height: 120,
        type: 'grass',
      });
      platforms.push({
        x: currentX + 140,
        y: groundY - 70,
        width: 120,
        height: 18,
        type: 'wood',
        passThrough: true,
      });
      starX = currentX + 200;
      starY = groundY - 130;
      currentX += 430 + 100;
    }

    if (isCheckpointLocation) {
      checkpoints.push({ x: currentX - 160, y: groundY - 50 });
    }

    stars.push({
      id: `star-${starIndex}`,
      questionIndex: i,
      x: starX,
      y: starY,
      baseY: starY,
      radius: 19,
      isCollected: false,
      isAnswered: false,
      glowOffset: i * 0.7,
      numberLabel: starIndex,
    });
  }

  // Final victory landing platform
  platforms.push({
    x: currentX,
    y: groundY,
    width: 600,
    height: 120,
    type: 'grass',
  });
  checkpoints.push({ x: currentX + 150, y: groundY - 50 });

  const worldWidth = currentX + 600;

  return {
    platforms,
    stars,
    checkpoints,
    worldWidth,
    worldHeight,
  };
}
