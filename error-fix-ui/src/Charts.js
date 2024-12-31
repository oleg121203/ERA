import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import apiClient from './apiClient'; // Исправленный относительный путь

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Статистика помилок за останні 7 днів'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

function Charts() {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Пример получения данных для графиков с сервера
    const fetchChartData = async () => {
      try {
        const response = await apiClient.get('/chart-data');
        const data = response.data;
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  const data = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: 'Ошибки',
        data: chartData.errors || [],
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Графік помилок
      </Typography>
      <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Line data={data} options={options} />
      </Box>
    </Paper>
  );
}

export default Charts;
