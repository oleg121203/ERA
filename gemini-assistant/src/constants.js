const ANALYSIS_TYPES = {
  '--basic': {
    name: 'Базовый анализ',
    desc: 'Синтаксис, стиль, форматирование',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--security': {
    name: 'Анализ безопасности',
    desc: 'Уязвимости, инъекции, проверки',
    metrics: {
      confidence: {
        CERTAIN: 95,
        LIKELY: 85,
        POSSIBLE: 70
      },
      impact: {
        CRITICAL: 90,
        HIGH: 80,
        MEDIUM: 60
      },
      priority: {
        IMMEDIATE: 90,
        HIGH: 80,
        MEDIUM: 60
      }
    }
  },
  '--perf': {
    name: 'Производительность',
    desc: 'Оптимизация, утечки памяти',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--imports': {
    name: 'Анализ импортов',
    desc: 'Зависимости, циклические ссылки',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--complexity': {
    name: 'Сложность кода',
    desc: 'Цикломатическая сложность',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--tests': {
    name: 'Анализ тестов',
    desc: 'Покрытие, качество тестов',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--docs': {
    name: 'Документация',
    desc: 'JSDoc, комментарии',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--structure': {
    name: 'Структура', 
    desc: 'Архитектура, паттерны',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  },
  '--all': {
    name: 'Полный анализ',
    desc: 'Все типы проверок',
    metrics: {
      confidence: {
        CERTAIN: 90,
        LIKELY: 75,
        POSSIBLE: 60
      },
      impact: {
        CRITICAL: 80,
        HIGH: 70,
        MEDIUM: 50
      },
      priority: {
        IMMEDIATE: 85,
        HIGH: 70,
        MEDIUM: 50
      }
    }
  }
};

module.exports = { ANALYSIS_TYPES };
