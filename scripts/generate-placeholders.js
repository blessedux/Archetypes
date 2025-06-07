const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = [
  'public/assets/scenes/desert_gate',
  'public/assets/characters/rogue'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate desert gate backgrounds
const times = ['day', 'sunset', 'night'];
const colors = {
  day: '#87CEEB',    // Sky blue
  sunset: '#FF7F50', // Coral
  night: '#191970'   // Midnight blue
};

times.forEach(time => {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = colors[time];
  ctx.fillRect(0, 0, 800, 600);
  
  // Add some desert elements
  ctx.fillStyle = '#D2B48C'; // Tan
  ctx.fillRect(0, 400, 800, 200); // Ground
  
  // Add a gate
  ctx.fillStyle = '#8B4513'; // Brown
  ctx.fillRect(350, 200, 100, 200);
  
  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '30px Arial';
  ctx.fillText(`Desert Gate - ${time}`, 20, 50);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(
    path.join('public/assets/scenes/desert_gate', `background_${time}.png`),
    buffer
  );
});

// Generate rogue spritesheet
const spritesheet = createCanvas(432, 48); // 9 frames of 48x48
const ctx = spritesheet.getContext('2d');

// Fill with a blue cloak color
ctx.fillStyle = '#4169E1'; // Royal blue
ctx.fillRect(0, 0, 432, 48);

// Add some details to make it look like a character
for (let i = 0; i < 9; i++) {
  // Add a head
  ctx.fillStyle = '#FFD700'; // Gold
  ctx.beginPath();
  ctx.arc(24 + i * 48, 24, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Add some movement variation
  if (i > 0 && i < 8) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(20 + i * 48, 34, 8, 2);
  }
}

// Save the spritesheet
const buffer = spritesheet.toBuffer('image/png');
fs.writeFileSync(
  path.join('public/assets/characters/rogue', 'idle_back.png'),
  buffer
); 