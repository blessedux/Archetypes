import { Scene } from "phaser";
import { Maps, Layers } from "../../../lib/game/constants/assets";

export default class DesertTestScene extends Scene {
  private map!: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("DesertTest");
  }

  preload() {
    // Load the map JSON
    this.load.tilemapTiledJSON(Maps.SPRITE_FUSION, '/assets/maps/sprite_fusion/map.json');
    
    // Load the tileset image
    this.load.image('sprite_fusion_tileset', '/assets/maps/sprite_fusion/tileset.png');
  }

  create() {
    // Create the tilemap
    this.map = this.make.tilemap({ key: Maps.SPRITE_FUSION });

    // Add the tileset
    const tileset = this.map.addTilesetImage('sprite_fusion_tileset');
    if (!tileset) {
      console.error('Failed to load tileset');
      return;
    }

    // Create the ground layer
    const groundLayer = this.map.createLayer(Layers.GROUND, tileset);
    if (!groundLayer) {
      console.error('Failed to create ground layer');
      return;
    }

    // Set up camera
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setZoom(2);
  }
} 