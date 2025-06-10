// app/game/GameComponent.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUIStore } from "../../lib/game/stores/ui";
import { AUTO, Scale, Game as PhaserGame } from "phaser";
import { Loading } from "./ui/Loading";
import WorldScene from "./scenes/WorldScene";
import { gameConfig } from "./config";

interface LoadingProgress {
  progress: number;
  currentAsset: string;
  totalAssets: number;
  loadedAssets: number;
}

export const GameComponent: React.FC = () => {
  const gameRef = useRef<PhaserGame | null>(null);
  const { loading: uiLoading } = useUIStore();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    progress: 0,
    currentAsset: 'Initializing...',
    totalAssets: 0,
    loadedAssets: 0
  });

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) return;

    const config = {
      ...gameConfig,
      parent: gameContainerRef.current,
      scene: [WorldScene],
      scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
        width: 800,
        height: 600
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      }
    };

    try {
      console.info('Creating Phaser game instance...');
      const game = new PhaserGame(config);
      gameRef.current = game;

      // Set up scene event listeners
      const scene = game.scene.getScene('WorldScene');
      if (scene) {
        scene.events.on('loadingProgress', (progress: LoadingProgress) => {
          console.log('Loading progress update:', progress);
          setLoadingProgress(progress);
        });

        scene.events.on('sceneReady', () => {
          console.log('Scene is ready');
          // You can add any additional initialization here
        });
      }

      console.info('Game instance created successfully');
    } catch (error) {
      console.error('Error creating game:', error);
    }

    return () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('WorldScene');
        if (scene) {
          scene.events.off('loadingProgress');
          scene.events.off('sceneReady');
        }
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={gameContainerRef} className="w-full h-full" />
      {uiLoading && <Loading progress={loadingProgress.progress} />}
    </div>
  );
};

export default GameComponent;
