const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4001; // Фиксированный порт

const allowedOrigins = (process.env.NODE_ENV === 'development') ?  // Dynamic allowed origins
  [
    'http://localhost:3000',  // Your frontend dev server URL (adjust as needed)
    'http://localhost:4002', // Add any other development URLs here
  ] :
  [
    'https://era-frontend.vercel.app' // Your production frontend URL
  ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {  // Allow requests from allowed origins or no origin
      callback(null, true);  // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject requests from other origins
    }
  },
  credentials: true  // Required if sending cookies or authorization headers
}));

app.use(bodyParser.json());

let errors = [];
let clients = [];
let autoFixEnabled = true; // Установите начальное значение в true

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;
let processQueue = [];
let isProcessing = false;

// Функция для логирования с отправкой на фронтенд
function log(message, type = 'info') {
  const logMessage = {
    type,
    message,
    timestamp: new Date().toLocaleString('uk-UA')
  };
  console.log(`[${logMessage.timestamp}] ${message}`);
  sendEventToAll(logMessage);
}

// Перехват console.log, console.warn, console.error, чтобы отсылать подробные логи в SSE
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog(...args);
  sendEventToAll({
    type: 'log',
    message: args.join(' '),
    timestamp: new Date().toLocaleString('uk-UA')
  });
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  originalConsoleWarn(...args);
  sendEventToAll({
    type: 'warning',
    message: args.join(' '),
    timestamp: new Date().toLocaleString('uk-UA')
  });
};

const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  sendEventToAll({
    type: 'error',
    message: args.join(' '),
    timestamp: new Date().toLocaleString('uk-UA')
  });
};

// Функция для получения ошибок из файлов проекта
async function getProjectErrors() {
  // Логирование текущего состояния авто-виправлення
  log(`Статус авто-виправлення: ${autoFixEnabled}`, 'info');

  const projectPath = '/workspaces/ERA'; // Укажите путь к вашему проекту
  const errorFiles = [];

  function readDirRecursive(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        // Пропускаем node_modules и .git директории
        if (filePath.includes('node_modules') || filePath.includes('.git')) {
          return;
        }
        
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          readDirRecursive(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          // Проверяем содержимое файла на наличие ошибок
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes('error') || content.includes('Error') || content.includes('catch') || content.includes('throw')) {
            errorFiles.push(filePath);
          }
        }
      });
    } catch (err) {
      console.error(`Ошибка при чтении директории ${dir}:`, err);
      log(`Ошибка при чтении директории ${dir}: ${err.message}`, 'error');
    }
  }

  readDirRecursive(projectPath);

  errors = errorFiles.map((file, index) => ({
    id: index + 1,
    message: `Виявлено потенційну помилку у файлі ${path.basename(file)}`,
    file,
    severity: Math.random() > 0.5 ? 'high' : 'medium',
    timestamp: new Date().toLocaleString('uk-UA')
  }));

  log(`Найдено ${errors.length} потенциальных ошибок`, 'info');

  if (autoFixEnabled && errors.length > 0) { // Проверка состояния авто-виправлення
    sendEventToAll({
      type: 'info',
      message: `Автоматичне виправлення ${errors.length} помилок...`
    });
    log(`Автоматичне виправлення ${errors.length} помилок...`, 'info');

    for (const error of errors) {
      await fixError(error);
    }
  } else {
    log('Автоматичне виправлення отключено или нет ошибок для исправления', 'info');
  }
}

// Обновленный URL API Generative Language
const GENERATIVE_API_URL = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText`;

// Обновленный функции fixError с правильным URL
async function fixError(error, retryCount = 0) {
  try {
    log(`Спроба ${retryCount + 1}/${MAX_RETRIES} виправлення помилки у файлі: ${error.file}`);

    const fileContent = fs.readFileSync(error.file, 'utf-8');
    
    const response = await axios.post(
      GENERATIVE_API_URL,
      {
        prompt: `Fix this code and explain the fix:\n${fileContent}`,
        maxOutputTokens: 1024,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GENERATIVE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Логирование полного ответа для диагностики
    log(`Ответ API: ${JSON.stringify(response.data)}`, 'info');

    if (response.data?.candidates?.[0]?.content) {
      const fixedCode = response.data.candidates[0].content;
      const backupPath = `${error.file}.backup`;
      
      // Используем sudo для записи файлов
      require('child_process').execSync(`echo ${process.env.SUDO_PASSWORD} | sudo -S cp "${error.file}" "${backupPath}"`);
      fs.writeFileSync(error.file, fixedCode);
      
      log(`Файл ${error.file} виправлено успішно`, 'success');
      return true;
    }
    throw new Error('Відповідь API не містить виправленого коду');
  } catch (err) {
    log(`Помилка при виправленні ${error.file}: ${err.message}`, 'error');
    
    if (retryCount < MAX_RETRIES - 1) {
      log(`Очікування ${RETRY_DELAY/1000} секунд перед наступною спробою...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fixError(error, retryCount + 1);
    }
    
    log(`Досягнуто максимальну кількість спроб для ${error.file}`, 'error');
    return false;
  }
}

async function processNextError() {
  if (!processQueue.length || isProcessing) return;
  
  isProcessing = true;
  const error = processQueue[0];
  
  const success = await fixError(error);
  if (success || error.retryCount >= MAX_RETRIES) {
    processQueue.shift();
  } else {
    error.retryCount = (error.retryCount || 0) + 1;
  }
  
  isProcessing = false;
  processNextError();
}

// Обновление интервала для асинхронной функции
setInterval(async () => {
  if (!isProcessing) {
    try {
      await getProjectErrors();
      log(`Знайдено ${errors.length} потенційних помилок`);
      processQueue = [...errors];
      processNextError();
    } catch (err) {
      log('Помилка при скануванні файлів', 'error');
    }
  }
}, 10000);

app.get('/errors', (req, res) => {
  res.json(errors);
});

// Обновленный эндпоинт для логов
app.get('/logs', (req, res) => {
  const logs = [
    { 
      timestamp: new Date().toLocaleString('uk-UA'),
      level: 'info',
      message: 'Сервер запущено'
    },
    { 
      timestamp: new Date().toLocaleString('uk-UA'),
      level: 'info',
      message: 'Обробка помилок розпочата'
    },
    {
      timestamp: new Date().toLocaleString('uk-UA'),
      level: 'warning',
      message: `Знайдено ${errors.length} помилок`
    }
  ];
  res.json(logs);
});

// Обновленный эндпоинт для данных графика
app.get('/chart-data', (req, res) => {
  // Получаем последние 7 дней
  const dates = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('uk-UA');
  }).reverse();

  // Генерируем случайные данные для графика
  const errorCounts = Array.from({length: 7}, () => 
    Math.floor(Math.random() * 10)
  );

  res.json({
    labels: dates,
    errors: errorCounts
  });
});

// Добавляем SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const client = {
    id: Date.now(),
    response: res
  };

  clients.push(client);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== client.id);
  });
});

function sendEventToAll(event) {
  clients.forEach(client => {
    client.response.write(`data: ${JSON.stringify(event)}\n\n`);
  });
}

// Добавляем endpoint для управления автоисправлением
app.post('/auto-fix', (req, res) => {
  const { enabled } = req.body;
  autoFixEnabled = enabled;
  log(`Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`, 'info'); // Логирование изменений
  sendEventToAll({
    type: 'info',
    message: `Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`
  });
  res.json({ status: 'success' });
});

// Обновляем URL и конфигурацию для Copilot API
const COPILOT_API_URL = process.env.COPILOT_API_URL || 'https://api.github.com/copilot/v1/chat';
const COPILOT_API_KEY = process.env.COPILOT_API_KEY;

// Добавляем middleware для проверки API ключа
app.use('/api/copilot', (req, res, next) => {
    if (!COPILOT_API_KEY) {
        return res.status(500).json({ error: 'API ключ не налаштований' });
    }
    next();
});

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers.authorization?.split(' ')[1];

  // Check if the provided API key matches the expected one
  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.error("Incorrect API key:", apiKey); // Log the incorrect key for debugging
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply middleware to protected routes
app.post('/fix-error', authMiddleware, async (req, res) => {
  const { errorId } = req.body;
  const error = errors.find((err) => err.id === errorId);
  if (error) {
    try {
      // Замените на вызов API вашего нового AI провайдера
      const response = await axios.post('your_new_ai_api_endpoint', { /*... данные запроса ...*/ });
      // ... обработка ответа
      res.json({ status: 'success', fixedCode: response.data.fixedCode, explanation: response.data.explanation });
    } catch (err) {
      console.error('Ошибка при вызове нового AI API:', err);
      res.status(500).json({ status: 'fail', message: 'Ошибка при вызове нового AI API.' });
    }
  } else {
    res.status(404).json({ status: 'fail', message: 'Ошибка не найдена.' });
  }
});

app.post('/auto-fix', authMiddleware, async (req, res) => {
  const { enabled } = req.body;
  autoFixEnabled = enabled;
  log(`Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`, 'info');
  sendEventToAll({
    type: 'info',
    message: `Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`,
  });
  res.json({ status: 'success' });
});

app.post('/api/copilot', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      COPILOT_API_URL,
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${COPILOT_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Error-Fix-Assistant'
        }
      }
    );
    res.json({ response: response.data });
  } catch (error) {
    console.error('Copilot API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.status === 401 ? 'Unauthorized: Check API key' : error.message,
      details: error.response?.data
    });
  }
});

app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
  sendEventToAll({
    type: 'info',
    message: 'Сервер запущено та готовий до роботи'
  });
});

// Добавляем root-права для процесса
process.on('SIGUSR1', () => {
  require('child_process').execSync(`echo ${process.env.SUDO_PASSWORD} | sudo -S chmod -R 777 /workspaces/ERA`);
  log('Root права надано', 'success');
});
