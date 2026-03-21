import { useState, useEffect } from 'react';

export default function InfoPanel({ totalStars, fallenCount, firstFallTime }) {
  // Uno stato locale per aggiornare il timer a schermo ogni secondo
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Aggiorna l'orologio interno solo se è caduta almeno una stella
    if (!firstFallTime) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [firstFallTime]);

  // Funzione di utilità per formattare i millisecondi in hh:mm:ss
  const formatTime = (ms) => {
    if (ms < 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const elapsedMs = firstFallTime ? now - firstFallTime : 0;
  
  // Visto che cade una stella al secondo, il tempo rimanente 
  // in millisecondi è pari alle stelle rimanenti moltiplicate per 1000
  const remainingStars = totalStars - fallenCount;
  const remainingMs = remainingStars * 1000;

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '40px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      border: '1px solid rgba(170, 170, 180, 0.2)',
      borderLeft: '3px solid rgba(170, 170, 180, 0.8)',
      padding: '20px 25px',
      color: '#aaaaaa',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '14px',
      lineHeight: '1.8',
      pointerEvents: 'none', // Impedisce che il pannello blocchi eventuali click sullo sfondo
      zIndex: 10,
      minWidth: '320px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>
        A GALAXY OF {totalStars} LIGHTS
      </div>
      
      <div>
        Each light is a name. Every second, one fades into the dark.
      </div>

      <div>
        <b  style={{ color: '#ffffff'}}>{fallenCount}</b> lights have already gone out.
      </div>
      
      {fallenCount > 0 ? (
        <>
          <div>first one lost <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '15px' }}>{formatTime(elapsedMs)}</span> ago</div>
          <div>the sky will be empty in <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '15px' }}>{formatTime(remainingMs)}</span></div>
        </>
      ) : (
        <div style={{ fontStyle: 'italic', opacity: 0.7 }}>waiting for the first star to fall...</div>
      )}
    </div>
  );
}