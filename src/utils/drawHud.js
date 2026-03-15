export function drawHUD(ctx, x, y, data, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  // 1. Definiamo i testi
  const arNameText = data.nomeArabo || "";
  const nameText = data.nome.toUpperCase();
  const ageText = `AGE: ${data.eta}`;
  
  // Font stack ad alta leggibilità (usa il font di sistema migliore disponibile)
  const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  
  // 2. Misuriamo la larghezza dei testi
  ctx.font = `bold 14px ${fontStack}`; // Aumentato a 14px
  const arNameWidth = ctx.measureText(arNameText).width;

  ctx.font = `bold 12px ${fontStack}`; // Aumentato a 12px
  const nameWidth = ctx.measureText(nameText).width;
  
  ctx.font = `12px ${fontStack}`; // Aumentato a 12px
  const ageWidth = ctx.measureText(ageText).width;

  // 3. Calcoliamo le nuove dimensioni del box
  const boxW = Math.max(140, arNameWidth + 24, nameWidth + 24, ageWidth + 24); 
  const boxH = 70; // Aumentato per dare respiro ai font più grandi
  
  const boxX = x + 25;
  const boxY = y - 48; // Alzato leggermente per compensare

  // Colori base aggiornati (Tech Gray)
  const colorGrayMain = "rgba(170, 170, 180, 0.8)";
  const colorGrayBorder = "rgba(170, 170, 180, 0.3)";

  // Linea di puntamento (Grigia)
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 15, y - 15);
  ctx.lineTo(boxX, y - 15);
  ctx.strokeStyle = colorGrayMain; 
  ctx.lineWidth = 1;
  ctx.stroke();

  // Sfondo HUD
  ctx.fillStyle = "rgba(5, 5, 8, 0.9)";
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Bordi 
  ctx.strokeStyle = colorGrayBorder;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  
  // Accento laterale
  ctx.fillStyle = colorGrayMain;
  ctx.fillRect(boxX, boxY, 3, boxH);

  // --- TESTI ---

  // 1. Disegno del Nome Arabo (Rosso, In alto)
  ctx.fillStyle = "#ff4d4d"; 
  ctx.font = `bold 14px ${fontStack}`;
  ctx.fillText(arNameText, boxX + 12, boxY + 20);

  // 2. Disegno del Nome Inglese (Bianco, In mezzo)
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 12px ${fontStack}`;
  ctx.fillText(nameText, boxX + 12, boxY + 40);

  // Riga separatrice
  ctx.beginPath();
  ctx.moveTo(boxX + 12, boxY + 48);
  ctx.lineTo(boxX + boxW - 12, boxY + 48);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.stroke();

  // 3. Disegno dell'Età (Grigio chiaro, In basso)
  ctx.fillStyle = colorGrayMain;
  ctx.font = `12px ${fontStack}`;
  ctx.fillText(ageText, boxX + 12, boxY + 62);

  ctx.restore();
}