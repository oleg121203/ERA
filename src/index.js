const express = require('express');
const config = require('./config/app');

const app = express();

app.use(express.json());

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
