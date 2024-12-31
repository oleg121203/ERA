import { hello } from '../../src/hello';

describe('Hello World Test', () => {
    it('should return Hello World', () => {
        expect(hello()).toBe('Hello, World!');
    });
});