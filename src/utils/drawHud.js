// src/utils/drawHud.js

const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const colorGrayMain = "rgba(170, 170, 180, 0.8)";
const colorGrayBorder = "rgba(170, 170, 180, 0.3)";
const boxH = 70; // Altezza fissa

// FUNZIONE 1: Disegna solo il cavo di ancoraggio
export function drawHUDLine(ctx, x, y, boxX, boxY, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  const anchorY = boxY + (boxH / 2);
  const lineInset = 10; 

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 15, anchorY); 
  ctx.lineTo(boxX + lineInset, anchorY);
  
  ctx.strokeStyle = colorGrayMain; 
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// FUNZIONE 2: Disegna solo la scatola nera e i testi
export function drawHUDBody(ctx, boxX, boxY, data, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  const arNameText = data.nomeArabo || "";
  const nameText = data.nome.toUpperCase();
  const ageText = `${data.eta}`;
  
  ctx.font = `bold 14px ${fontStack}`;
  const arNameWidth = ctx.measureText(arNameText).width;
  ctx.font = `bold 12px ${fontStack}`;
  const nameWidth = ctx.measureText(nameText).width;
  ctx.font = `12px ${fontStack}`;
  const ageWidth = ctx.measureText(ageText).width;

  const boxW = Math.max(140, arNameWidth + 24, nameWidth + 24, ageWidth + 24); 

  // Sfondo HUD (Nero semi-trasparente)
  ctx.fillStyle = "rgba(5, 5, 8, 0.95)"; // Aumentato un po' per coprire meglio le stelle e le altre linee
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Bordi
  ctx.strokeStyle = colorGrayBorder;
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  
  // Accento laterale
  ctx.fillStyle = colorGrayMain;
  ctx.fillRect(boxX, boxY, 3, boxH);

  // Testi
  ctx.fillStyle = "#ff4d4d"; 
  ctx.font = `bold 14px ${fontStack}`;
  ctx.fillText(arNameText, boxX + 12, boxY + 20);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 12px ${fontStack}`;
  ctx.fillText(nameText, boxX + 12, boxY + 40);

  ctx.beginPath();
  ctx.moveTo(boxX + 12, boxY + 48);
  ctx.lineTo(boxX + boxW - 12, boxY + 48);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.stroke();

  ctx.fillStyle = colorGrayMain;
  ctx.font = `12px ${fontStack}`;
  ctx.fillText(ageText, boxX + 12, boxY + 62);

  ctx.restore();
}