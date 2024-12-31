// import { GameState, GameSettings } from '@shared/types'; // Убедитесь в корректности

export interface ClientGameState extends GameState {
    currentFrame: number;
    fps: number;
}

export interface ClientConfig {
    canvasWidth: number;
    canvasHeight: number;
    assets: {
        images: string[];
        sounds: string[];
    };
    settings: GameSettings;
}
