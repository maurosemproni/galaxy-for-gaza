// src/components/InfoPanel.jsx

export default function InfoPanel({ totalStars, fallenCount }) {
  
  const formatTime = (ms) => {
    if (ms < 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalTimeStr = formatTime(totalStars * 1000);
  const formattedTotal = new Intl.NumberFormat('en-US').format(totalStars);

  // LA MAGIA È QUI: Il tempo trascorso è calcolato matematicamente 
  // moltiplicando le stelle cadute per 1000 millisecondi (1 secondo).
  const elapsedMs = fallenCount * 1000;

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '40px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      border: '1px solid rgba(170, 170, 180, 0.15)',
      borderLeft: '3px solid rgba(170, 170, 180, 0.6)',
      padding: '24px 28px',
      color: '#aaaaaa',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '14px',
      lineHeight: '1.6',
      pointerEvents: 'none', 
      zIndex: 10,
      minWidth: '340px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
    }}>
      <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>
        {formattedTotal} LIGHTS
      </div>
      
      <div style={{ color: '#888899', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.5' }}>
        Each light is a name. Every second, one fades into the dark.<br/>
        It takes {totalTimeStr} for the sky to empty completely.
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }}>{fallenCount}</span> lights have gone out.
      </div>
      
      {fallenCount > 0 ? (
        <div>
          time passing: <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '15px', marginLeft: '6px' }}>{formatTime(elapsedMs)}</span>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', opacity: 0.5 }}>
          ...
        </div>
      )}
    </div>
  );
}