import express from 'express';
import config from './config/app.js';

const app = express();
app.use(express.json());

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
