import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/logs');
      const data = await response.json();
      setLogs(data);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Час</TableCell>
            <TableCell>Рівень</TableCell>
            <TableCell>Повідомлення</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>
                <Chip 
                  label={log.level} 
                  color={log.level === 'error' ? 'error' : 
                         log.level === 'warning' ? 'warning' : 'info'}
                  size="small"
                />
              </TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Logs;
