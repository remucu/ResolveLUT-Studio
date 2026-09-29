// High-fidelity procedural test stills for color grading and LUT inspection
// Generates zero-dependency cinema test frames directly on client

export interface SampleStill {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl?: string;
  generate: () => string;
}

export function createCinemaStills(): SampleStill[] {
  const stills: SampleStill[] = [
    {
      id: 'cine-portrait',
      name: 'Cinema Portrait (Skin Tones)',
      category: 'Portrait',
      description: 'Studio cinematic portrait with soft key light, skin tone highlights, and deep shadow gradation.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Cinematic moody background
        const bgGrad = ctx.createLinearGradient(0, 0, 960, 540);
        bgGrad.addColorStop(0, '#1c1b24');
        bgGrad.addColorStop(0.5, '#12151c');
        bgGrad.addColorStop(1, '#080a0e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 960, 540);

        // Warm key light rim on background
        const rimGrad = ctx.createRadialGradient(280, 200, 30, 280, 200, 380);
        rimGrad.addColorStop(0, 'rgba(84, 110, 122, 0.35)');
        rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rimGrad;
        ctx.fillRect(0, 0, 960, 540);

        // Subject silhouette & skin tone modeling
        // Head / Face
        const faceGrad = ctx.createRadialGradient(450, 230, 20, 480, 260, 180);
        faceGrad.addColorStop(0, '#f2be9b'); // warm skin highlight
        faceGrad.addColorStop(0.35, '#d99470'); // mid skin
        faceGrad.addColorStop(0.7, '#965239'); // shadow skin
        faceGrad.addColorStop(1, '#472216');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.ellipse(480, 240, 120, 155, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Soft eye/forehead contouring
        ctx.fillStyle = 'rgba(245, 178, 140, 0.4)';
        ctx.beginPath();
        ctx.ellipse(440, 205, 45, 25, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Soft lips
        ctx.fillStyle = 'rgba(186, 75, 75, 0.65)';
        ctx.beginPath();
        ctx.ellipse(465, 320, 34, 12, 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1c1716';
        ctx.beginPath();
        ctx.ellipse(435, 235, 16, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(515, 238, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye catchlights (specular highlights)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(438, 233, 3, 0, Math.PI * 2);
        ctx.arc(518, 236, 3, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        const hairGrad = ctx.createLinearGradient(350, 100, 600, 350);
        hairGrad.addColorStop(0, '#2d1c14');
        hairGrad.addColorStop(0.5, '#160c07');
        hairGrad.addColorStop(1, '#0d0704');
        ctx.fillStyle = hairGrad;
        ctx.beginPath();
        ctx.arc(475, 210, 150, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();

        // Shoulders & Wardrobe (Dark cinema charcoal wool)
        const clothGrad = ctx.createLinearGradient(480, 360, 480, 540);
        clothGrad.addColorStop(0, '#2a313d');
        clothGrad.addColorStop(1, '#11141a');
        ctx.fillStyle = clothGrad;
        ctx.beginPath();
        ctx.moveTo(310, 540);
        ctx.quadraticCurveTo(400, 380, 480, 375);
        ctx.quadraticCurveTo(560, 380, 660, 540);
        ctx.fill();

        // Subtle practical light bokeh circles in background
        const bokeh = [
          { x: 160, y: 140, r: 45, col: 'rgba(255, 180, 80, 0.18)' },
          { x: 230, y: 280, r: 60, col: 'rgba(255, 210, 140, 0.12)' },
          { x: 790, y: 160, r: 55, col: 'rgba(70, 160, 220, 0.15)' },
          { x: 860, y: 310, r: 75, col: 'rgba(50, 180, 200, 0.1)' },
          { x: 120, y: 420, r: 85, col: 'rgba(240, 150, 70, 0.12)' },
        ];
        bokeh.forEach((b) => {
          ctx.fillStyle = b.col;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Film aspect ratio letterbox lines watermark
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.font = '11px sans-serif';
        ctx.fillText('CINEMA SKIN TONE TEST STILL • 2.39:1 SCOPE', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'golden-landscape',
      name: 'Golden Hour Mountain Landscape',
      category: 'Landscape',
      description: 'High dynamic range sunset with fiery sky, mountain silhouettes, and warm specular reflections.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
        skyGrad.addColorStop(0, '#1a2238'); // deep blue upper atmosphere
        skyGrad.addColorStop(0.35, '#3e3b5e');
        skyGrad.addColorStop(0.65, '#b85434'); // fiery orange
        skyGrad.addColorStop(0.85, '#f59238'); // bright golden
        skyGrad.addColorStop(1, '#ffdf78'); // horizon yellow
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 960, 360);

        // Sun disc with intense glow
        const sunGlow = ctx.createRadialGradient(480, 310, 10, 480, 310, 220);
        sunGlow.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
        sunGlow.addColorStop(0.2, 'rgba(255, 220, 120, 0.6)');
        sunGlow.addColorStop(0.6, 'rgba(255, 130, 40, 0.25)');
        sunGlow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, 960, 540);

        // Distant mountain range
        ctx.fillStyle = '#4a2c3a';
        ctx.beginPath();
        ctx.moveTo(0, 340);
        ctx.lineTo(140, 290);
        ctx.lineTo(260, 330);
        ctx.lineTo(390, 270);
        ctx.lineTo(480, 305);
        ctx.lineTo(600, 260);
        ctx.lineTo(760, 320);
        ctx.lineTo(960, 280);
        ctx.lineTo(960, 540);
        ctx.lineTo(0, 540);
        ctx.fill();

        // Midground mountains
        ctx.fillStyle = '#261b2b';
        ctx.beginPath();
        ctx.moveTo(0, 370);
        ctx.lineTo(180, 330);
        ctx.lineTo(330, 375);
        ctx.lineTo(520, 320);
        ctx.lineTo(680, 365);
        ctx.lineTo(840, 315);
        ctx.lineTo(960, 350);
        ctx.lineTo(960, 540);
        ctx.lineTo(0, 540);
        ctx.fill();

        // Foreground lake reflection
        const lakeGrad = ctx.createLinearGradient(0, 370, 0, 540);
        lakeGrad.addColorStop(0, '#422822');
        lakeGrad.addColorStop(0.4, '#c4662d');
        lakeGrad.addColorStop(0.7, '#241a24');
        lakeGrad.addColorStop(1, '#0e0b12');
        ctx.fillStyle = lakeGrad;
        ctx.fillRect(0, 370, 960, 170);

        // Golden sun reflection shimmer on water
        const lakeReflect = ctx.createRadialGradient(480, 380, 5, 480, 470, 180);
        lakeReflect.addColorStop(0, 'rgba(255, 230, 160, 0.7)');
        lakeReflect.addColorStop(0.5, 'rgba(240, 130, 50, 0.3)');
        lakeReflect.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lakeReflect;
        ctx.fillRect(300, 370, 360, 170);

        // Pine trees foreground silhouette
        ctx.fillStyle = '#0a0a0e';
        const drawPine = (x: number, y: number, h: number) => {
          ctx.beginPath();
          ctx.moveTo(x, y - h);
          ctx.lineTo(x - h * 0.25, y);
          ctx.lineTo(x + h * 0.25, y);
          ctx.fill();
        };
        for (let i = 0; i < 22; i++) {
          drawPine(20 + i * 28 + (i % 3) * 6, 420 + (i % 4) * 15, 60 + (i % 5) * 18);
        }
        for (let i = 0; i < 16; i++) {
          drawPine(720 + i * 22, 430 + (i % 3) * 20, 70 + (i % 4) * 16);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '11px sans-serif';
        ctx.fillText('HDR SUNSET & SPECULAR ROLL-OFF TEST • 35MM EQUIV', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'cyberpunk-neon',
      name: 'Cyberpunk Neon Alley (Night / High Saturation)',
      category: 'Night & Neon',
      description: 'Vibrant neon reflections, cyan holographic signage, and deep crushed night shadows.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Wet rainy street background
        const nightGrad = ctx.createLinearGradient(0, 0, 0, 540);
        nightGrad.addColorStop(0, '#060a12');
        nightGrad.addColorStop(0.5, '#0b111e');
        nightGrad.addColorStop(0.8, '#101622');
        nightGrad.addColorStop(1, '#05070a');
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, 960, 540);

        // Buildings silhouette
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(60, 40, 240, 420);
        ctx.fillRect(680, 20, 240, 440);
        ctx.fillRect(360, 100, 240, 360);

        // Neon Sign Left (Cyan / Aqua)
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(100, 120, 14, 180);
        ctx.fillRect(100, 120, 120, 14);
        ctx.fillRect(100, 200, 90, 14);

        // Neon Sign Right (Hot Magenta / Pink)
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(790, 180, 60, 0, Math.PI * 2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#ff007f';
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Japanese kanji / signage glow effect
        ctx.fillStyle = '#ffe600';
        ctx.shadowColor = '#ffbb00';
        ctx.shadowBlur = 20;
        ctx.fillRect(440, 150, 80, 18);
        ctx.fillRect(470, 180, 20, 70);
        ctx.fillRect(440, 220, 80, 16);
        ctx.shadowBlur = 0;

        // Street puddles reflection (horizontal wet streaks)
        const streetReflect = ctx.createLinearGradient(0, 380, 0, 540);
        streetReflect.addColorStop(0, '#0d131f');
        streetReflect.addColorStop(1, '#040609');
        ctx.fillStyle = streetReflect;
        ctx.fillRect(0, 380, 960, 160);

        // Wet puddle cyan reflection
        const p1 = ctx.createRadialGradient(160, 450, 10, 160, 450, 120);
        p1.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
        p1.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = p1;
        ctx.fillRect(40, 410, 240, 80);

        // Wet puddle magenta reflection
        const p2 = ctx.createRadialGradient(780, 460, 10, 780, 460, 140);
        p2.addColorStop(0, 'rgba(255, 0, 128, 0.4)');
        p2.addColorStop(1, 'rgba(255, 0, 128, 0)');
        ctx.fillStyle = p2;
        ctx.fillRect(660, 420, 240, 80);

        // Yellow street center reflection
        const p3 = ctx.createRadialGradient(480, 470, 10, 480, 470, 90);
        p3.addColorStop(0, 'rgba(255, 200, 50, 0.35)');
        p3.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = p3;
        ctx.fillRect(390, 430, 180, 80);

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '11px sans-serif';
        ctx.fillText('NEON GAMUT & CHROMATIC SEPARATION TEST', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'macbeth-chart',
      name: 'Color Checker (Macbeth 24-Patch)',
      category: 'Technical Chart',
      description: 'Standard 24-patch color calibration chart for measuring hue shifts, tint balance, and saturation accuracy.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Studio neutral grey background (18% grey)
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, 960, 540);

        // Color chart frame (Black matte plastic border)
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(160, 60, 640, 420);

        // 24 Standard ColorChecker patches (Row 1 to 4, 6 columns)
        const patches = [
          // Row 1: Natural colors (Dark skin, Light skin, Blue sky, Foliage, Blue flower, Bluish green)
          '#735244', '#c29682', '#627a9d', '#576c43', '#8580b1', '#67bdaa',
          // Row 2: Miscellaneous (Orange, Purplish blue, Moderate red, Purple, Yellow green, Orange yellow)
          '#d67e2c', '#505ba6', '#c15a63', '#5e3c6c', '#9dbc40', '#e0a32e',
          // Row 3: Primary & Secondary (Blue, Green, Red, Yellow, Magenta, Cyan)
          '#383d96', '#469449', '#af363c', '#e7c71f', '#bb5695', '#0885a1',
          // Row 4: Grayscale (White, Neutral 8, Neutral 6.5, Neutral 5, Neutral 3.5, Black)
          '#f3f3f2', '#c8c8c8', '#a0a0a0', '#7a7a79', '#555555', '#343434',
        ];

        const patchW = 86;
        const patchH = 80;
        const startX = 188;
        const startY = 82;
        const gapX = 16;
        const gapY = 16;

        patches.forEach((color, index) => {
          const col = index % 6;
          const row = Math.floor(index / 6);
          const x = startX + col * (patchW + gapX);
          const y = startY + row * (patchH + gapY);

          ctx.fillStyle = color;
          ctx.fillRect(x, y, patchW, patchH);
        });

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '12px sans-serif';
        ctx.fillText('COLOR CHECKER 24-PATCH CALIBRATION TARGET • D50 ILLUMINANT', 188, 470);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'flat-log-sample',
      name: 'Flat Camera Log (S-Log3 / LogC)',
      category: 'Flat Camera Log',
      description: 'Flat, low-contrast, wide dynamic range raw camera log simulation ready for Rec.709 LUT conversion.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Flat washed-out log appearance
        const logGrad = ctx.createLinearGradient(0, 0, 960, 540);
        logGrad.addColorStop(0, '#5f656b');
        logGrad.addColorStop(0.5, '#787b7f');
        logGrad.addColorStop(1, '#8f9194');
        ctx.fillStyle = logGrad;
        ctx.fillRect(0, 0, 960, 540);

        // Subject with flat grey compression (lifted blacks around 35 IRE, highlights at 75 IRE)
        ctx.fillStyle = '#6e6966';
        ctx.beginPath();
        ctx.ellipse(480, 240, 110, 140, 0, 0, Math.PI * 2);
        ctx.fill();

        // Muted log skin tone
        ctx.fillStyle = '#9b887d';
        ctx.beginPath();
        ctx.ellipse(465, 230, 80, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sky & mountains with low contrast
        ctx.fillStyle = '#82898c';
        ctx.beginPath();
        ctx.moveTo(0, 360);
        ctx.lineTo(250, 310);
        ctx.lineTo(500, 340);
        ctx.lineTo(750, 290);
        ctx.lineTo(960, 330);
        ctx.lineTo(960, 540);
        ctx.lineTo(0, 540);
        ctx.fill();

        ctx.fillStyle = '#595f63';
        ctx.fillRect(0, 390, 960, 150);

        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '12px monospace';
        ctx.fillText('RAW S-LOG3 / ARRI LOGC SIMULATION • INPUT TRANSFORM READY', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'wedding-nature-still',
      name: 'Nuntă în Natură (Mireasă & Natură)',
      category: 'Nuntă (Wedding)',
      description: 'Cadru de cununie în aer liber: rochie albă de mireasă, ten cald romantic, costum închis și fundal de parc/pădure verde.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Golden hour warm sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
        skyGrad.addColorStop(0, '#7895a2');
        skyGrad.addColorStop(0.4, '#d8b99c');
        skyGrad.addColorStop(0.8, '#f5d5b0');
        skyGrad.addColorStop(1, '#ffedd5');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 960, 320);

        // Sun flare in corner
        const flare = ctx.createRadialGradient(820, 80, 10, 820, 80, 350);
        flare.addColorStop(0, 'rgba(255, 245, 210, 0.8)');
        flare.addColorStop(0.4, 'rgba(255, 205, 120, 0.3)');
        flare.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, 960, 540);

        // Lush green foliage background (trees / botanical park)
        const treesGrad = ctx.createLinearGradient(0, 200, 0, 540);
        treesGrad.addColorStop(0, '#34523b');
        treesGrad.addColorStop(0.5, '#28442e');
        treesGrad.addColorStop(1, '#1b2f21');
        ctx.fillStyle = treesGrad;
        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.quadraticCurveTo(240, 200, 480, 260);
        ctx.quadraticCurveTo(720, 210, 960, 270);
        ctx.lineTo(960, 540);
        ctx.lineTo(0, 540);
        ctx.fill();

        // Groom silhouette & dark suit
        ctx.fillStyle = '#181e26';
        ctx.beginPath();
        ctx.moveTo(380, 540);
        ctx.lineTo(390, 310);
        ctx.quadraticCurveTo(430, 295, 460, 320);
        ctx.lineTo(460, 540);
        ctx.fill();

        // Groom head
        const groomHead = ctx.createRadialGradient(425, 240, 10, 425, 250, 60);
        groomHead.addColorStop(0, '#f2be9b');
        groomHead.addColorStop(0.8, '#a26243');
        ctx.fillStyle = groomHead;
        ctx.beginPath();
        ctx.ellipse(425, 245, 45, 55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bride's dress (White silk & lace highlights)
        const dressGrad = ctx.createLinearGradient(480, 310, 560, 540);
        dressGrad.addColorStop(0, '#ffffff'); // pure white bodice
        dressGrad.addColorStop(0.3, '#fbf8f5');
        dressGrad.addColorStop(0.7, '#f0eae1');
        dressGrad.addColorStop(1, '#e3dacf'); // subtle shadow folds
        ctx.fillStyle = dressGrad;
        ctx.beginPath();
        ctx.moveTo(480, 320);
        ctx.quadraticCurveTo(520, 310, 550, 340);
        ctx.lineTo(620, 540);
        ctx.lineTo(470, 540);
        ctx.fill();

        // Bride head and skin
        const brideHead = ctx.createRadialGradient(510, 245, 10, 510, 250, 55);
        brideHead.addColorStop(0, '#fde3d2');
        brideHead.addColorStop(0.6, '#eeb898');
        brideHead.addColorStop(1, '#b46d4a');
        ctx.fillStyle = brideHead;
        ctx.beginPath();
        ctx.ellipse(515, 250, 40, 50, -0.05, 0, Math.PI * 2);
        ctx.fill();

        // Bouquet of flowers (roses, eucalyptus, pastels)
        ctx.fillStyle = '#fce7f3';
        ctx.beginPath();
        ctx.arc(495, 380, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(485, 375, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#52795d'; // eucalyptus
        ctx.beginPath();
        ctx.arc(510, 390, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px sans-serif';
        ctx.fillText('TEST NUNTĂ ÎN NATURĂ • ROCHIE ALBĂ & VERDEAȚĂ • REC.709 G2.4', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
    {
      id: 'wedding-dancefloor-still',
      name: 'Sală Nuntă (Lumini LED & Arhitecturale)',
      category: 'Nuntă (Wedding)',
      description: 'Ring de dans de nuntă: proiectoare LED magenta/cyan, lumini arhitecturale calde de sală, miri dansând în fum greu.',
      generate: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;

        // Dark hall background with warm architectural uplights on pillars
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, 960, 540);

        // Warm amber architectural pillars (uplighting)
        const pillars = [120, 280, 680, 840];
        pillars.forEach((px) => {
          const upGrad = ctx.createLinearGradient(px, 540, px, 60);
          upGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
          upGrad.addColorStop(0.5, 'rgba(245, 180, 60, 0.2)');
          upGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = upGrad;
          ctx.fillRect(px - 35, 60, 70, 480);
        });

        // Stage LED spots (Magenta Left, Cyan Right)
        // Magenta LED Spot
        const ledMagenta = ctx.createRadialGradient(260, 120, 20, 400, 340, 300);
        ledMagenta.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
        ledMagenta.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
        ledMagenta.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ledMagenta;
        ctx.fillRect(0, 0, 960, 540);

        // Cyan / Blue LED Spot
        const ledCyan = ctx.createRadialGradient(720, 140, 20, 560, 340, 320);
        ledCyan.addColorStop(0, 'rgba(6, 182, 212, 0.65)');
        ledCyan.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
        ledCyan.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ledCyan;
        ctx.fillRect(0, 0, 960, 540);

        // Heavy dry ice smoke on dancefloor
        const smoke = ctx.createLinearGradient(0, 360, 0, 540);
        smoke.addColorStop(0, 'rgba(255,255,255,0)');
        smoke.addColorStop(0.4, 'rgba(240,245,255,0.4)');
        smoke.addColorStop(0.8, 'rgba(220,230,250,0.7)');
        smoke.addColorStop(1, 'rgba(180,195,220,0.85)');
        ctx.fillStyle = smoke;
        ctx.fillRect(0, 360, 960, 180);

        // Dancing couple silhouette & illuminated dress
        // Bride Dress (Illuminated by LED & dry ice)
        const dress = ctx.createLinearGradient(460, 300, 540, 480);
        dress.addColorStop(0, '#ffffff');
        dress.addColorStop(0.5, '#e0e7ff');
        dress.addColorStop(1, '#c7d2fe');
        ctx.fillStyle = dress;
        ctx.beginPath();
        ctx.moveTo(480, 280);
        ctx.lineTo(540, 460);
        ctx.lineTo(430, 460);
        ctx.fill();

        // Faces under LED mix
        const face = ctx.createRadialGradient(475, 220, 8, 475, 220, 45);
        face.addColorStop(0, '#f9a8d4'); // LED color cast
        face.addColorStop(0.5, '#e29172');
        face.addColorStop(1, '#78350f');
        ctx.fillStyle = face;
        ctx.beginPath();
        ctx.ellipse(475, 225, 32, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '11px sans-serif';
        ctx.fillText('TEST SALĂ DE DANS • LUMINI LED DJ & ARHITECTURALE • PROTECȚIE TEN', 24, 515);

        return canvas.toDataURL('image/jpeg', 0.92);
      },
    },
  ];

  return stills;
}
