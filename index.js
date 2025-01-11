'use strict';

const { readFileSync } = require('fs')

// config
const config = JSON.parse(readFileSync('config.json', 'utf-8'));
console.log(`[${config.name}][✔] config loaded ⚙`);

const express = require('express');
const app = express().use(express.json());
app.config = config;

require('./logger')(app);
require('./middleware')(app);
require('./routes')(app);

const PORT = app.config?.port || 3001;
app.listen(PORT, () => console.log(`[${app.config.name}][✔] api : http://localhost:${PORT}/`));