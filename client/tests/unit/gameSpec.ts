import { Game } from '../../src/js/game';
import { GameSettings } from '../../../shared/types';

describe('Game Tests', () => {
    let game: Game;
    let defaultSettings: GameSettings;

    beforeEach(() => {
        defaultSettings = {
            speed: 100,
            gridSize: 20,
            difficulty: 'medium'
        };
        game = new Game(defaultSettings);
    });

    it('should initialize correctly', () => {
        expect(game).toBeDefined();
        expect(game.isPlaying).toBeFalsy();
    });

    it('should start game with correct settings', () => {
        game.start();
        expect(game.isPlaying).toBeTruthy();
        expect(game.settings).toEqual(defaultSettings);
    });
});