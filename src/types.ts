export type EffectType = 'snowflakes' | 'balloons';

export interface SnowflakeParticle {
  id: string;
  x: number;
  y: number;
  size: number; // medium size 12px to 24px
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  driftMultiplier: number; // For organic side-to-side movement
  createdAt: number;
}

export interface BalloonParticle {
  id: string;
  x: number;
  y: number;
  width: number; // medium width ~28px to 45px
  height: number; // medium height ~36px to 58px
  speedY: number;
  color: string; // Hex color
  swingSpeed: number; // organic sway
  swingWidth: number;
  swingPhase: number;
  opacity: number;
  stringLength: number;
  createdAt: number;
}

export interface SimulationConfig {
  speed: 'slow' | 'medium' | 'fast';
  density: 'light' | 'standard' | 'dense';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  category: 'system' | 'snowflakes' | 'balloons';
}
