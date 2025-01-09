import express from 'express';
import config from '../config/app.js';  // Assuming you move app.js to a higher level directory

const app = express();
app.use(express.json());

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
