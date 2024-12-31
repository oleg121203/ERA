const gameLogic = require('../snake_js/gameLogic');

describe("Game functionality", () => {
    it("should return true when the game is started", () => {
        expect(gameLogic.startGame()).toBe(true);
    });

    it("should return the correct score", () => {
        expect(gameLogic.getScore()).toBe(0);
    });

    it("should end the game", () => {
        expect(gameLogic.endGame()).toBe(true);
    });
});