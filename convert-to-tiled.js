// convert-to-tiled.js
const fs = require('fs');

// Input: your custom map format
const inputPath = './custom_map.json'; // <-- Place your custom map JSON here
const outputPath = './public/assets/maps/map.json'; // Output to the working map

// Read your custom map
const customMap = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const { tileSize, mapWidth, mapHeight, layers } = customMap;

// Helper: create a blank data array for a layer
function blankLayer() {
  return Array(mapWidth * mapHeight).fill(0);
}

// Convert each layer to Tiled format
const tiledLayers = layers.map((layer, i) => {
  const data = blankLayer();
  layer.tiles.forEach(tile => {
    const idx = tile.y * mapWidth + tile.x;
    data[idx] = Number(tile.id) + 1; // Tiled expects 1-based tile IDs
  });
  return {
    name: layer.name,
    type: 'tilelayer',
    width: mapWidth,
    height: mapHeight,
    visible: true,
    opacity: 1,
    data,
  };
});

// Tileset definition for your custom spritesheet
const tiledTilesets = [
  {
    firstgid: 1,
    name: 'custom',
    image: '../images/tilesets/spritesheet.png',
    imagewidth: 512, // width of your uploaded image
    imageheight: 1536, // height of your uploaded image
    tilewidth: tileSize,
    tileheight: tileSize,
    tilecount: (512/64)*(1536/64), // 8 columns x 24 rows = 192 tiles
    columns: 8,
  }
];

// Build Tiled map object
const tiledMap = {
  compressionlevel: -1,
  height: mapHeight,
  width: mapWidth,
  tilewidth: tileSize,
  tileheight: tileSize,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.1',
  type: 'map',
  version: '1.10',
  layers: tiledLayers,
  tilesets: tiledTilesets,
};

fs.writeFileSync(outputPath, JSON.stringify(tiledMap, null, 2));
console.log('Converted to Tiled format and saved to', outputPath);