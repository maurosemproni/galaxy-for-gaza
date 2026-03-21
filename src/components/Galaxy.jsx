// src/components/Galaxy.jsx
import { useEffect, useRef, useState } from "react";
import { GALAXY_CONFIG } from "../config/galaxyConfig";
import { createGalaxyStars } from "../utils/starFactory";
import { drawHUDLine, drawHUDBody } from "../utils/drawHud";
import InfoPanel from "./InfoPanel";

export default function Galaxy({ csvData = [] }) {
  const canvasRef = useRef(null);
  
  const [fallenCount, setFallenCount] = useState(0);
  const [firstFallTime, setFirstFallTime] = useState(null);

  const starsRef = useRef([]);
  const availableIndicesRef = useRef([]);

  useEffect(() => {
    starsRef.current = createGalaxyStars();
    availableIndicesRef.current = starsRef.current.map(s => s.id).sort(() => Math.random() - 0.5);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let dataIndex = 0;
    let lastActivationTime = 0;
    const initTime = Date.now(); 

    // --- VARIABILI PER IL CONTATORE FPS ---
    let frameCount = 0;
    let lastFpsTime = Date.now();
    let currentFps = 0;
    // --------------------------------------

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    function draw() {
      const time = Date.now();
      const elapsedTotal = time - initTime; 
      const stars = starsRef.current;
      const availableIndices = availableIndicesRef.current;

      // ---- FIX 1: RIPRISTINO OPACITÀ AL 100% ----
      // Questo impedisce al nero di essere trasparente e distrugge il motion blur!
      ctx.globalAlpha = 1; 
      // ------------------------------------------

      // Sfondo pulito e perfetto
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = GALAXY_CONFIG.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const globalZoom = 1 + elapsedTotal * GALAXY_CONFIG.zoomSpeed;
      const maxRadius = Math.max(1, Math.min(canvas.width, canvas.height) * 0.8) * globalZoom;

      // Alone galattico
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.5);
      GALAXY_CONFIG.haloColors.forEach(h => halo.addColorStop(h.offset, h.color));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (time - lastActivationTime > GALAXY_CONFIG.spawnRate && availableIndices.length > 0 && dataIndex < csvData.length) {
        const idx = availableIndices.pop();
        stars[idx].activationTime = time;
        stars[idx].personData = csvData[dataIndex];
        dataIndex++;
        lastActivationTime = time;
      }

      const activeHUDs = [];

      // ---- FIX 2: MODALITÀ "LIGHTER" PER TUTTE LE STELLE ----
      // Le stelle tornano ad essere fatte di pura luce, fondendosi elegantemente
      ctx.globalCompositeOperation = "lighter"; 
      // -------------------------------------------------------

      stars.forEach(star => {
        if (star.isDead) return;

        if (star.isFalling) {
          const fallElapsed = time - star.fallStartTime;
          if (fallElapsed > GALAXY_CONFIG.fallDuration) { 
            star.isDead = true; 
            return; 
          }

          star.fallX += star.fallVX;
          star.fallY += star.fallVY;
          star.fallVX *= 1.015;
          star.fallVY *= 1.015;

          const progress = fallElapsed / GALAXY_CONFIG.fallDuration;
          const fadeOut = 1 - progress; 
          const currentSize = Math.max(0.1, star.size * (1 - progress));

          ctx.globalAlpha = fadeOut;
          
          ctx.beginPath();
          ctx.moveTo(star.fallX - star.fallVX * 6, star.fallY - star.fallVY * 6);
          ctx.lineTo(star.fallX, star.fallY);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = currentSize; 
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(star.fallX, star.fallY, currentSize, 0, Math.PI * 2);
          ctx.fill();

          return; 
        }

        const currentAngle = star.baseAngle + elapsedTotal * GALAXY_CONFIG.rotationSpeed;
        const x = star.radius * Math.cos(currentAngle) + star.offsetX;
        const y = star.radius * Math.sin(currentAngle) * GALAXY_CONFIG.galaxyIncline + star.offsetY;

        const screenX = cx + x * maxRadius;
        const screenY = cy + y * maxRadius;

        if (!star.activationTime && (screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height)) return;

        let twinkle = 0.6 + Math.sin(elapsedTotal * star.twinkleSpeed + star.twinklePhase) * 0.4;
        
        let starSize = star.size;
        let starAlpha = star.baseOpacity * twinkle;
        let hudOpacity = 0;
        
        if (star.activationTime) {
          const timeActive = time - star.activationTime;

          if (timeActive < GALAXY_CONFIG.hudDuration) {
            if (timeActive < 300) hudOpacity = timeActive / 300;
            else if (timeActive > GALAXY_CONFIG.hudDuration - 500) hudOpacity = (GALAXY_CONFIG.hudDuration - timeActive) / 500;
            else hudOpacity = 1;

            starSize = star.size * 2 + 1;
            starAlpha = 1; 
          } else {
            star.isFalling = true; 
            star.fallStartTime = time;
            
            setFallenCount(prev => {
              if (prev === 0) setFirstFallTime(time);
              return prev + 1;
            });
            
            const angleFromCenter = Math.atan2(screenY - cy, screenX - cx);
            star.fallVX = Math.cos(angleFromCenter) * 1.5;
            star.fallVY = Math.sin(angleFromCenter) * 1.5;
            star.fallX = screenX;
            star.fallY = screenY;
            return; 
          }
        }

        ctx.globalAlpha = starAlpha;
        ctx.fillStyle = star.color;
        ctx.fillRect(screenX, screenY, starSize, starSize);

        if (hudOpacity > 0 && star.personData) {
          activeHUDs.push({ x: screenX, y: screenY, data: star.personData, opacity: hudOpacity });
        }
      });

      // ---- SISTEMA ANTI-COLLISIONE HUD (A prova di bomba) ----
      const HUD_SAFE_WIDTH = 250; 
      const HUD_HEIGHT = 70;
      const HUD_PADDING = 12; // Spazio verticale tra gli HUD

      activeHUDs.forEach((hud, i) => {
        hud.boxW = HUD_SAFE_WIDTH;
        hud.boxH = HUD_HEIGHT;
        hud.boxX = hud.x + 25;
        
        // Evitiamo che l'HUD esca dal bordo destro dello schermo
        if (hud.boxX + hud.boxW > canvas.width) {
          hud.boxX = canvas.width - hud.boxW - 10;
        }

        let targetY = hud.y - 48;
        let overlapping = true;
        let iterations = 0;

        // Continua a spingerlo giù finché non trova uno spazio vuoto 
        // che non urti NESSUNO dei precedenti HUD attivi.
        while (overlapping && iterations < 10) {
          overlapping = false;
          for (let j = 0; j < i; j++) {
            let other = activeHUDs[j];
            
            // Logica di intersezione perimetrale espansa col padding
            if (
              hud.boxX < other.boxX + other.boxW + HUD_PADDING &&
              hud.boxX + hud.boxW + HUD_PADDING > other.boxX &&
              targetY < other.boxY + other.boxH + HUD_PADDING &&
              targetY + hud.boxH + HUD_PADDING > other.boxY
            ) {
              // Si sovrappone! Spingilo sotto l'altro HUD
              targetY = other.boxY + other.boxH + HUD_PADDING;
              overlapping = true; // Ricomincia il ciclo per assicurarsi che la nuova posizione sia libera
              break; 
            }
          }
          iterations++;
        }
        hud.boxY = targetY;
      });

      // ---- DISEGNO A DOPPIO PASSAGGIO (L'equivalente dello Z-INDEX) ----
      ctx.globalCompositeOperation = "source-over"; 

      // PASSAGGIO 1: Disegnamo TUTTE le linee (finiscono nello sfondo)
      activeHUDs.forEach(hud => {
        drawHUDLine(ctx, hud.x, hud.y, hud.boxX, hud.boxY, hud.opacity);
      });

      // PASSAGGIO 2: Disegnamo TUTTI i corpi neri (copriranno le linee sottostanti)
      activeHUDs.forEach(hud => {
        drawHUDBody(ctx, hud.boxX, hud.boxY, hud.data, hud.opacity);
      });

      // ---- CALCOLO E STAMPA FPS (Alla fine di tutto) ----
      frameCount++;
      if (time - lastFpsTime >= 1000) { // Aggiorna il numero ogni secondo
        currentFps = frameCount;
        frameCount = 0;
        lastFpsTime = time;
      }

      if (GALAXY_CONFIG.showFPS) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.fillStyle = currentFps > 45 ? "#00ff00" : currentFps > 25 ? "#ffff00" : "#ff4d4d"; // Verde, Giallo o Rosso
        ctx.font = "bold 14px monospace";
        ctx.fillText(`FPS: ${currentFps}`, 20, 30);
      }
      // ---------------------------------------------------

      animationFrameId = requestAnimationFrame(draw);
    }

    if (csvData.length > 0) {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [csvData]); 

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} 
      />
      <InfoPanel 
        totalStars={GALAXY_CONFIG.starCount} 
        fallenCount={fallenCount} 
        firstFallTime={firstFallTime} 
      />
    </>
  );
}