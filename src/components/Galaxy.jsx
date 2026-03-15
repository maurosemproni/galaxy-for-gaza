import { useEffect, useRef, useState } from "react";
import { drawHUD } from "../utils/drawHud";
import InfoPanel from "./InfoPanel";

export default function Galaxy({ starCount = 18457, csvData = [] }) {
  const canvasRef = useRef(null);
  const [fallenCount, setFallenCount] = useState(0);
  const [firstFallTime, setFirstFallTime] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth || 800;
      canvas.height = window.innerHeight || 600;
    };

    resize();
    window.addEventListener("resize", resize);

    const dataList = csvData.length > 0 ? csvData : Array.from({ length: starCount }).map((_, i) => ({
      nome: `UTENTE_${String(i + 1).padStart(4, '0')}`,
      eta: Math.floor(Math.random() * 60) + 18
    }));

    const biasRandom = (power) => Math.pow(Math.random(), power);

    const numArms = 4;
    const spiralTwist = 4;
    const clumpingFactor = 0.18;

    const stars = Array.from({ length: starCount }).map((_, index) => {
      const depth = biasRandom(2); 
      const radius = biasRandom(1.5); 
      const armOffset = (Math.random() * numArms | 0) * (2 * Math.PI / numArms);
      const baseAngle = Math.random() * 0.2 - 0.1;
      const spiralAngle = baseAngle + armOffset + radius * spiralTwist; 

      const noise = () => (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3 * clumpingFactor;
      
      const colors = ["#ffffff", "#ffe0b2", "#b3e5fc", "#ffcc80"];

      return {
        id: index,
        radius,
        baseAngle: spiralAngle, 
        depth,
        size: depth * 2.5 + 0.3, 
        baseOpacity: depth * 0.8 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
        offsetX: noise(),
        offsetY: noise(),
        activationTime: null, 
        personData: null,     
        isFalling: false,
        isDead: false,
        fallStartTime: 0,
        fallX: 0,
        fallY: 0,
        fallVX: 0,
        fallVY: 0
      };
    });

    let availableStarIndices = stars.map(s => s.id).sort(() => Math.random() - 0.5);
    let dataIndex = 0; 
    let lastActivationTime = 0;
    const initTime = Date.now();

    function draw() {
      ctx.globalCompositeOperation = "source-over"; 
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      const time = Date.now();
      const elapsedTotal = time - initTime;
      
      const globalZoom = 1 + elapsedTotal * 0.0000001; 
      const maxRadius = Math.max(1, Math.min(canvas.width, canvas.height) * 0.8) * globalZoom;

      ctx.globalCompositeOperation = "lighter"; 
      const haloGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.5);
      haloGradient.addColorStop(0, "rgba(255, 215, 150, 0.25)");
      haloGradient.addColorStop(0.2, "rgba(255, 180, 100, 0.15)");
      haloGradient.addColorStop(0.4, "rgba(100, 50, 150, 0.08)");
      haloGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = haloGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rotationSpeed = 0.00003; 

      if (time - lastActivationTime > 1000 && availableStarIndices.length > 0 && dataIndex < dataList.length) {
        const starIndex = availableStarIndices.pop(); 
        stars[starIndex].activationTime = time;       
        stars[starIndex].personData = dataList[dataIndex]; 
        dataIndex++;
        lastActivationTime = time;
      }

      const activeHUDs = [];

      stars.forEach((star) => {
        if (star.isDead) return;

        // Gestione Caduta
        if (star.isFalling) {
          const fallElapsed = time - star.fallStartTime;
          const fallDuration = 2500; // Allungato a 2.5 secondi per un addio più lento
          
          if (fallElapsed > fallDuration) {
            star.isDead = true;
            return;
          }

          // Aggiornamento posizione
          star.fallX += star.fallVX;
          star.fallY += star.fallVY;
          
          // Accelerazione leggerissima, quasi un drift naturale (da 1.06 a 1.015)
          star.fallVX *= 1.015;
          star.fallVY *= 1.015;

          const progress = fallElapsed / fallDuration;
          
          // Dissolvenza lineare: inizia a sfumare fin dal primo istante
          const fadeOut = 1 - progress; 

          ctx.globalAlpha = fadeOut;
          
          // La stella perde corpo (si rimpicciolisce dolcemente verso lo zero)
          const currentSize = Math.max(0.1, star.size * (1 - progress));

          // Disegno la scia evanescente
          ctx.beginPath();
          // La scia è un po' più lunga (* 6) per dare il senso del movimento fluido
          ctx.moveTo(star.fallX - star.fallVX * 6, star.fallY - star.fallVY * 6);
          ctx.lineTo(star.fallX, star.fallY);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = currentSize; 
          ctx.lineCap = "round";
          ctx.stroke();

          // Disegno il nucleo della stella che si spegne
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(star.fallX, star.fallY, currentSize, 0, Math.PI * 2);
          ctx.fill();

          return; 
        }

        // Posizionamento normale
        const currentAngle = star.baseAngle + time * rotationSpeed;
        const x = star.radius * Math.cos(currentAngle) + star.offsetX;
        const y = star.radius * Math.sin(currentAngle) * 0.4 + star.offsetY;

        const screenX = cx + x * maxRadius;
        const screenY = cy + y * maxRadius;

        if (!star.activationTime && (screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height)) return;

        let twinkle = 0.6 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.4;
        let starSize = star.size;
        let starAlpha = star.baseOpacity * twinkle;

        let hudOpacity = 0;
        
        if (star.activationTime) {
          const timeActive = time - star.activationTime;
          const displayDuration = 3000; 

          if (timeActive < displayDuration) {
            if (timeActive < 300) hudOpacity = timeActive / 300;
            else if (timeActive > displayDuration - 500) hudOpacity = (displayDuration - timeActive) / 500;
            else hudOpacity = 1;

            starSize = star.size * 2 + 1;
            starAlpha = 1; 
          } else {
            star.isFalling = true; 
            star.fallStartTime = time;

            // Aggiorniamo i contatori per l'InfoPanel ---
            setFallenCount(prevCount => {
              if (prevCount === 0) setFirstFallTime(time); // Registriamo l'ora della prima caduta
              return prevCount + 1;
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

      // Disegno HUD usando la funzione importata
      ctx.globalCompositeOperation = "source-over"; 
      activeHUDs.forEach(hud => {
        drawHUD(ctx, hud.x, hud.y, hud.data, hud.opacity);
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount, csvData]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 0
        }} 
      />
      {/* Aggiungiamo il nostro pannello informativo in sovrimpressione */}
      <InfoPanel 
        totalStars={starCount} 
        fallenCount={fallenCount} 
        firstFallTime={firstFallTime} 
      />
    </>
  );
}