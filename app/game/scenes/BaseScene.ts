import { Scene, GameObjects, Tilemaps } from "phaser";
import { Socket } from "socket.io-client";
import { Player } from "@/lib/socket/socketServer";
import {
  Sprites,
  Layers,
  Tilesets,
  Maps,
} from "../../../lib/game/constants/assets";
import {
  getStartPosition,
  savePlayerPosition,
} from "../../../lib/game/utils/map";
import {
  isUIOpen,
  toggleMenu,
  triggerUIDown,
  triggerUIExit,
  triggerUILeft,
  triggerUINextStep,
  triggerUIRight,
  triggerUIUp,
} from "../../../lib/game/utils/ui";

// Using string literal types for direction
type Direction = "up" | "down" | "left" | "right";

// GridEngine interfaces
interface GridEngineConfig {
  characters: {
    id: string;
    sprite: GameObjects.Sprite;
    walkingAnimationMapping?: {
      up: { leftFoot: number; standing: number; rightFoot: number };
      down: { leftFoot: number; standing: number; rightFoot: number };
      left: { leftFoot: number; standing: number; rightFoot: number };
      right: { leftFoot: number; standing: number; rightFoot: number };
    };
    startPosition: { x: number; y: number };
    facingDirection?: Direction;
    speed?: number;
    charLayer?: string;
  }[];
  collisionTilePropertyName?: string;
}

interface GridEngineInterface {
  movementStarted(): { subscribe: (callback: (data: MovementEvent) => void) => void };
  movementStopped(): { subscribe: (callback: (data: MovementEvent) => void) => void };
  directionChanged(): { subscribe: (callback: (data: MovementEvent) => void) => void };
  positionChangeFinished(): { subscribe: (callback: (data: any) => void) => void };
  getPosition(charId: string): { x: number; y: number };
  getFacingDirection(charId: string): Direction;
  setPosition(charId: string, position: { x: number; y: number }): void;
  turnTowards(charId: string, direction: Direction): void;
  hasCharacter(charId: string): boolean;
  addCharacter(config: any): void;
  removeCharacter(charId: string): void;
  create(tilemap: Phaser.Tilemaps.Tilemap, config: any): void;
  move(charId: string, direction: Direction): void;
  isMoving(charId: string): boolean;
}

interface MovementEvent {
  charId: string;
  direction: Direction;
}

interface PlayerMovement {
  x: number;
  y: number;
  direction: string;
}

export abstract class BaseScene extends Scene {
  // Core game properties
  gridEngine!: GridEngineInterface;
  player!: GameObjects.Sprite;
  speed: number = 10;
  tilemap!: Tilemaps.Tilemap;
  map: Maps;
  daylightOverlay!: GameObjects.Graphics;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey!: Phaser.Input.Keyboard.Key;

  // Multiplayer properties
  protected socket: Socket | null = null;
  public playerId: string | null = null;
  protected roomId: string | null = null;
  protected remotePlayers: Map<string, Phaser.GameObjects.Sprite> = new Map();
  protected roomCodeText!: Phaser.GameObjects.Text;
  username: string = "";
  adjacentPlayers: Map<string, Player> = new Map();
  chatGroupId: string | null = null;
  _lastAdjacentCheck: number = 0;

  constructor(sceneKey: string, map: Maps) {
    super(sceneKey);
    this.map = map;
  }

  init(data: any) {
    this.socket = data.socket;
    
    // Initialize daylight overlay
    const daylightOverlay = this.add.graphics();
    daylightOverlay.setDepth(1000);
    daylightOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
    daylightOverlay.setScrollFactor(0);
    this.daylightOverlay = daylightOverlay;

    if (this.socket) {
      this.setupSocketHandlers();
    }
  }

  create(): void {
    // Make the game instance globally accessible
    (window as any).__PHASER_GAME__ = this.game;

    // Handle canvas focus
    const canvas = this.game.canvas;
    canvas.addEventListener("click", () => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === "INPUT") {
        activeElement.blur();
      }
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
    });

    // Initialize game components
    this.initializePlayer();
    this.initializeTilemap();
    this.initializeCamera();
    this.initializeGrid();
    this.listenKeyboardControl();

    // Add room code display
    this.roomCodeText = this.add
      .text(16, 16, "Room: Connecting...", {
        fontSize: "18px",
        padding: { x: 10, y: 5 },
        backgroundColor: "#000000",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Set up position change handling
    this.gridEngine.positionChangeFinished().subscribe((observer: any) => {
      if (observer.charId === "player") {
        savePlayerPosition(this);
        const position = this.gridEngine.getPosition("player");
        const direction = this.gridEngine.getFacingDirection("player");
        this.updatePlayerMovement(position.x, position.y, direction);
      }
    });

    // Set up GridEngine listeners
    this.setupGridEngineListeners();

    // Initialize multiplayer
    this.initializeMultiplayer();
  }

  abstract initializePlayer(): void;
  abstract initializeTilemap(): void;

  initializeCamera() {
    if (!this.tilemap) return;
    
    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2);
  }

  initializeGrid() {
    // Initialize GridEngine
    this.gridEngine.create(this.tilemap, {
      characters: [
        {
          id: "player",
          sprite: this.player,
          walkingAnimationMapping: {
            up: { leftFoot: 0, standing: 1, rightFoot: 2 },
            down: { leftFoot: 3, standing: 4, rightFoot: 5 },
            left: { leftFoot: 6, standing: 7, rightFoot: 8 },
            right: { leftFoot: 9, standing: 10, rightFoot: 11 },
          },
          startPosition: { x: 5, y: 5 },
          speed: this.speed,
        },
      ],
    });
  }

  listenKeyboardControl() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.input.keyboard.on("keydown", (event: KeyboardEvent) => {
      if (isUIOpen()) {
        switch (event.key) {
          case "ArrowUp":
            triggerUIUp();
            break;
          case "ArrowDown":
            triggerUIDown();
            break;
          case "ArrowLeft":
            triggerUILeft();
            break;
          case "ArrowRight":
            triggerUIRight();
            break;
          case "Enter":
            triggerUINextStep();
            break;
          case "Escape":
            triggerUIExit();
            break;
        }
      }
    });
  }

  setupGridEngineListeners() {
    this.gridEngine.movementStarted().subscribe(({ charId, direction }: MovementEvent) => {
      if (charId === "player") {
        const position = this.gridEngine.getPosition("player");
        this.updatePlayerMovement(position.x, position.y, direction);
      }
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }: MovementEvent) => {
      if (charId === "player") {
        const position = this.gridEngine.getPosition("player");
        this.updatePlayerMovement(position.x, position.y, direction);
      }
    });
  }

  initializeMultiplayer() {
    if (this.socket) {
      this.username = "Player" + Math.floor(Math.random() * 1000);

      if (typeof window !== "undefined") {
        const gameAction = (window as any).__gameAction;
        const roomCode = (window as any).__roomCode;

        if (gameAction === "join" && roomCode) {
          this.joinRoom(roomCode, this.username);
        } else {
          this.createOrJoinRoom(this.username);
        }
      } else {
        this.createOrJoinRoom(this.username);
      }
    }
  }

  createOrJoinRoom(username: string) {
    if (this.socket) {
      this.socket.emit("createOrJoinRoom", { username });
    }
  }

  joinRoom(roomId: string, username: string) {
    if (this.socket) {
      this.socket.emit("joinRoom", { roomId, username });
    }
  }

  addRemotePlayer(playerId: string, playerData: Player) {
    const remotePlayer = this.add.sprite(
      playerData.x,
      playerData.y,
      Sprites.DESERT_WARRIOR
    );
    remotePlayer.setScale(2);
    this.remotePlayers.set(playerId, remotePlayer);

    // Add to GridEngine
    this.gridEngine.addCharacter({
      id: playerId,
      sprite: remotePlayer,
      walkingAnimationMapping: {
        up: { leftFoot: 0, standing: 1, rightFoot: 2 },
        down: { leftFoot: 3, standing: 4, rightFoot: 5 },
        left: { leftFoot: 6, standing: 7, rightFoot: 8 },
        right: { leftFoot: 9, standing: 10, rightFoot: 11 },
      },
      startPosition: { x: playerData.x, y: playerData.y },
      speed: this.speed,
    });
  }

  updateRemotePlayerPosition(playerId: string, movement: PlayerMovement) {
    const remotePlayer = this.remotePlayers.get(playerId);
    if (remotePlayer && this.gridEngine.hasCharacter(playerId)) {
      this.gridEngine.setPosition(playerId, { x: movement.x, y: movement.y });
      this.gridEngine.turnTowards(playerId, movement.direction as Direction);
    }
  }

  removeRemotePlayer(playerId: string) {
    const remotePlayer = this.remotePlayers.get(playerId);
    if (remotePlayer) {
      remotePlayer.destroy();
      this.remotePlayers.delete(playerId);
      this.gridEngine.removeCharacter(playerId);
    }
  }

  updatePlayerMovement(x: number, y: number, direction: Direction) {
    if (this.socket && this.roomId) {
      this.socket.emit("playerMovement", {
        roomId: this.roomId,
        movement: { x, y, direction },
      });
    }
  }

  update(time: number, delta: number) {
    if (!isUIOpen() && this.cursors) {
      if (this.cursors.left.isDown) {
        this.gridEngine.move("player", "left");
      } else if (this.cursors.right.isDown) {
        this.gridEngine.move("player", "right");
      } else if (this.cursors.up.isDown) {
        this.gridEngine.move("player", "up");
      } else if (this.cursors.down.isDown) {
        this.gridEngine.move("player", "down");
      }
    }
  }

  listenMoves() {
    // This method is required by the type system but not used in this scene
  }

  checkAdjacentPlayers() {
    // This method is required by the type system but not used in this scene
  }

  setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.on("playerJoined", (data: { playerId: string; player: Player }) => {
      this.addRemotePlayer(data.playerId, data.player);
    });

    this.socket.on("playerLeft", (playerId: string) => {
      this.removeRemotePlayer(playerId);
    });

    this.socket.on("playerMoved", (data: { playerId: string; movement: PlayerMovement }) => {
      this.updateRemotePlayerPosition(data.playerId, data.movement);
    });

    this.socket.on("roomJoined", (data: { roomId: string; players: Player[] }) => {
      this.roomId = data.roomId;
      this.roomCodeText.setText(`Room: ${data.roomId}`);

      // Add existing players
      data.players.forEach((player) => {
        if (player.id !== this.playerId) {
          this.addRemotePlayer(player.id, player);
        }
      });
    });
  }
} 