import { BaseScene } from "./BaseScene";
import { Maps, Sprites, Tilesets } from "../../../lib/game/constants/assets";
import { getStartPosition } from "../../../lib/game/utils/map";
import { Physics } from "phaser";

export class DesertGateScene extends BaseScene {
  player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super("DesertGateScene", Maps.DESERT_GATE);
  }

  initializePlayer() {
    const { startPosition } = getStartPosition(this);
    this.player = this.physics.add.sprite(startPosition.x, startPosition.y, Sprites.DESERT_WARRIOR);
    this.player.setScale(2);
  }

  initializeTilemap() {
    // Create the tilemap
    this.tilemap = this.make.tilemap({ key: this.map });

    // Add tileset
    const tileset = this.tilemap.addTilesetImage(Tilesets.DESERT_GATE, Tilesets.DESERT_GATE);
    if (!tileset) {
      console.error("Failed to load tileset");
      return;
    }

    // Create layers
    const groundLayer = this.tilemap.createLayer("Ground", tileset);
    const objectsLayer = this.tilemap.createLayer("Objects", tileset);
    const wallsLayer = this.tilemap.createLayer("Walls", tileset);

    if (!groundLayer || !objectsLayer || !wallsLayer) {
      console.error("Failed to create layers");
      return;
    }

    // Set collisions
    wallsLayer.setCollisionByProperty({ collides: true });

    // Set world bounds
    this.physics.world.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  }

  update() {
    if (!this.player || !this.cursors) return;

    // Only allow horizontal movement
    const speed = 160;
    this.player.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
    }

    // Update player position for multiplayer
    if (this.socket) {
      const position = this.player.getCenter();
      this.socket.emit("playerMove", {
        x: position.x,
        y: position.y,
        direction: this.player.flipX ? "left" : "right"
      });
    }
  }
} 