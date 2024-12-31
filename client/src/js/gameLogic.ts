export class GameLogic {
    public score: number;
    public level: number;
    public gameOver: boolean;
    public soundManager: {
        eat: HTMLAudioElement;
        gameOver: HTMLAudioElement;
        start: HTMLAudioElement;
    };

    constructor() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.soundManager = {
            eat: new Audio('../assets/sounds/eat.mp3'),
            gameOver: new Audio('../assets/sounds/game_over.mp3'),
            start: new Audio('../assets/sounds/start.mp3')
        };
    }

    update(): void {
        if (this.gameOver) return;
        // Игровая логика
    }

    render(): void {
        // Отрисовка игры
    }
}