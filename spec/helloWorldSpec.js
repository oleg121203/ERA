// spec/helloWorldSpec.js
const gameLogic = require('../snake_js/gameLogic');

describe("helloWorld", () => {
    it("should return 'Hello, World!'", () => {
        expect(gameLogic.helloWorld()).toBe("Hello, World!");
    });
});