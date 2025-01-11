'use strict'

const path = require('path');
const winston = require('winston');

module.exports = (app) => {
    // --
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}]: ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: path.join(app.config.pathLog, 'sample.log') })
        ],
    });

    app.logger = logger;
}