'use strict';

const { readFileSync } = require('fs')

// config
const config = JSON.parse(readFileSync('config.json', 'utf-8'));
console.log(`[${config.name}][✔] config loaded ⚙`);

const express = require('express');
const app = express()
    .use(express.json());

require('./middleware')(app, config);
require('./routes')(app, config);

const PORT = config?.port || 3001;
app.listen(PORT, () => console.log(`[${config.name}][✔] api : http://localhost:${PORT}/`));