import { Logger } from '../utils/logger';

const logger = new Logger();

background.onload = function(): void {
    logger.info('Background image loaded successfully.');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};
background.onerror = function(): void {
    logger.error('Failed to load background image.');
};