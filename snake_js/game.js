// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Проверка инициализации canvas
    if (!canvas || !ctx) {
        console.error('Canvas not initialized!');
        alert('Error initializing game canvas!');
        return;
    }

    console.log('Canvas initialized:', canvas.width, 'x', canvas.height);

    // Основные параметры игры
    const box = 20;
    const depth = 5; // Глубина для 3D-эффекта
    const foodEmojis = {
        fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓'],
        vegetables: ['🥕', '🥒', '🍅', '🌽', '🥬', '🥦', '🧅', '🥔']
    };

    let snake = [{ x: 10 * box, y: 10 * box }];
    let snake2 = [];
    let food = null;
    let direction = 'right';
    let direction2 = 'left';
    let game = null;
    let score = 0;
    let score2 = 0;
    let isGameRunning = false;
    let foodStats = { fruits: 0, vegetables: 0 };

    // Добавление опций настроек
    let settings = {
        speed: 1000 / 20, // Скорость (интервал в мс)
        snakeColor: '#2ecc71',
        backgroundImage: 'background.jpg', // Убедитесь, что это значение корректно
        showGrid: false // Флаг для отображения сетки
    };

    let soundEnabled = true;
    let currentTheme = 'light'; // 'light' или 'dark'

    // Функции для звуков
    function playSound(sound) {
        if (soundEnabled && snakeSoundAssets[sound]) {
            const audioPath = snakeSoundAssets[sound];
            const audio = new Audio(audioPath);
            audio.play();
        }
    }

    // Звуковые эффекты
    const snakeSoundAssets = {
        eat: 'sounds/eat.mp3',
        gameOver: 'sounds/game_over.mp3',
        start: 'sounds/start.mp3' // Добавлен звук старта
    };

    // Функция для загрузки эмодзи (если требуется дополнительная обработка)
    function loadEmoji(emoji) {
        // В данном случае просто возвращаем эмодзи, но можно добавить обработку
        return emoji;
    }

    // Применение настроек
    function applySettings() {
        // Отрисовка фона
        const background = new Image();
        background.src = settings.backgroundImage;
        background.onload = function() {
            console.log('Background image loaded successfully.');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        };
        background.onerror = function() {
            console.error('Failed to load background image.');
        };

        // Применение темы
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        // Применение углового 3D-эффекта
        const gameArea = document.querySelector('.game-area');
        if (settings.enable3DEffect) {
            gameArea.classList.add('animate');
        } else {
            gameArea.classList.remove('animate');
        }
    }

    // Создание еды
    function createFood() {
        const foodType = Math.random() > 0.7 ? 'fruits' : 'vegetables';
        const foodArray = foodEmojis[foodType];
        food = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
            emoji: loadEmoji(foodArray[Math.floor(Math.random() * foodArray.length)]),
            type: foodType
        };
        console.log('Food created:', food);
    }

    // Добавляем переменные для мигающего числа
    let blinkingCount = 0;
    let blinkEndTime = 0;

    // Отрисовка игры
    function drawGame() {
        console.log('Drawing game...');
        
        // Очистка canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Отрисовка змеи
        snake.forEach((part, index) => {
            drawSnakePart(part, index);
        });
        
        // Отрисовка еды
        if (food) {
            drawFood();
        }

        // Отрисовка второй змеи
        if (snake2.length > 0) {
            snake2.forEach((part, index) => {
                drawSnakePart(part, index, 'snake2');
            });
        }

        // Если включена сетка, рисуем её
        if (settings.showGrid) {
            drawGrid();
        }

        // Если ещё активна анимация мигающего числа, рисуем её
        if (blinkingCount > 0 && Date.now() < blinkEndTime) {
            ctx.fillStyle = 'white';
            ctx.font = '50px Arial';
            ctx.fillText(blinkingCount, canvas.width / 2, 80);
        }
    }

    // Функция для рисования сетки
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for (let x = 0; x < canvas.width; x += box) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += box) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Обновленная функция отрисовки змейки с улучшенными формами
    function drawSnakePart(part, index, snakeId = 'snake1') {
        const isHead = index === 0;
        
        // Применение цвета из настроек
        ctx.fillStyle = settings.snakeColor;
        ctx.strokeStyle = '#000'; // Добавление обводки для лучшего визуального разделения

        // Применение формы змеи из настроек
        switch(settings.snakePattern) {
            case 'classic':
                ctx.fillRect(part.x, part.y, box - 2, box - 2);
                ctx.strokeRect(part.x, part.y, box - 2, box - 2);
                break;
            case 'round':
                ctx.beginPath();
                ctx.arc(part.x + box/2, part.y + box/2, (box - 2) / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            case 'rounded-rectangle':
                drawRoundedRect(part.x, part.y, box - 2, box - 2, 5);
                break;
            case 'ellipse':
                ctx.beginPath();
                ctx.ellipse(part.x + box/2, part.y + box/2, (box - 2) / 2, (box - 2) / 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            case 'custom':
                // Сплошной узор: заполненный прямоугольник без обводки
                ctx.fillRect(part.x, part.y, box, box);
                break;
            default:
                ctx.fillRect(part.x, part.y, box - 2, box - 2);
                ctx.strokeRect(part.x, part.y, box - 2, box - 2);
        }

        // Отрисовка головы змеи
        if (isHead) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(part.x + box/4, part.y + box/4, 3, 0, Math.PI * 2);
            ctx.arc(part.x + 3*box/4, part.y + box/4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Вспомогательная функция для рисования закругленных прямоугольников
    function drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Отрисовка еды с 3D-эффектом
    function drawFood() {
        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(food.x + box/2 + depth, food.y + box/2 + depth, box/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавление эффекта тени для яркого подсвечивания фруктов
        ctx.shadowColor = 'rgba(255, 255, 0, 1)'; // Увеличена непрозрачность
        ctx.shadowBlur = 60; // Увеличено с 40

        // Еда
        ctx.font = `${box}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, food.x + box/2, food.y + box/2);

        // Сброс эффектов тени
        ctx.shadowColor = 'transparent';
    }

    // Обновление игры
    function updateGame() {
        if (!isGameRunning) return;

        // Количество игроков
        const playersCount = document.getElementById('playersCount')
            ? parseInt(document.getElementById('playersCount').value)
            : 1;

        // При возвращении к одному игроку очищаем вторую змею
        if (playersCount !== 2 && snake2.length > 0) {
            snake2 = [];
        }

        // Обновление первой змейки
        const head = { ...snake[0] };
        
        switch(direction) {
            case 'right': head.x += box; break;
            case 'left': head.x -= box; break;
            case 'up': head.y -= box; break;
            case 'down': head.y += box; break;
        }

        // Проверка столкновений
        if (head.x < 0 || head.x >= canvas.width || 
            head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Проверка еды
        if (food && head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('score').textContent = score;
            playSound('eat');
            createFood();
        } else {
            snake.pop();
        }

        // Если один игрок, выходим из обработки второй змейки
        if (playersCount !== 2) {
            drawGame();
            return;
        }

        // Вторая змейка
        if (snake2.length === 0) {
            snake2 = [{ x: 30 * box, y: 10 * box }];
            direction2 = 'left';
        }
        const head2 = { ...snake2[0] };
        switch(direction2) {
            case 'left': head2.x -= box; break;
            case 'right': head2.x += box; break;
            case 'up': head2.y -= box; break;
            case 'down': head2.y += box; break;
        }
        if (head2.x < 0 || head2.x >= canvas.width || head2.y < 0 || head2.y >= canvas.height) {
            gameOver();
            return;
        }
        snake2.unshift(head2);
        if (food && head2.x === food.x && head2.y === food.y) {
            score2 += 10;
            document.getElementById('score2') ? document.getElementById('score2').textContent = score2 : null;
            playSound('eat');
            createFood();
        } else {
            snake2.pop();
        }

        drawGame();
    }

    // Управление
    document.addEventListener('keydown', (event) => {
        if (!isGameRunning) return;
        
        // Обработка клавиш для первого игрока
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowUp':
            case 'w':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowRight':
            case 'd':
                if (direction !== 'left') direction = 'right';
                break;
            case 'ArrowDown':
            case 's':
                if (direction !== 'up') direction = 'down';
                break;
        }
    });

    document.removeEventListener('keydown', secondPlayerKeys); // Убираем привязку клавиатуры для второй змейки

    document.addEventListener('mousemove', (event) => {
        // Примерный расчет угла от центра второй змейки к координате мыши
        // Получаем координаты головы второй змейки
        if (!snake2.length) return;
        const head2 = snake2[0];
        const dx = event.clientX - (canvas.offsetLeft + head2.x + box / 2);
        const dy = event.clientY - (canvas.offsetTop + head2.y + box / 2);
        // Определяем направление
        if (Math.abs(dx) > Math.abs(dy)) {
            direction2 = dx > 0 ? 'right' : 'left';
        } else {
            direction2 = dy > 0 ? 'down' : 'up';
        }
    });

    function secondPlayerKeys(event) {
        // ...был обработчик клавиш для второй змейки, теперь удалён...
    }

    // Изменение обработчика кнопок на одну кнопку управления
    const gameControlBtn = document.getElementById('gameControlBtn');

    gameControlBtn.addEventListener('click', () => {
        switch (gameControlBtn.textContent) {
            case 'Старт':
                startGame();
                gameControlBtn.textContent = 'Пауза';
                break;
            case 'Пауза':
                pauseGame();
                gameControlBtn.textContent = 'Продолжить';
                break;
            case 'Продолжить':
                resumeGame();
                gameControlBtn.textContent = 'Пауза';
                break;
            case 'Стоп':
                stopGame();
                gameControlBtn.textContent = 'Старт';
                break;
            default:
                gameControlBtn.textContent = 'Старт';
        }
    });

    // Обработчики новых кнопок
    const startStopBtn = document.getElementById('startStopBtn');
    const pauseResumeBtn = document.getElementById('pauseResumeBtn');

    startStopBtn.addEventListener('click', () => {
        if (startStopBtn.textContent === 'Старт') {
            startGame();
            startStopBtn.textContent = 'Стоп';
            pauseResumeBtn.disabled = false;
        } else {
            stopGame();
            startStopBtn.textContent = 'Старт';
            pauseResumeBtn.textContent = 'Пауза';
            pauseResumeBtn.disabled = true;
        }
    });

    pauseResumeBtn.addEventListener('click', () => {
        if (pauseResumeBtn.textContent === 'Пауза') {
            pauseGame();
            pauseResumeBtn.textContent = 'Продолжить';
        } else {
            resumeGame();
            pauseResumeBtn.textContent = 'Пауза';
        }
    });

    // Обновленные функции управления игрой
    function startGame() {
        if (!isGameRunning) {
            playSound('start'); // Воспроизведение звука старта
            showMessage('Готовимся к старту...', 3000);
            setTimeout(() => {
                console.log('Starting game...');
                isGameRunning = true;
                if (!food) createFood();
                const playersCount = document.getElementById('playersCount') 
                                     ? parseInt(document.getElementById('playersCount').value) 
                                     : 1;

                // Мигающий счётчик игроков на 2 секунды
                blinkingCount = playersCount;
                blinkEndTime = Date.now() + 2000;

                if (playersCount === 2) {
                    snake2 = [{ x: 30 * box, y: 10 * box }];
                    direction2 = 'left';
                    score2 = 0;
                }
                game = setInterval(updateGame, settings.speed);
                pauseResumeBtn.textContent = 'Пауза';

                // Запуск анимации 3D-вращения
                const gameArea = document.querySelector('.game-area');
                gameArea.classList.add('animate');
            }, 3000); // Отсчет 3 секунды
        }
    }

    function stopGame() {
        console.log('Stopping game...');
        isGameRunning = false;
        clearInterval(game);
        // Сброс кнопки паузы/продолжения
        pauseResumeBtn.textContent = 'Пауза';
        pauseResumeBtn.disabled = true;
        // Очистка змей и сброс счета
        snake = [{ x: 10 * box, y: 10 * box }];
        direction = 'right';
        score = 0;
        document.getElementById('score').textContent = '0';
        snake2 = [];
        score2 = 0;
        document.getElementById('score2') ? document.getElementById('score2').textContent = '0' : null;
        createFood();
        drawGame();

        // Остановить анимацию 3D-вращения
        const gameArea = document.querySelector('.game-area');
        gameArea.classList.remove('animate');
    }

    function pauseGame() {
        console.log('Pausing game...');
        isGameRunning = false;
        clearInterval(game);
        pauseResumeBtn.textContent = 'Продолжить';
    }

    function resumeGame() {
        console.log('Resuming game...');
        isGameRunning = true;
        game = setInterval(updateGame, settings.speed);
        pauseResumeBtn.textContent = 'Пауза';
    }

    // Удаление ненужных обработчиков кнопок
    // document.getElementById('startBtn').addEventListener('click', startGame);
    // document.getElementById('stopBtn').addEventListener('click', stopGame);
    // document.getElementById('resetBtn').addEventListener('click', resetGame)

    // Функция для отображения сообщений
    function showMessage(message, duration = 3000) {
        const messageOverlay = document.getElementById('messageOverlay');
        messageOverlay.textContent = message;
        messageOverlay.style.display = 'block';
        setTimeout(() => {
            messageOverlay.style.display = 'none';
        }, duration);
    }

    // Обновление функции startGame для добавления отсчета
    function startGame() {
        if (!isGameRunning) {
            playSound('start'); // Воспроизведение звука старта
            showMessage('Готовимся к старту...', 3000);
            setTimeout(() => {
                console.log('Starting game...');
                isGameRunning = true;
                if (!food) createFood();
                const playersCount = document.getElementById('playersCount') 
                                     ? parseInt(document.getElementById('playersCount').value) 
                                     : 1;

                // Мигающий счётчик игроков на 2 секунды
                blinkingCount = playersCount;
                blinkEndTime = Date.now() + 2000;

                if (playersCount === 2) {
                    snake2 = [{ x: 30 * box, y: 10 * box }];
                    direction2 = 'left';
                    score2 = 0;
                }
                game = setInterval(updateGame, settings.speed);
                document.getElementById('startBtn').disabled = true;
                document.getElementById('stopBtn').disabled = false;

                // Запуск анимации 3D-вращения
                const gameArea = document.querySelector('.game-area');
                gameArea.classList.add('animate');
            }, 3000); // Отсчет 3 секунды
        }
    }

    function stopGame() {
        console.log('Stopping game...');
        isGameRunning = false;
        clearInterval(game);
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }

    function resetGame() {
        console.log('Resetting game...');
        stopGame();
        snake = [{ x: 10 * box, y: 10 * box }];
        direction = 'right';
        score = 0;
        document.getElementById('score').textContent = '0';
        createFood();
        drawGame();
    }

    function gameOver() {
        playSound('gameOver');
        stopGame();
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText('GAME OVER!', canvas.width/3, canvas.height/2);
        showMessage('Игра окончена!', 3000);
    }

    // Функция для обновления настроек
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        if (newSettings.sound !== undefined) {
            soundEnabled = newSettings.sound;
        }
        if (newSettings.theme) {
            currentTheme = newSettings.theme;
        }
        if (newSettings.snakePattern) {
            settings.snakePattern = newSettings.snakePattern;
        }
        if (newSettings.gridSize) {
            settings.gridSize = newSettings.gridSize;
            box = settings.gridSize;
            canvas.width = settings.gridSize * 40; // Пример изменения размера холста
            canvas.height = settings.gridSize * 30;
            resetGame();
        }
        if (newSettings.gameDifficulty) {
            switch(newSettings.gameDifficulty) {
                case 'easy':
                    settings.speed = 1000 / 15;
                    break;
                case 'medium':
                    settings.speed = 1000 / 25;
                    break;
                case 'hard':
                    settings.speed = 1000 / 35;
                    break;
            }
            if (isGameRunning) {
                clearInterval(game);
                game = setInterval(updateGame, settings.speed);
            }
        }
        if (newSettings.enable3DEffect !== undefined) {
            settings.enable3DEffect = newSettings.enable3DEffect;
        }
        
        if (isGameRunning) {
            clearInterval(game);
            game = setInterval(updateGame, settings.speed);
        }

        // Применение новых настроек
        applySettings();
    }

    // Обработка изменений настроек из UI
    document.getElementById('settingsForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const speed = parseInt(document.getElementById('speed').value);
        const snakeColor = document.getElementById('snakeColor').value;
        const backgroundImage = document.getElementById('backgroundImage').value;
        const snakePattern = document.getElementById('snakePattern').value;
        const gridSize = parseInt(document.getElementById('gridSize').value);
        const gameDifficulty = document.getElementById('gameDifficulty').value;
        const enable3DEffect = true; // Включение 3D-эффекта по умолчанию
        updateSettings({ 
            speed: 1000 / speed,
            snakeColor, 
            backgroundImage,
            theme: currentTheme,
            snakePattern,
            gridSize,
            gameDifficulty,
            enable3DEffect
        });
        // Закрытие панели настроек
        document.getElementById('settingsPanel').style.display = 'none';
    });

    // Обработчик изменения языка
    document.getElementById('language').addEventListener('change', function() {
        const lang = this.value;
        if (lang === 'ru') {
            document.getElementById('player1-label').textContent = 'Игрок:';
            document.getElementById('player2-label').textContent = 'Играки:';
            // Добавьте другие переводы при необходимости
        } else if (lang === 'en') {
            document.getElementById('player1-label').textContent = 'Player:';
            document.getElementById('player2-label').textContent = 'Players:';
            // Добавьте другие переводы при необходимости
        }
    });

    // Инициализация игры
    console.log('Initializing game...');
    resetGame();
    applySettings();
});

// Обработка ошибок
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError:', error);
    return false;
};