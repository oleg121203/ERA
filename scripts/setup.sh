#!/bin/bash

# Функція для налаштування командного рядка
setup_prompt() {
    local bashrc_path="$HOME/.bashrc"
    
    # Перевіряємо, чи існує .bashrc, якщо ні — створюємо
    if [ ! -f "$bashrc_path" ]; then
        touch "$bashrc_path"
        echo "✓ Створено файл .bashrc"
    fi

    local prompt_config='

# Налаштування командного рядка
random_color() {
    local colors=("31" "32" "33" "34" "35" "36" "91" "92" "93" "94" "95" "96")
    local index=$((RANDOM % ${#colors[@]}))
    echo "${colors[$index]}"
}

export PS1="\[\e[1;34m\]DEV (\[\e[1;35m\]\u\[\e[1;34m\])\[\e[0m\] \[\e[1;\$(random_color)m\]ERA \[\e[1;32m\](\$(if git rev-parse --git-dir > /dev/null 2>&1; then git branch 2>/dev/null | sed -n -e '"'"'s/^\* \(.*\)/\1/p'"'"'; fi))\[\e[0m\] \$ "
'

    # Видаляємо старі налаштування PS1, якщо вони існують
    sed -i '/export PS1=/d' "$bashrc_path"

    # Додаємо нові налаштування
    echo "$prompt_config" >> "$bashrc_path"
    echo "✓ Налаштування командного рядка оновлено в .bashrc"
}

# Викликаємо функцію для налаштування командного рядка
setup_prompt

echo "✓ Налаштування командного рядка завершено"