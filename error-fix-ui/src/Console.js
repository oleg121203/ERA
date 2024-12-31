import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, IconButton, Stack } from '@mui/material';
import { Clear, Save, PlayArrow, Pause, Fullscreen, FullscreenExit, Terminal } from '@mui/icons-material';

const ConsoleWindow = ({ 
  title, 
  logs, 
  onClear, 
  onSave, 
  onPause, 
  isPaused, 
  isFullscreen,
  onFullscreen,
  color = '#6bff6b' 
}) => (
  <Paper 
    elevation={3} 
    sx={{ 
      height: isFullscreen ? '90vh' : '45vh',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? '50%' : 'auto',
      left: isFullscreen ? '50%' : 'auto',
      transform: isFullscreen ? 'translate(-50%, -50%)' : 'none',
      width: isFullscreen ? '90vw' : 'auto',
      zIndex: isFullscreen ? 9999 : 1,
      backgroundColor: '#1e1e1e',
      color: '#fff',
      p: 2,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#2e2e2e',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#666',
        borderRadius: '4px',
      }
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      mb: 1,
      position: 'sticky',
      top: 0,
      backgroundColor: '#1e1e1e',
      zIndex: 2,
      borderBottom: '1px solid #333'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Terminal sx={{ color }} />
        <Typography variant="h6" sx={{ color }}>{title}</Typography>
      </Box>
      <Box>
        <IconButton size="small" onClick={onPause} sx={{ color: '#fff' }}>
          {isPaused ? <PlayArrow /> : <Pause />}
        </IconButton>
        <IconButton size="small" onClick={onSave} sx={{ color: '#fff' }}>
          <Save />
        </IconButton>
        <IconButton size="small" onClick={onClear} sx={{ color: '#fff' }}>
          <Clear />
        </IconButton>
        <IconButton size="small" onClick={onFullscreen} sx={{ color: '#fff' }}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>
    </Box>
    <Box 
      sx={{ 
        height: 'calc(100% - 48px)',
        overflowY: 'auto',
        scrollBehavior: 'smooth'
      }}
    >
      {logs.length === 0 ? (
        <Box sx={{ 
          color: '#666', 
          fontStyle: 'italic', 
          textAlign: 'center',
          mt: 2 
        }}>
          Немає логів для відображення
        </Box>
      ) : (
        logs.map((log, index) => (
          <Box 
            key={index} 
            sx={{ 
              fontFamily: 'Consolas, monospace',
              fontSize: '0.9rem',
              padding: '2px 0',
              color: log.type === 'error' ? '#ff6b6b' : 
                     log.type === 'warning' ? '#ffd93d' : 
                     log.type === 'success' ? '#6bff6b' : color,
              borderBottom: '1px solid #333'
            }}
          >
            [{log.timestamp}] {log.message}
          </Box>
        ))
      )}
    </Box>
  </Paper>
);

function Console() {
  const [backendLogs, setBackendLogs] = useState([]);
  const [frontendLogs, setFrontendLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [backendFullscreen, setBackendFullscreen] = useState(false);
  const [frontendFullscreen, setFrontendFullscreen] = useState(false);
  const backendRef = useRef(null);
  const frontendRef = useRef(null);

  // Автоматическая прокрутка
  const scrollToBottom = (ref) => {
    if (ref.current && !isPaused) {
      const scrollContainer = ref.current.querySelector('[role="log"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    // Измените URL на относительный путь
    const source = new EventSource('/events');
    
    source.onopen = () => {
      if (isMounted) {
        setBackendLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'З\'єднання з сервером встановлено',
          type: 'success'
        }]);
      }
    };
  
    source.onerror = () => {
      if (isMounted) {
        setBackendLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Помилка з\'єднання з сервером',
          type: 'error'
        }]);
      }
    };
  
    source.onmessage = (event) => {
      if (isMounted) {
        try {
          const data = JSON.parse(event.data);
          setBackendLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            message: data.message,
            type: data.type
          }]);
        } catch (err) {
          console.error('Помилка при обробці повідомлення:', err);
        }
      }
    };
  
    return () => {
      isMounted = false;
      source.close();
    };
  }, []);

  useEffect(() => {
    // Отслеживание событий фронтенда
    const originalConsole = { ...console };
    console.log = (...args) => {
      setFrontendLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: args.join(' '),
        type: 'info'
      }]);
      originalConsole.log(...args);
    };
    console.error = (...args) => {
      setFrontendLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: args.join(' '),
        type: 'error'
      }]);
      originalConsole.error(...args);
    };
    console.warn = (...args) => {
      setFrontendLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: args.join(' '),
        type: 'warning'
      }]);
      originalConsole.warn(...args);
    };

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      scrollToBottom(backendRef);
      scrollToBottom(frontendRef);
    }
  }, [backendLogs, frontendLogs, isPaused, scrollToBottom]);

  const saveLogs = (logs, type) => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-fix-${type}-logs-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <Stack spacing={2}>
      <div ref={backendRef}>
        <ConsoleWindow
          title="Backend Console"
          logs={backendLogs}
          onClear={() => setBackendLogs([])}
          onSave={() => saveLogs(backendLogs, 'backend')}
          onPause={() => setIsPaused(!isPaused)}
          isPaused={isPaused}
          isFullscreen={backendFullscreen}
          onFullscreen={() => setBackendFullscreen(!backendFullscreen)}
          color="#6bff6b"
        />
      </div>
      <div ref={frontendRef}>
        <ConsoleWindow
          title="Frontend Console"
          logs={frontendLogs}
          onClear={() => setFrontendLogs([])}
          onSave={() => saveLogs(frontendLogs, 'frontend')}
          onPause={() => setIsPaused(!isPaused)}
          isPaused={isPaused}
          isFullscreen={frontendFullscreen}
          onFullscreen={() => setFrontendFullscreen(!frontendFullscreen)}
          color="#ff9f43"
        />
      </div>
    </Stack>
  );
}

export default Console;
