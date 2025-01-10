#!/bin/bash

# Функція для налаштування командного рядка
setup_prompt() {
    local bashrc_path="$HOME/.bashrc"
    local prompt_config='

# Налаштування командного рядка
export PS1="\[\e[1;34m\]DEV (\[\e[1;35m\]\u\[\e[1;34m\])\[\e[0m\] \[\e[1;33m\]/workspaces/ERA \[\e[1;32m\](\$(git branch 2>/dev/null | grep '"'"'^*'"'"' | colrm 1 2))\[\e[0m\] \$ "
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