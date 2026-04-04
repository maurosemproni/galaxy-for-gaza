export const GALAXY_CONFIG = {
  // --- SETTINGS GEOMETRICI ---
  starCount: 18457,
  numArms: 4,             // Numero di bracci della spirale
  spiralTwist: 4,         // Avvolgimento della spirale
  clumpingFactor: 0.18,   // Raggruppamento delle stelle (più è basso, più i bracci sono definiti)
  galaxyIncline: 0.4,     // Schiacciamento prospettico sull'asse Y
  
  // --- TEMPI E TIMING (in millisecondi) ---
  spawnRate: 1000,        // Ogni quanto si seleziona una nuova stella (1 sec)
  hudDuration: 3000,      // Durata di visualizzazione dell'HUD coi dati
  fallDuration: 2500,     // Durata dell'animazione di spegnimento e caduta
  
  // --- MOVIMENTO E ZOOM ---
  rotationSpeed: 0.00003, // Rotazione base del disco galattico
  zoomSpeed: 0.00000001,   // Velocità di avvicinamento (tarata per ~5 ore)
  
  // --- ESTETICA ---
  starColors: ["#ffffff", "#ffe0b2", "#b3e5fc", "#ffcc80"],
  backgroundColor: "#030305",
  haloColors: [
    { offset: 0, color: "rgba(255, 215, 150, 0.25)" },
    { offset: 0.2, color: "rgba(255, 180, 100, 0.15)" },
    { offset: 0.4, color: "rgba(100, 50, 150, 0.08)" },
    { offset: 1, color: "rgba(0, 0, 0, 0)" }
  ],

  // --- DEBUG E PERFORMANCE ---
  showFPS: false,
};