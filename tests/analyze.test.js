import analyze from '../src/services/analyze.js';

describe('analyze function', () => {
  it('should analyze code correctly', async () => {
    const result = await analyze({ paths: ['src'] });
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.quality).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const result = await analyze({ paths: ['nonexistent'] });
    expect(result).toBeDefined();
  });
});
