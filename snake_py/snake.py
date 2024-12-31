import pygame
import random
import math
from pygame import gfxdraw

pygame.init()
width = 800
height = 600
window = pygame.display.set_mode((width, height))
pygame.display.set_caption("3D Snake Game - Python")

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
DARK_GREEN = (0, 100, 0)
YELLOW = (255, 255, 0)  # Добавлен цвет для фруктов

# Game settings
snake_block = 20
snake_speed = 15

# 3D Settings
perspective = 50
depth = 5

# Инициализация звуков
pygame.mixer.init()

# Обновление путей к звуковым файлам на формат MP3
snake_sound_assets = {
    'eat': 'sounds/eat.mp3',
    'game_over': 'sounds/game_over.mp3'
}

# Функция для воспроизведения звуков
def play_sound(sound_key):
    if sound_enabled:
        pygame.mixer.music.load(snake_sound_assets[sound_key])
        pygame.mixer.music.play()

def draw_3d_cube(surface, x, y, size, color):
    pygame.draw.rect(surface, color, [x, y, size, size])
    
    # Right face
    # Right face
    points = [
        (x + size, y),
        (x + size + depth, y + depth),
        (x + size + depth, y + size + depth),
        (x + size, y + size)
    ]
    pygame.draw.polygon(surface, DARK_GREEN, points)
    
    # Bottom face
    points = [
        (x, y + size),
        (x + depth, y + size + depth),
        (x + size + depth, y + size + depth),
        (x + size, y + size)
    ]
    pygame.draw.polygon(surface, DARK_GREEN, points)

def our_snake(snake_block, snake_list):
    for i, x in enumerate(snake_list):
        if i == 0:
            color = YELLOW  # Цвет головы змеи
        else:
            color = DARK_GREEN
        draw_3d_cube(window, x[0], x[1], snake_block, color)

def message(msg, color):
    font = pygame.font.SysFont('arial', 50)
    mesg = font.render(msg, True, color)
    window.blit(mesg, [width/6, height/3])

def gameOver():
    play_sound('game_over')
    stopGame()
    window.fill(BLACK)  # Можно изменить на прозрачный или другой цвет, если требуется
    message("GAME OVER! Press Q-Quit or C-Play Again", WHITE)
    pygame.display.update()

def gameLoop():
    game_over = False
    game_close = False

    x1 = width / 2
    y1 = height / 2

    x1_change = 0
    y1_change = 0

    snake_List = []
    Length_of_snake = 1

    foodx = round(random.randrange(0, width - snake_block) / snake_block) * snake_block
    foody = round(random.randrange(0, height - snake_block) / snake_block) * snake_block

    clock = pygame.time.Clock()

    while not game_over:
        while game_close:
            window.fill(BLACK)
            message("Game Over! Press Q-Quit or C-Play Again", WHITE)
            pygame.display.update()

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q:
                        game_over = True
                        game_close = False
                    if event.key == pygame.K_c:
                        gameLoop()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_over = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    x1_change = -snake_block
                    y1_change = 0
                elif event.key == pygame.K_RIGHT:
                    x1_change = snake_block
                    y1_change = 0
                elif event.key == pygame.K_UP:
                    y1_change = -snake_block
                    x1_change = 0
                elif event.key == pygame.K_DOWN:
                    y1_change = snake_block
                    x1_change = 0

        if x1 >= width or x1 < 0 or y1 >= height or y1 < 0:
            game_close = True

        x1 += x1_change
        y1 += y1_change
        window.fill(BLACK)
        
        # Draw 3D food
        draw_3d_cube(window, foodx, foody, snake_block, RED)

        snake_Head = []
        snake_Head.append(x1)
        snake_Head.append(y1)
        snake_List.append(snake_Head)
        
        if len(snake_List) > Length_of_snake:
            del snake_List[0]

        for x in snake_List[:-1]:
            if x == snake_Head:
                game_close = True

        our_snake(snake_block, snake_List)
        
        # Draw score
        font = pygame.font.SysFont('arial', 30)
        score = font.render(f"Score: {Length_of_snake - 1}", True, WHITE)
        window.blit(score, [10, 10])

        pygame.display.update()

        if x1 == foodx and y1 == foody:
            play_sound('eat')
            foodx = round(random.randrange(0, width - snake_block) / snake_block) * snake_block
            foody = round(random.randrange(0, height - snake_block) / snake_block) * snake_block

            Length_of_snake += 1

        clock.tick(snake_speed)

    pygame.quit()
    quit()

if __name__ == "__main__":
    gameLoop()

# Если Python-версия больше не нужна, удалите этот файл.
# В противном случае, оставьте его без изменений.
