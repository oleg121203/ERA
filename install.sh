#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Starting installation process..."

# Установка node.js зависимостей если есть package.json
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install 2> npm_errors.log
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Node.js dependencies installed successfully!${NC}"
    else
        echo -e "${RED}Error installing Node.js dependencies! Check npm_errors.log${NC}"
        cat npm_errors.log
    fi
fi

# Проверка наличия фоновых изображений
if [ ! -f "./snake_js/background.jpg" ]; then
    echo -e "${RED}Файл background.jpg отсутствует! Пожалуйста, добавьте его в папку snake_js.${NC}"
    # Создание дефолтного фона, если ImageMagick установлен
    if command -v convert &> /dev/null; then
        echo "Создание дефолтного фона..."
        convert -size 800x600 xc:"#ffffff" ./snake_js/background.jpg
        echo -e "${GREEN}Дефолтный фон создан.${NC}"
    else
        echo -e "${RED}ImageMagick не установлен. Установите его или добавьте background.jpg вручную.${NC}"
    fi
fi

# Обновленные пути к фоновых изображениям
cp ./snake_js/assets/background2.jpg ./snake_js/background2.jpg 2>/dev/null || echo -е "${RED}Файл background2.jpg не найден в папке snake_js/assets!${NC}"
cp ./snake_js/assets/background3.jpg ./snake_js/background3.jpg 2>/dev/null || echo -е "${RED}Файл background3.jpg не найден в папке snake_js/assets!${NC}"

echo -е "${GREEN}Background images copied successfully!${NC}"

# Копирование звуковых файлов в формате MP3 в snake_js/sounds
mkdir -p ./snake_js/sounds
cp ./snake_js/assets/eat.mp3 ./snake_js/sounds/eat.mp3 2>/dev/null || echo -е "${RED}Файл eat.mp3 не найден в папке snake_js/assets!${NC}"
cp ./snake_js/assets/game_over.mp3 ./snake_js/sounds/game_over.mp3 2>/dev/null || echo -е "${RED}Файл game_over.mp3 не найден в папке snake_js/assets!${NC}"

echo -е "${GREEN}Sound files copied to snake_js/sounds successfully!${NC}"

# Создание скриптов запуска
echo "Creating launch scripts..."

# JavaScript версия
cat > start_js.sh << 'EOF'
#!/bin/bash
cd snake_js
python -m http.server 3000
EOF

chmod +x start_js.sh

echo -е "${GREEN}Installation complete!${NC}"
echo "To start JavaScript version: ./start_js.sh"
