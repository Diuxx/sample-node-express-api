'use strict';

const { readFileSync } = require('fs')

// config
let config;
try {
    config = JSON.parse(readFileSync('config.json', 'utf-8'));
    if (!config.name || !config.port) {
        throw new Error('"name" and "port" are required in config.json');
    }

    console.log(`[${config.name}][✔] config loaded ⚙`);
}
catch (err) {
    console.error(`[Error][✘] Failed to load config: ${err.message}`);
    process.exit(1);
}

const express = require('express');
const app = express().use(express.json());
app.config = config;

require('./logger')(app);
require('./middleware')(app);
require('./routes')(app);

const PORT = app.config?.port || 3001;
app.listen(PORT, () => console.log(`[${app.config.name}][✔] api : http://localhost:${PORT}/`));