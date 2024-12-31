import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  List, 
  ListItem, 
  ListItemText,
  Paper, 
  Box,
  CircularProgress,
  Alert,
  Fade,
  Grow,
  Pagination
} from '@mui/material';
import ErrorDetails from './ErrorDetails';

export default function ErrorList() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const errorsPerPage = 10;

  useEffect(() => {
    fetchErrors();
    const interval = setInterval(fetchErrors, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/errors'); // Используйте относительный путь
      setErrors(response.data);
      setError(null);
    } catch (error) {
      setError('Помилка завантаження даних');
      console.error('Помилка завантаження помилок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = (id) => {
    setErrors(errors.filter(error => error.id !== id));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const displayedErrors = errors.slice(
    (page - 1) * errorsPerPage,
    page * errorsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Fade in>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Fade>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        bgcolor: 'transparent',
        overflow: 'hidden'
      }}
    >
      <List>
        {displayedErrors.map((err, index) => (
          <Grow
            in
            key={err.id}
            style={{ transformOrigin: '0 0 0' }}
            timeout={index * 200}
          >
            <ListItem 
              sx={{ 
                mb: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: 'rgba(33, 150, 243, 0.04)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemText 
                primary={err.message}
                secondary={err.file}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    color: 'text.primary'
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary'
                  }
                }}
              />
              <ErrorDetails error={err} onFix={handleFix} />
            </ListItem>
          </Grow>
        ))}
      </List>
      {errors.length > errorsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination 
            count={Math.ceil(errors.length / errorsPerPage)} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
}