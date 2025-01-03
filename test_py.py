import os
import subprocess

import requests


def run_command(command, description):
    print(f"--- {description} ---")
    try:
        result = subprocess.run(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60,
        )
        print(result.stdout)
        if result.returncode != 0:
            print(f"Ошибка: {result.stderr}")
    except subprocess.TimeoutExpired:
        print(f"Таймаут выполнения команды: {command}")


def main():
    # 1. Проверка файла .env
    print("Проверка файла .env...")
    if os.path.isfile(".env"):
        with open(".env", "r") as f:
            env_content = f.read()
        print("Файл .env найден. Содержимое:")
        print(env_content)
    else:
        print("Файл .env не найден.")
        return

    # 2. Проверка переменной окружения GEMINI_API_KEY
    print("Проверка переменной окружения GEMINI_API_KEY...")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY не установлено.")
    else:
        print(f"GEMINI_API_KEY установлено: {'*' * (len(api_key)-4)}{api_key[-4:]}")

    # 3. Проверка конфигурационного файла gemini.config.js
    config_path = "src/config/gemini.config.js"
    print(f"Проверка файла {config_path}...")
    if os.path.isfile(config_path):
        with open(config_path, "r") as f:
            config_content = f.read()
        print(f"Файл {config_path} найден. Содержимое:")
        print(config_content)
    else:
        print(f"Файл {config_path} не найден.")
        return

    # 4. Проверка API ключа с помощью requests с таймаутом
    if api_key:
        print("Тестирование API ключа с помощью requests...")
        params = {"key": api_key}
        try:
            response = requests.get(
                "https://generativelanguage.googleapis.com/v1beta/models",
                params=params,
                timeout=10,
            )
            if response.status_code == 200:
                print("API ключ действителен.")
            else:
                print(
                    f"Ошибка: API ключ недействителен или запрос не прошел. Код ответа: {response.status_code}"
                )
                print(f"Ответ: {response.text}")
        except requests.exceptions.Timeout:
            print("Ошибка: Запрос к API превысил время ожидания.")
        except requests.exceptions.RequestException as e:
            print(f"Ошибка: {e}")

    # 5. Установка зависимостей
    run_command("npm install", "Установка зависимостей...")

    # 6. Обновление npm до последней версии
    run_command("npm install -g npm@11.0.0", "Обновление npm до последней версии...")

    # 7. Проверка версий Node.js и npm
    run_command("node -v", "Проверка версии Node.js:")
    run_command("npm -v", "Проверка версии npm:")
    run_command(
        "npm list @google/generative-ai", "Проверка версии @google/generative-ai:"
    )

    # 8. Запуск анализа с отладкой
    analyze_command = (
        "node src/main.js analyze scripts/project-structure.ts "
        "--types=security:confidence=90:impact=80:priority=85,performance:confidence=85:impact=75:priority=80 "
        "--fix=80 "
        "--auto-apply "
        "--format "
        "--debug"
    )
    run_command(analyze_command, "Запуск анализа с отладкой...")


if __name__ == "__main__":
    main()
