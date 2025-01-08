import express from 'express';
import config from './config/app.config.js';

const app = express();
app.use(express.json());

app.listen(config.port, () => {
  console.info(`Server running on port ${config.port}`);
});
