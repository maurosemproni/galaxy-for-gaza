import { useEffect, useRef } from "react";

export default function Galaxy({ starCount = 18457, csvData = [] }) {
  const canvasRef = useRef(null);

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
      nome: `UTENTE_${String(i + 1).padStart(4, '0')}`, // Formattato stile tech
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
        isFalling: false      
      };
    });

    let availableStarIndices = stars.map(s => s.id).sort(() => Math.random() - 0.5);
    let dataIndex = 0; 
    let lastActivationTime = 0;

    // ---- NUOVO DESIGN HUD MINIMAL TECH ----
    function drawHUD(ctx, x, y, data, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      const boxX = x + 25;
      const boxY = y - 35;
      const boxW = 140;
      const boxH = 46;

      // 1. Linea di puntamento (connessione rigida)
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15, y - 15);
      ctx.lineTo(boxX, y - 15);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Ciano tech
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Sfondo HUD (Nero quasi solido, spigoli vivi)
      ctx.fillStyle = "rgba(5, 5, 8, 0.9)";
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // 3. Bordi e accenti grafici
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      
      // Accento laterale più spesso
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillRect(boxX, boxY, 2, boxH);

      // 4. Tipografia rigorosa (Monospace)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px 'Courier New', Courier, monospace";
      ctx.fillText(data.nome.toUpperCase(), boxX + 12, boxY + 18);

      // Riga separatrice sottile
      ctx.beginPath();
      ctx.moveTo(boxX + 12, boxY + 26);
      ctx.lineTo(boxX + boxW - 12, boxY + 26);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "11px 'Courier New', Courier, monospace";
      ctx.fillText(`AGE: ${data.eta}`, boxX + 12, boxY + 40);

      ctx.restore();
    }


    function draw() {
      // Sfondo
      ctx.globalCompositeOperation = "source-over"; 
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.max(1, Math.min(canvas.width, canvas.height) * 0.8);

      // Alone galattico
      ctx.globalCompositeOperation = "lighter"; 
      const haloGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.5);
      haloGradient.addColorStop(0, "rgba(255, 215, 150, 0.25)");
      haloGradient.addColorStop(0.2, "rgba(255, 180, 100, 0.15)");
      haloGradient.addColorStop(0.4, "rgba(100, 50, 150, 0.08)");
      haloGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = haloGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();
      const rotationSpeed = 0.00003; 

      if (time - lastActivationTime > 1000 && availableStarIndices.length > 0 && dataIndex < dataList.length) {
        const starIndex = availableStarIndices.pop(); 
        stars[starIndex].activationTime = time;       
        stars[starIndex].personData = dataList[dataIndex]; 
        dataIndex++;
        lastActivationTime = time;
      }

      // --- ARRAY TEMPORANEO PER GLI HUD ---
      // Salviamo qui gli HUD da disegnare, per disegnarli DOPO le stelle
      const activeHUDs = [];

      stars.forEach((star) => {
        if (star.isFalling) return;

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
            return; 
          }
        }

        // 1. Disegno la stella (in modalità "lighter")
        ctx.globalAlpha = starAlpha;
        ctx.fillStyle = star.color;
        ctx.fillRect(screenX, screenY, starSize, starSize);

        // Se l'HUD è attivo, lo metto "in coda" per disegnarlo dopo
        if (hudOpacity > 0 && star.personData) {
          activeHUDs.push({ x: screenX, y: screenY, data: star.personData, opacity: hudOpacity });
        }
      });

      // --- 2. DISEGNO GLI HUD SOPRA A TUTTO ---
      // Riporto il canvas alla modalità normale prima di disegnare i box
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
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
      }} 
    />
  );
}