import { Scene, GameObjects, Physics } from 'phaser';

class WorldScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  public events: Phaser.Events.EventEmitter;
  private totalAssets: number = 2; // We're loading 2 assets
  private loadedAssets: number = 0;

  constructor() {
    super({ key: 'WorldScene' });
    this.events = new Phaser.Events.EventEmitter();
  }

  preload() {
    console.log('Starting preload...');
    
    // Set up loading events
    this.load.on('progress', (value: number) => {
      console.log(`Loading progress: ${(value * 100).toFixed(0)}%`);
      this.loadedAssets = Math.floor(value * this.totalAssets);
      this.events.emit('loadingProgress', {
        progress: value * 100,
        currentAsset: 'Loading assets...',
        totalAssets: this.totalAssets,
        loadedAssets: this.loadedAssets
      });
    });

    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
      this.events.emit('sceneReady');
    });

    // Load essential assets
    this.load.image('elder', '/assets/sprites/elder_topdown.webp');
    this.load.image('compass', '/assets/sprites/compass.webp');
  }

  create() {
    console.log('WorldScene create started');
    
    try {
      // Create the player
      this.player = this.physics.add.sprite(400, 300, 'elder');
      this.player.setCollideWorldBounds(true);
      
      // Set up camera to follow player
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setZoom(1);
      
      // Add keyboard controls
      this.cursors = this.input.keyboard.createCursorKeys();
      
      console.log('World setup complete');
    } catch (error) {
      console.error('Error in create:', error);
    }
  }

  update() {
    if (!this.player || !this.cursors || !this.player.body) return;

    // Handle player movement
    const speed = 160;
    const cursors = this.cursors;

    // Reset velocity
    this.player.setVelocity(0);

    // Handle movement
    if (cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }
}

export default WorldScene; 