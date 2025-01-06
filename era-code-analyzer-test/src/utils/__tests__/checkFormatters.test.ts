
import { execSync } from 'child_process';
import { checkFormatters } from '../checkFormatters';
import { logger } from '../logger';

// Мокаем logger
jest.mock('../logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

// Мокаем execSync
jest.mock('child_process', () => ({
    execSync: jest.fn()
}));

type Formatter = 'prettier' | 'eslint' | 'black' | 'autopep8' | 'isort';

describe('checkFormatters', () => {
    const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
    const mockedLogger = logger as jest.Mocked<typeof logger>;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('должен отметить все форматтеры как установленные', () => {
        // Настраиваем мок для успешного выполнения команд
        mockedExecSync.mockImplementation(() => {
            // Просто ничего не делаем, означая успешное выполнение
        });

        const formatters = checkFormatters();

        const expectedFormatters: Record<Formatter, boolean> = {
            prettier: true,
            eslint: true,
            black: true,
            autopep8: true,
            isort: true
        };

        expect(formatters).toEqual(expectedFormatters);

        // Проверяем, что logger.info вызывался для каждого форматтера
        expect(mockedLogger.info).toHaveBeenCalledTimes(5);
        expect(mockedLogger.warn).not.toHaveBeenCalled();
    });

    it('должен отметить некоторые форматтеры как неустановленные', () => {
        // Настраиваем мок для некоторых неудачных команд
        mockedExecSync.mockImplementation((cmd: string) => {
            if (cmd.includes('prettier') || cmd.includes('black')) {
                // Успех
                return;
            } else {
                // Бросаем ошибку для остальных
                throw new Error('Command failed');
            }
        });

        const formatters = checkFormatters();

        const expectedFormatters: Record<Formatter, boolean> = {
            prettier: true,
            eslint: false,
            black: true,
            autopep8: false,
            isort: false
        };

        expect(formatters).toEqual(expectedFormatters);

        // Проверяем, что logger.info был вызван для установленных форматтеров
        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        // И logger.warn для неустановленных
        expect(mockedLogger.warn).toHaveBeenCalledTimes(3);
    });

    it('должен правильно обрабатывать исключения', () => {
        // Настраиваем мок для всех команд, бросая исключение
        mockedExecSync.mockImplementation(() => {
            throw new Error('Command failed');
        });

        const formatters = checkFormatters();

        const expectedFormatters: Record<Formatter, boolean> = {
            prettier: false,
            eslint: false,
            black: false,
            autopep8: false,
            isort: false
        };

        expect(formatters).toEqual(expectedFormatters);

        // Проверяем, что logger.warn был вызван для всех форматтеров
        expect(mockedLogger.warn).toHaveBeenCalledTimes(5);
        expect(mockedLogger.info).not.toHaveBeenCalled();
    });
});