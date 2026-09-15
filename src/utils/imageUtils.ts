// Generates a realistic industrial technical image placeholder with grid, timestamps and labels
export function generateTechnicalPlaceholder(title: string, colorScheme: 'orange' | 'blue' | 'rust' | 'steel' = 'steel'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1280, 960);
  if (colorScheme === 'rust') {
    gradient.addColorStop(0, '#3e2723');
    gradient.addColorStop(0.5, '#4e342e');
    gradient.addColorStop(1, '#2b1b17');
  } else if (colorScheme === 'orange') {
    gradient.addColorStop(0, '#7c2d12');
    gradient.addColorStop(0.5, '#9a3412');
    gradient.addColorStop(1, '#431407');
  } else if (colorScheme === 'blue') {
    gradient.addColorStop(0, '#0c4a6e');
    gradient.addColorStop(0.5, '#075985');
    gradient.addColorStop(1, '#082f49');
  } else {
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.5, '#334155');
    gradient.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1280, 960);

  // Technical grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1280; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 960);
    ctx.stroke();
  }
  for (let y = 0; y < 960; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1280, y);
    ctx.stroke();
  }

  // Industrial mechanical drawing illustration (Motor / Flange / Bearing)
  const cx = 640;
  const cy = 480;

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, 260, 0, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  // Flange bolts
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const bx = cx + Math.cos(angle) * 230;
    const by = cy + Math.sin(angle) * 230;
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();
  }

  // Inner stator / rotor core
  ctx.beginPath();
  ctx.arc(cx, cy, 160, 0, Math.PI * 2);
  ctx.lineWidth = 12;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.stroke();

  // Shaft center
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(203, 213, 225, 0.3)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Crosshair
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 300, cy);
  ctx.lineTo(cx + 300, cy);
  ctx.moveTo(cx, cy - 300);
  ctx.lineTo(cx, cy + 300);
  ctx.stroke();

  // Tech overlay card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(40, 800, 1200, 120);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 800, 1200, 120);

  // Label text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`[REGISTRO FOTOGRÁFICO DE INSPEÇÃO]`, 70, 840);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(title, 70, 885);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px monospace';
  const nowStr = new Date().toLocaleString('pt-BR');
  ctx.fillText(`QUALIDADE MÁXIMA HD • RES: 1280x960 • ${nowStr}`, 700, 885);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// Read File as High Quality Data URL
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
