export interface GameState {
    score: number;
    level: number;
    isPlaying: boolean;
}

export interface PlayerState {
    id: string;
    name: string;
    score: number;
}

export interface GameSettings {
    speed: number;
    gridSize: number;
    difficulty: 'easy' | 'medium' | 'hard';
}
