import express from 'express';
import config from '../config/app.js';  // Assuming you move app.js to a higher level directory

const app = express();
app.use(express.json());

app.listen(config.port, () => {
  // Option 1: Add 'console' to ESLint globals in your .eslintrc file
{
  "globals": {
    "console": "readonly"
  }
}

// Option 2: Configure the environment in your .eslintrc file
{
  "env": {
    "node": true
  }
}
});
