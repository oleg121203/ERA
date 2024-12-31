import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  Box, 
  ThemeProvider, 
  createTheme, 
  Tabs, 
  Tab,
  Switch, 
  FormControlLabel,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import ErrorDetails from './ErrorDetails'; // Убедитесь, что путь правильный и компонент экспортируется корректно
import ErrorList from './ErrorList'; // Убедитесь, что путь правильный и компонент экспортируется корректно
import Logs from './Logs';
import Charts from './Charts'; // Убедитесь, что путь правильный и компонент экспортируется корректно
import Console from './Console'; // Убедитесь, что путь правильный и компонент экспортируется корректно
import axios from 'axios';
import CopilotPanel from './components/CopilotPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
  },
});

function App() {
  const [tab, setTab] = React.useState(0);
  const [autoFix, setAutoFix] = useState(true); // Установите начальное значение в true
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  // Добавляем обработчик для переключателя автофикса с дополнительным логированием
  const handleAutoFixChange = async (event) => {
    const enabled = event.target.checked;
    setAutoFix(enabled);
    console.log(`Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`); // Логирование изменений
    try {
      await axios.post('/auto-fix', { enabled });
      setNotification({
        open: true,
        message: `Автоматичне виправлення ${enabled ? 'увімкнено' : 'вимкнено'}`,
        type: 'info'
      });
    } catch (err) {
      console.error('Ошибка при изменении режима автширования:', err); // Логирование ошибки
      setNotification({
        open: true,
        message: 'Помилка при зміні режиму автовиправлення',
        type: 'error'
      });
    }
  };

  useEffect(() => {
    // Установите начальное значение автофикса на сервере
    axios.post('/auto-fix', { enabled: true })
      .then(() => {
        console.log('Автоматичне виправлення увімкнено');
      })
      .catch(err => {
        console.error('Помилка при встановленні авто виправлення:', err);
        setNotification({
          open: true,
          message: 'Помилка при встановленні авто виправлення',
          type: 'error'
        });
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ backdropFilter: 'blur(20px)' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Error Fix AI Assistant
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoFix}
                  onChange={handleAutoFixChange}
                  color="secondary"
                />
              }
              label="Автоматичне виправлення"
            />
          </Toolbar>
          <Tabs value={tab} onChange={handleChange} centered>
            <Tab label="Errors" />
            <Tab label="Logs" />
            <Tab label="Charts" />
            <Tab label="Console" />
            <Tab label="Copilot" />
          </Tabs>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            {tab === 0 && (
              <>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 4
                  }}
                >
                  Виявлені помилки
                </Typography>
                <ErrorList />
                <ErrorDetails />
              </>
            )}
            {tab === 1 && <Logs />}
            {tab === 2 && <Charts />}
            {tab === 3 && <Console />}
            {tab === 4 && <CopilotPanel />}
          </Box>
        </Container>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <MuiAlert severity={notification.type} elevation={6} variant="filled">
            {notification.message}
          </MuiAlert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;