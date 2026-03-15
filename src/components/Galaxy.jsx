import { useEffect, useRef } from "react";

export default function Galaxy({ starCount = 18457 }) {
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

    const biasRandom = (power) => Math.pow(Math.random(), power);

    // ---- 1. SETUP DELLE STELLE CON BRACCI DEFINITI ----
    // Parametri per la spirale logaritmica
    const numArms = 4;             // Numero di bracci principali
    const spiralTwist = 4;         // Quanto velocemente si avvolgono (torsione)
    const clumpingFactor = 0.18;   // Deviazione standard per il raggruppamento (più basso = più definiti)

    const stars = Array.from({ length: starCount }).map(() => {
      const depth = biasRandom(2); 
      
      // Distribuzione del raggio: più stelle verso il centro
      const radius = biasRandom(1.5); 
      
      // Assegna ogni stella a un braccio specifico
      const armOffset = (Math.random() * numArms | 0) * (2 * Math.PI / numArms);
      
      // L'angolo base della stella all'interno del suo braccio
      // con una piccola variazione casuale per evitare allineamenti perfetti
      const baseAngle = Math.random() * 0.2 - 0.1;
      
      // Calcola l'angolo di torsione totale in base al raggio (Spirale Logaritmica)
      const spiralAngle = baseAngle + armOffset + radius * spiralTwist; 

      // Genera un rumore gaussiano per il raggruppamento attorno al braccio
      // Questo rende i bracci più organici e meno geometricamente perfetti
      const noise = () => (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3 * clumpingFactor;
      const noiseX = noise();
      const noiseY = noise();

      const colors = ["#ffffff", "#ffe0b2", "#b3e5fc", "#ffcc80"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        radius,
        baseAngle: spiralAngle, // Salviamo l'angolo di torsione come base
        depth,
        size: depth * 2.5 + 0.3, 
        baseOpacity: depth * 0.8 + 0.1,
        color,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
        offsetX: noiseX, // Rumore pre-calcolato per il raggruppamento
        offsetY: noiseY
      };
    });

    // ---- 2. RENDER LOOP ----
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
      
      // Colori dell'alone più tenui e realistici
      haloGradient.addColorStop(0, "rgba(255, 215, 150, 0.25)");
      haloGradient.addColorStop(0.2, "rgba(255, 180, 100, 0.15)");
      haloGradient.addColorStop(0.4, "rgba(100, 50, 150, 0.08)");
      haloGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = haloGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();
      const rotationSpeed = 0.00003; // Rotazione lenta ed elegante

      // Disegno stelle
      stars.forEach((star) => {
        // Rotazione dinamica
        const currentAngle = star.baseAngle + time * rotationSpeed;

        // Calcolo X e Y con inclinazione prospettica (* 0.4 su Y)
        const x = star.radius * Math.cos(currentAngle) + star.offsetX;
        const y = star.radius * Math.sin(currentAngle) * 0.4 + star.offsetY;

        const screenX = cx + x * maxRadius;
        const screenY = cy + y * maxRadius;

        if (screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height) return;

        // Scintillio
        const twinkle = 0.6 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.4;
        
        ctx.globalAlpha = star.baseOpacity * twinkle;
        ctx.fillStyle = star.color;
        ctx.fillRect(screenX, screenY, star.size, star.size);
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount]);

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