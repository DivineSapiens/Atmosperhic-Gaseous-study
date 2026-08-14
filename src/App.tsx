/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Snowflake, 
  Clock, 
  Settings, 
  Terminal, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Sliders,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  SnowflakeParticle, 
  BalloonParticle, 
  SimulationConfig, 
  ActivityLog 
} from './types';

// Custom, hand-crafted vector Balloon icon to guarantee version compatibility
const BalloonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2C8.2 2 5.5 5 5.5 9.5c0 4 2.5 7 6.5 8.5 4-1.5 6.5-4.5 6.5-8.5C18.5 5 15.8 2 12 2z" />
    <path d="M12 18l-2 2.5h4z" fill="currentColor" />
    <path d="M12 20.5c-1 1 1 2 0 3" />
  </svg>
);

export default function App() {
  // Configuration for the simulation
  const [config, setConfig] = useState<SimulationConfig>({
    speed: 'medium',
    density: 'standard'
  });

  // State timers for visual progression bars (in milliseconds remaining)
  const [snowflakeTimeLeft, setSnowflakeTimeLeft] = useState<number>(0);
  const [balloonTimeLeft, setBalloonTimeLeft] = useState<number>(0);

  // Lists of particles for UI counter state
  const [snowflakeCount, setSnowflakeCount] = useState<number>(0);
  const [balloonCount, setBalloonCount] = useState<number>(0);

  // Logs to give the app its highly professional, integrated "Console" aesthetic
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      message: 'Aether Calibration Complete. System initialized.',
      category: 'system'
    }
  ]);

  // Floating system values to enrich the presentation deck visual rhythm
  const [simulatedWind, setSimulatedWind] = useState<string>('0.5 m/s E');
  const [frameRate, setFrameRate] = useState<number>(60);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Refs for tracking animation variables smoothly without React trigger lag
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<SnowflakeParticle[]>([]);
  const balloonsRef = useRef<BalloonParticle[]>([]);

  // Trigger timestamps
  const snowflakeStartTimeRef = useRef<number>(0);
  const balloonStartTimeRef = useRef<number>(0);

  // References for logging logs without breaking state dependency arrays
  const logCounterRef = useRef<number>(1);

  // 1. Clock and Simulated Metrics Update Effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      
      // Jitter wind values slightly for realistic sensor fluctuation
      if (Math.random() < 0.2) {
        const speed = (0.2 + Math.random() * 0.9).toFixed(1);
        const direction = ['N', 'NE', 'ENE', 'E', 'ESE', 'SSE', 'CALM'][Math.floor(Math.random() * 7)];
        setSimulatedWind(`${speed} m/s ${direction}`);
      }
    }, 1000);

    setCurrentTime(new Date().toLocaleTimeString());
    return () => clearInterval(timer);
  }, []);

  // 2. Helper to output logs to our corporate terminal log list
  const addLog = (message: string, category: 'system' | 'snowflakes' | 'balloons') => {
    const timestamp = new Date().toLocaleTimeString();
    const id = `${Date.now()}-${logCounterRef.current++}`;
    setLogs(prev => [
      { id, timestamp, message, category },
      ...prev.slice(0, 24) // Hold last 25 operations to preserve memory
    ]);
  };

  // 3. Effect triggers
  const triggerSnowflakes = () => {
    const now = Date.now();
    snowflakeStartTimeRef.current = now;
    setSnowflakeTimeLeft(5000);
    addLog('Emitting medium-sized crystal snowflakes. Active for 5.0 seconds.', 'snowflakes');
  };

  const triggerBalloons = () => {
    const now = Date.now();
    balloonStartTimeRef.current = now;
    setBalloonTimeLeft(5000);
    addLog('Releasing celebratory medium helium balloons. Float active for 5.0 seconds.', 'balloons');
  };

  const resetAllEffects = () => {
    snowflakeStartTimeRef.current = 0;
    balloonStartTimeRef.current = 0;
    setSnowflakeTimeLeft(0);
    setBalloonTimeLeft(0);
    snowflakesRef.current = [];
    balloonsRef.current = [];
    setSnowflakeCount(0);
    setBalloonCount(0);
    addLog('All active atmospheric templates terminated and cleared.', 'system');
  };

  // 4. Primary Animation and Canvas Control Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = lastTime;

    // Canvas sizing setup
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Spawn parameters based on Speed & Density
    const getSpeedFactor = () => {
      switch (config.speed) {
        case 'slow': return 0.5;
        case 'fast': return 2.0;
        default: return 1.2;
      }
    };

    const getDensityChance = (type: 'snow' | 'balloon') => {
      if (type === 'snow') {
        switch (config.density) {
          case 'light': return 0.12;
          case 'dense': return 0.65;
          default: return 0.35;
        }
      } else {
        switch (config.density) {
          case 'light': return 0.03;
          case 'dense': return 0.14;
          default: return 0.07;
        }
      }
    };

    const loop = (time: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = Date.now();
      const deltaTime = time - lastTime;
      lastTime = time;

      // Calculate real hardware fps
      frameCount++;
      if (time - fpsTimer >= 1000) {
        setFrameRate(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      // Clear full canvas transparently
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- CRITICAL TIMER COMPUTATION ---
      const activeSnowTime = snowflakeStartTimeRef.current > 0 ? now - snowflakeStartTimeRef.current : 0;
      const activeBalloonTime = balloonStartTimeRef.current > 0 ? now - balloonStartTimeRef.current : 0;

      // Update snowflake react timers
      if (snowflakeStartTimeRef.current > 0) {
        const remaining = Math.max(0, 5000 - activeSnowTime);
        setSnowflakeTimeLeft(remaining);
        if (remaining === 0) {
          snowflakeStartTimeRef.current = 0;
        }
      }

      // Update balloon react timers
      if (balloonStartTimeRef.current > 0) {
        const remaining = Math.max(0, 5000 - activeBalloonTime);
        setBalloonTimeLeft(remaining);
        if (remaining === 0) {
          balloonStartTimeRef.current = 0;
        }
      }

      // --- SPAWNING CORES ---
      // Snowflakes Spawning (only while emitter window is active < 5s)
      if (snowflakeStartTimeRef.current > 0 && activeSnowTime < 5000) {
        if (Math.random() < getDensityChance('snow')) {
          // Medium size snowflake: 12px to 24px wide
          const size = 11 + Math.random() * 11;
          const speedFactor = getSpeedFactor();
          snowflakesRef.current.push({
            id: Math.random().toString(36).substring(2, 9),
            x: Math.random() * canvas.width,
            y: -30,
            size,
            speedX: (Math.random() - 0.5) * 0.8 * speedFactor,
            speedY: (1.2 + Math.random() * 1.5) * speedFactor,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03 * speedFactor,
            opacity: 0.75 + Math.random() * 0.25,
            driftMultiplier: 0.6 + Math.random() * 1.2,
            createdAt: now
          });
        }
      }

      // Balloons Spawning (only while emitter window is active < 5s)
      if (balloonStartTimeRef.current > 0 && activeBalloonTime < 5000) {
        if (Math.random() < getDensityChance('balloon')) {
          // Medium size balloon: width 28px to 42px, height proportional
          const width = 28 + Math.random() * 14;
          const height = width * (1.20 + Math.random() * 0.15);
          const speedFactor = getSpeedFactor();
          
          const balloonColors = [
            '#ef4444', // Warm Crimson
            '#3b82f6', // Sapphire Blue
            '#10b981', // Forest Emerald
            '#f59e0b', // Harvest Amber
            '#8b5cf6', // Imperial Violet
            '#ec4899', // Velvet Magenta
          ];
          const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];

          balloonsRef.current.push({
            id: Math.random().toString(36).substring(2, 9),
            x: Math.random() * canvas.width,
            y: canvas.height + height + 20,
            width,
            height,
            speedY: (-1.1 - Math.random() * 1.2) * speedFactor,
            color,
            swingSpeed: 0.015 + Math.random() * 0.02,
            swingWidth: 12 + Math.random() * 18,
            swingPhase: Math.random() * Math.PI * 2,
            opacity: 0.85 + Math.random() * 0.15,
            stringLength: 35 + Math.random() * 25,
            createdAt: now
          });
        }
      }

      // --- RENDERING INTEGRITY ---
      
      // Update & Draw Snowflakes
      snowflakesRef.current = snowflakesRef.current.filter(p => {
        // Drift and fall updates
        p.y += p.speedY;
        // Apply wind-sway formula based on system runtime
        p.x += p.speedX + Math.sin((p.driftMultiplier * (now / 1000)) + p.id.charCodeAt(0)) * 0.4;
        p.rotation += p.rotationSpeed;

        // Determine fade out factor
        // Emitter lets users enjoy snowflakes; once 5s cycle finishes, particles elegantly fade
        let fadeOutScale = 1.0;
        
        // Let's implement absolute 5-second exit criteria.
        // For snowflakes spawned, if the total time since trigger > 4000ms, start a linear fade so they hit exact 0 at 5000ms.
        if (snowflakeStartTimeRef.current > 0) {
          if (activeSnowTime > 4000) {
            fadeOutScale = Math.max(0, 1.0 - (activeSnowTime - 4000) / 1000);
          }
        } else {
          // If trigger has reset, gracefully fade out any residual particles over 1 second of their remaining life
          const age = now - p.createdAt;
          if (age > 4000) {
            fadeOutScale = Math.max(0, 1.0 - (age - 4000) / 1000);
          }
        }

        const currentOpacity = p.opacity * fadeOutScale;
        
        // Remove if off screen bottom/sides or completely faded out
        if (p.y > canvas.height + 40 || p.x < -40 || p.x > canvas.width + 40 || currentOpacity <= 0) {
          return false;
        }

        // Draw structural 6-pointed star snowflake crystal with high precision
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Ice-blue crystalline glow profile
        ctx.strokeStyle = `rgba(186, 230, 253, ${currentOpacity})`;
        ctx.lineWidth = Math.max(1, p.size * 0.08);
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 4;

        // Generates pristine, custom geometric crystal arms
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -p.size / 2);
          ctx.stroke();

          // Sub-boughs (little branches)
          const twigSize = p.size * 0.16;
          
          // Outer spurs
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.35);
          ctx.lineTo(-twigSize, -p.size * 0.35 - twigSize);
          ctx.moveTo(0, -p.size * 0.35);
          ctx.lineTo(twigSize, -p.size * 0.35 - twigSize);
          ctx.stroke();

          // Inner spurs
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.18);
          ctx.lineTo(-twigSize * 0.7, -p.size * 0.18 - twigSize * 0.7);
          ctx.moveTo(0, -p.size * 0.18);
          ctx.lineTo(twigSize * 0.7, -p.size * 0.18 - twigSize * 0.7);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      });

      // Update & Draw Balloons
      balloonsRef.current = balloonsRef.current.filter(p => {
        // Rise and sway update
        p.y += p.speedY;
        // Sway oscillating back-and-forth using string ID to keep sway organic
        p.x += Math.sin((p.swingSpeed * (now / 1000)) + p.swingPhase) * 0.4;

        // Linear fade factor to complete 5.0 seconds cutoff
        let fadeOutScale = 1.0;
        if (balloonStartTimeRef.current > 0) {
          if (activeBalloonTime > 4000) {
            fadeOutScale = Math.max(0, 1.0 - (activeBalloonTime - 4000) / 1000);
          }
        } else {
          const age = now - p.createdAt;
          if (age > 4000) {
            fadeOutScale = Math.max(0, 1.0 - (age - 4000) / 1000);
          }
        }

        const currentOpacity = p.opacity * fadeOutScale;

        // Remove if off screen top/sides or fully transparent
        if (p.y < -p.height - p.stringLength - 20 || p.x < -100 || p.x > canvas.width + 100 || currentOpacity <= 0) {
          return false;
        }

        // Draw beautiful 3D-shaded oval balloon with dangling rope
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = currentOpacity;

        // 1. Draw balloon rope string (curved spline)
        ctx.beginPath();
        ctx.moveTo(0, p.height / 2 + 5);
        ctx.bezierCurveTo(
          -5, p.height / 2 + 15,
          5, p.height / 2 + 30,
          0, p.height / 2 + p.stringLength
        );
        ctx.strokeStyle = `rgba(164, 180, 203, 0.55)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Draw balloon teardrop body
        ctx.beginPath();
        ctx.moveTo(0, p.height / 2); // Knot intersection base
        // Curved boundaries wider at top, tapered on bottom
        ctx.bezierCurveTo(-p.width * 0.65, p.height * 0.45, -p.width * 0.65, -p.height * 0.5, 0, -p.height * 0.5);
        ctx.bezierCurveTo(p.width * 0.65, -p.height * 0.5, p.width * 0.65, p.height * 0.45, 0, p.height / 2);
        
        // Solid fill with rich gradient backing to deliver depth
        const grad = ctx.createRadialGradient(-p.width * 0.15, -p.height * 0.15, p.width * 0.1, 0, 0, p.width);
        grad.addColorStop(0, '#ffffff'); // Center shine origin
        grad.addColorStop(0.12, p.color);
        grad.addColorStop(1, adjustColorBrightness(p.color, -35)); // Deeper border color
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. Draw bottom rubber knot (little triangle)
        ctx.beginPath();
        ctx.moveTo(0, p.height / 2);
        ctx.lineTo(-4.5, p.height / 2 + 5.5);
        ctx.lineTo(4.5, p.height / 2 + 5.5);
        ctx.closePath();
        ctx.fillStyle = adjustColorBrightness(p.color, -20);
        ctx.fill();

        // 4. Draw realistic gloss sheen highlight (soft white curvature overlay)
        ctx.beginPath();
        ctx.ellipse(-p.width * 0.22, -p.height * 0.2, p.width * 0.12, p.height * 0.18, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fill();

        ctx.restore();
        return true;
      });

      // Synchronize exact counts back to react states for reporting
      setSnowflakeCount(snowflakesRef.current.length);
      setBalloonCount(balloonsRef.current.length);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [config]);

  // Utility to shade hex colors for 3D grading effects
  const adjustColorBrightness = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + (R * percent / 100)));
    G = Math.max(0, Math.min(255, G + (G * percent / 100)));
    B = Math.max(0, Math.min(255, B + (B * percent / 100)));

    const rHex = Math.round(R).toString(16).padStart(2, '0');
    const gHex = Math.round(G).toString(16).padStart(2, '0');
    const bHex = Math.round(B).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  return (
    <div 
      className="relative min-h-screen flex flex-col justify-between bg-[#F8F7F4] text-[#1A1A1A] font-sans overflow-hidden selection:bg-[#E2D1C3]" 
      id="app-root-container"
    >
      {/* Editorial Decorative Grids */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #1A1A1A 1px, transparent 1px),
            linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
        id="grid-decoration"
      />

      {/* Actual Simulation Canvas - Full Screen Overlay with perfect transparency */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-40 animate-fade-in"
        style={{ width: '100%', height: '100%' }}
        id="atmospheric-canvas"
      />

      {/* --- EDITORIAL HEADER --- */}
      <header className="w-full z-15 p-8 md:p-12 pb-6 border-b border-[#1A1A1A]/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6" id="console-header">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#1A1A1A]/50">
            Interactive Physics Monograph / Issue 02
          </p>
          <h1 className="text-4xl md:text-5xl tracking-tight leading-none font-serif text-[#1A1A1A]" id="studio-main-title">
            Atmospheric <br />& Gaseous Kinetics
          </h1>
        </div>
        
        <div className="text-left md:text-right max-w-sm space-y-3" id="metadata-bar">
          <p className="text-xs md:text-sm italic text-[#555] leading-relaxed font-serif">
            A formal visual monograph exploring the contrasting kinematic behavior of descending crystalline structures and ascending helium-filled latex vessels within viewport constraints.
          </p>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-[10px] font-mono tracking-wider text-[#1A1A1A]/60 justify-start md:justify-end">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              {currentTime || '00:00:00 PM'}
            </span>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 opacity-60" />
              FPS: {frameRate}
            </span>
          </div>
        </div>
      </header>

      {/* --- PRINCIPAL TWO-COLUMN GRAPH SHEET --- */}
      <main className="flex-1 w-full z-10 flex flex-col lg:flex-row items-stretch" id="main-content-layout">
        
        {/* LEFT COMPARTMENT: MONOGRAPH CONTROL STATION (1/3 Width) */}
        <section className="lg:w-1/3 p-8 md:p-12 flex flex-col justify-between gap-12 border-b lg:border-b-0 lg:border-r border-[#1A1A1A]/10 bg-[#F5F4EF]/40" id="left-effect-station">
          <div className="space-y-8">
            
            {/* Abstract introduction statement */}
            <div>
              <h2 className="text-[11px] uppercase tracking-widest font-sans font-bold mb-3.5 text-[#1A1A1A]/80">
                Scientific Abstract
              </h2>
              <p className="font-sans text-xs md:text-[13px] leading-relaxed text-[#444]">
                This interactive interface triggers procedurally-modeled particle simulations to render vector physics directly. Select a structural module study below to initiate a five-second kinetic stream.
              </p>
            </div>

            {/* Tactile Study Triggers */}
            <div className="space-y-4" id="triggers-grid">
              
              {/* TRIGGER ALPHA: SNOWFLAKES */}
              <button
                onClick={triggerSnowflakes}
                className={`w-full group relative flex items-center justify-between p-6 overflow-hidden border border-[#1A1A1A] transition-all duration-300 cursor-pointer ${
                  snowflakeTimeLeft > 0 
                    ? 'bg-[#1A1A1A] text-white shadow-md' 
                    : 'bg-[#1A1A1A] text-white hover:bg-neutral-800 hover:shadow-sm'
                }`}
                id="snowflakes-trigger-btn"
              >
                <div className="z-10 text-left">
                  <span className="block text-[9px] uppercase tracking-widest opacity-60 mb-1 font-sans">Simulation Alpha</span>
                  <span className="block text-lg font-serif tracking-wide">Snowflakes</span>
                </div>
                <div className="z-10 text-2xl flex items-center gap-2">
                  {snowflakeTimeLeft > 0 ? (
                    <span className="text-[10px] font-mono tracking-widest text-[#E2D1C3] bg-white/10 px-1.5 py-0.5 rounded-sm">
                      {(snowflakeTimeLeft / 1000).toFixed(1)}s
                    </span>
                  ) : null}
                  <span className="group-hover:rotate-90 transition-transform duration-700">❄</span>
                </div>
                {/* Visual elegant linear loading indicator for editorial style */}
                {snowflakeTimeLeft > 0 && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-[#E2D1C3] transition-all duration-75"
                    style={{ width: `${(snowflakeTimeLeft / 5000) * 100}%` }}
                  />
                )}
              </button>

              {/* TRIGGER BETA: BALLOONS */}
              <button
                onClick={triggerBalloons}
                className={`w-full group relative flex items-center justify-between p-6 border overflow-hidden transition-all duration-300 cursor-pointer ${
                  balloonTimeLeft > 0 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                    : 'border-[#1A1A1A] text-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A] hover:text-white'
                }`}
                id="balloons-trigger-btn"
              >
                <div className="z-10 text-left">
                  <span className="block text-[9px] uppercase tracking-widest opacity-60 mb-1 font-sans">Simulation Beta</span>
                  <span className="block text-lg font-serif tracking-wide">Balloons</span>
                </div>
                <div className="z-10 text-2xl flex items-center gap-2">
                  {balloonTimeLeft > 0 ? (
                    <span className="text-[10px] font-mono tracking-widest text-[#E2D1C3] bg-white/10 px-1.5 py-0.5 rounded-sm">
                      {(balloonTimeLeft / 1000).toFixed(1)}s
                    </span>
                  ) : null}
                  <span className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-500">🎈</span>
                </div>
                {/* Visual elegant linear loading indicator for editorial style */}
                {balloonTimeLeft > 0 && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-[#E2D1C3] transition-all duration-75"
                    style={{ width: `${(balloonTimeLeft / 5000) * 100}%` }}
                  />
                )}
              </button>

              {/* FLUSH AND TERMINATE ACTION */}
              <button 
                onClick={resetAllEffects} 
                className="w-full inline-flex items-center justify-center gap-2 py-3 border border-dashed border-[#1A1A1A]/30 text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 active:bg-[#1A1A1A]/10 transition-colors cursor-pointer"
                id="reset-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Flush Active Renderings
              </button>
            </div>

            {/* VALVE CALIBRATIONS SHELF */}
            <div className="space-y-6 pt-8 border-t border-[#1A1A1A]/10" id="calibration-section">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1A1A1A]/60" />
                <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/80">Calibration Valves</h3>
              </div>

              {/* FLOW VELOCITY */}
              <div className="space-y-2" id="speed-set-group">
                <div className="flex justify-between text-[11px] font-mono text-[#555]">
                  <span>Velocity Profile</span>
                  <span className="uppercase text-[#1A1A1A] font-medium">{config.speed}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#1A1A1A]/5 p-1 rounded-sm border border-[#1A1A1A]/10">
                  {(['slow', 'medium', 'fast'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, speed: opt }));
                        addLog(`Modified velocity profile to ${opt.toUpperCase()}`, 'system');
                      }}
                      className={`py-1 text-[9px] font-bold tracking-wider uppercase rounded-xs transition-colors cursor-pointer ${
                        config.speed === opt 
                        ? 'bg-[#1A1A1A] text-white' 
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                      }`}
                      id={`velocity-${opt}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* DENSITY SELECTION */}
              <div className="space-y-2" id="density-set-group">
                <div className="flex justify-between text-[11px] font-mono text-[#555]">
                  <span>Particle Density</span>
                  <span className="uppercase text-[#1A1A1A] font-medium">{config.density}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#1A1A1A]/5 p-1 rounded-sm border border-[#1A1A1A]/10">
                  {(['light', 'standard', 'dense'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, density: opt }));
                        addLog(`Modified stream density to ${opt.toUpperCase()}`, 'system');
                      }}
                      className={`py-1 text-[9px] font-bold tracking-wider uppercase rounded-xs transition-colors cursor-pointer ${
                        config.density === opt 
                        ? 'bg-[#1A1A1A] text-white' 
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                      }`}
                      id={`density-${opt}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="pt-8 border-t border-[#1A1A1A]/10 flex justify-between items-center text-[9px] font-mono text-[#1A1A1A]/40 uppercase tracking-widest">
            <span>Model: EST-45</span>
            <span>Loc: Observatory-01</span>
          </div>
        </section>

        {/* RIGHT COMPARTMENT: INTERACTIVE METRIC VIEWPORT & LEDGER CONSOLE */}
        <section className="flex-1 flex flex-col justify-between bg-white overflow-hidden" id="right-view-station">
          
          {/* INTERACTIVE MONITOR PLATFORM ZONE */}
          <div className="flex-1 min-h-[420px] p-8 md:p-12 relative flex items-center justify-center border-b border-[#1A1A1A]/10 bg-white" id="telemetry-card">
            
            {/* Elegant vertical sidebar monitor plate */}
            <div className="absolute top-12 right-12 text-[10px] font-mono uppercase tracking-[0.25em] text-[#1A1A1A]/40 [writing-mode:vertical-rl] select-none">
              Experimental Monitoring Plate
            </div>

            {/* Subdued Viewport Blueprint watermark */}
            <div className="w-full h-full border border-[#1A1A1A]/5 rounded-sm flex flex-col items-center justify-center relative bg-[#FBFBFA]/40 overflow-hidden">
              <div className="text-center opacity-[0.035] select-none pointer-events-none">
                <div className="text-[120px] md:text-[180px] font-extrabold font-sans leading-none tracking-tight">VIEW</div>
                <div className="text-[30px] md:text-[45px] tracking-[0.8em] font-sans -mt-4">PORT</div>
              </div>

              {/* Live Vector Crosshairs */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-[#1A1A1A]/10 to-transparent pointer-events-none" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/10 to-transparent pointer-events-none" />

              {/* Status Indicator over watermarked view */}
              <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center gap-1">
                <p id="status-indicator" className="text-xs font-mono tracking-[0.2em] uppercase text-[#1A1A1A]/70 font-semibold bg-[#F5F4EF] border border-[#1A1A1A]/10 px-4 py-1.5 shadow-xs">
                  {snowflakeTimeLeft > 0 && balloonTimeLeft > 0 ? (
                    'Active / Compound Flow Model'
                  ) : snowflakeTimeLeft > 0 ? (
                    'Active / Decelerating Crystalline descent'
                  ) : balloonTimeLeft > 0 ? (
                    'Active / Buoyant helium ascent'
                  ) : (
                    'Idle / System Ready'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* DUAL DATA METRICS LEDGER & ACTIVE PROCESS LOGGER */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#1A1A1A]/10 border-t border-[#1A1A1A]/5 bg-[#F5F4EF]/30" id="data-dials-ledger">
            
            {/* Live Metrics Column (5 Columns) */}
            <div className="md:col-span-5 p-8 flex flex-col justify-between gap-6" id="telemetry-values">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-[#1A1A1A]/80 uppercase tracking-widest font-sans">Active Stream Metrics</h4>
                <p className="text-[11px] text-[#666]">Real-time particle diagnostic inventory</p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3 bg-white/65 border border-[#1A1A1A]/5 flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Crystals</span>
                  <span className="text-lg font-bold text-[#1A1A1A]">{snowflakeCount}</span>
                </div>
                <div className="p-3 bg-white/65 border border-[#1A1A1A]/5 flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Latex Vessels</span>
                  <span className="text-lg font-bold text-[#1A1A1A]">{balloonCount}</span>
                </div>
                <div className="p-3 bg-white/65 border border-[#1A1A1A]/5 flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Drift Vector</span>
                  <span className="text-[11px] font-bold text-[#1A1A1A] truncate">{simulatedWind}</span>
                </div>
                <div className="p-3 bg-white/65 border border-[#1A1A1A]/5 flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Scale Profile</span>
                  <span className="text-[11px] font-bold text-[#1A1A1A]">Medium</span>
                </div>
              </div>
            </div>

            {/* Scientific Log Ledger (7 Columns) */}
            <div className="md:col-span-7 p-8 flex flex-col justify-between gap-4 bg-white/40" id="logs-card">
              <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#1A1A1A]/50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/80">Kinetic Process output ledger</span>
                </div>
                <button 
                  onClick={() => setLogs([{ id: 'clear', timestamp: new Date().toLocaleTimeString(), message: 'Observational ledger flushed.', category: 'system' }])}
                  className="text-[9px] font-mono tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-all bg-[#1A1A1A]/5 px-2 py-0.5 border border-[#1A1A1A]/10 uppercase rounded-xs cursor-pointer"
                  id="flush-logs-btn"
                >
                  Clear Ledger
                </button>
              </div>

              {/* Feed window */}
              <div 
                className="h-[135px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin select-none pr-2"
                id="terminal-output-feed"
              >
                {logs.map(log => (
                  <div key={log.id} className="flex gap-2 items-start" id={`log-${log.id}`}>
                    <span className="text-[#1A1A1A]/40 whitespace-nowrap">[{log.timestamp}]</span>
                    <span className={`
                      ${log.category === 'snowflakes' ? 'text-blue-800 font-medium' : ''}
                      ${log.category === 'balloons' ? 'text-red-800 font-medium' : ''}
                      ${log.category === 'system' ? 'text-emerald-800' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* --- EDITORIAL FOOTER PLATE --- */}
      <footer className="w-full z-15 p-6 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row justify-between items-center text-[9px] font-mono uppercase tracking-[0.25em] text-[#1A1A1A]/50 bg-[#F5F4EF]/70 gap-3" id="app-footer">
        <div>
          © 2026 Formal Studies Collective
        </div>
        <div>
          Lat: 40.7128° N | Lon: 74.0060° W
        </div>
        <div>
          Protocol: 01-EST-AA
        </div>
      </footer>
    </div>
  );
}
