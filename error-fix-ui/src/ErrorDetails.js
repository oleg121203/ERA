import React, { useState } from 'react';
import React, { useState } from 'react'; // Импортируем React только один раз
# ...existing code...

# ...existing code...
import apiClient from './apiClient'; // Исправленный путь
# ...existing code...
import React, { useState } from 'react'; // Импортируем React только один раз
import apiClient from './apiClient'; // Исправленный путь
import { 
  Box,
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoFixHigh, Close } from '@mui/icons-material';

function ErrorDetails({ error, onFix }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fixError = async () => {
    try {
      setLoading(true);
      await apiClient.post('/fix-error', { errorId: error.id }); // Используем apiClient
      setSuccess(true);
      setTimeout(() => {
        onFix(error.id);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Ошибка авторизации: ', err.message);
        // Обработка ошибки авторизации
      } else {
        setErrorMsg('Помилка при виправленні');
        console.error('Помилка при виправленні:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Collapse in={errorMsg !== ''}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setErrorMsg('')}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMsg}
        </Alert>
      </Collapse>
      
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        startIcon={<AutoFixHigh />}
        variant="contained"
        color={success ? "success" : "primary"}
        onClick={fixError}
        disabled={loading || success}
        sx={{
          minWidth: 130,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {success ? 'Виправлено' : 'Виправити'}
      </LoadingButton>
    </Box>
  );
}

export default ErrorDetails;
import React, { useState } from 'react'; // Импортируем React только один раз
import apiClient from './apiClient'; // Исправленный путь
import { 
  Box,
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoFixHigh, Close } from '@mui/icons-material';

function ErrorDetails({ error, onFix }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fixError = async () => {
    try {
      setLoading(true);
      await apiClient.post('/fix-error', { errorId: error.id }); // Используем apiClient
      setSuccess(true);
      setTimeout(() => {
        onFix(error.id);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Ошибка авторизации: ', err.message);
        // Обработка ошибки авторизации
      } else {
        setErrorMsg('Помилка при виправленні');
        console.error('Помилка при виправленні:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Collapse in={errorMsg !== ''}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setErrorMsg('')}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMsg}
        </Alert>
      </Collapse>
      
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        startIcon={<AutoFixHigh />}
        variant="contained"
        color={success ? "success" : "primary"}
        onClick={fixError}
        disabled={loading || success}
        sx={{
          minWidth: 130,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {success ? 'Виправлено' : 'Виправити'}
      </LoadingButton>
    </Box>
  );
}

export default ErrorDetails;
import React, { useState } from 'react';
import apiClient from './apiClient'; // Исправленный путь
import { 
  Box,
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoFixHigh, Close } from '@mui/icons-material';

function ErrorDetails({ error, onFix }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fixError = async () => {
    try {
      setLoading(true);
      await apiClient.post('/fix-error', { errorId: error.id }); // Используем apiClient
      setSuccess(true);
      setTimeout(() => {
        onFix(error.id);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Ошибка авторизации: ', err.message);
        // Обработка ошибки авторизации
      } else {
        setErrorMsg('Помилка при виправленні');
        console.error('Помилка при виправленні:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Collapse in={errorMsg !== ''}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setErrorMsg('')}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMsg}
        </Alert>
      </Collapse>
      
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        startIcon={<AutoFixHigh />}
        variant="contained"
        color={success ? "success" : "primary"}
        onClick={fixError}
        disabled={loading || success}
        sx={{
          minWidth: 130,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {success ? 'Виправлено' : 'Виправити'}
      </LoadingButton>
    </Box>
  );
}

export default ErrorDetails;
import apiClient from './apiClient'; // Исправленный путь
import { 
  Box,
  Collapse,
  Alert,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AutoFixHigh, Close } from '@mui/icons-material';

function ErrorDetails({ error, onFix }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fixError = async () => {
    try {
      setLoading(true);
      await apiClient.post('/fix-error', { errorId: error.id }); // Используем apiClient
      setSuccess(true);
      setTimeout(() => {
        onFix(error.id);
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error('Ошибка авторизации: ', err.message);
        // Обработка ошибки авторизации
      } else {
        setErrorMsg('Помилка при виправленні');
        console.error('Помилка при виправленні:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Collapse in={errorMsg !== ''}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setErrorMsg('')}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMsg}
        </Alert>
      </Collapse>
      
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        startIcon={<AutoFixHigh />}
        variant="contained"
        color={success ? "success" : "primary"}
        onClick={fixError}
        disabled={loading || success}
        sx={{
          minWidth: 130,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {success ? 'Виправлено' : 'Виправити'}
      </LoadingButton>
    </Box>
  );
}

export default ErrorDetails;