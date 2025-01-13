'use strict'

const path = require('path');
const winston = require('winston');
const { format } = winston;

module.exports = (app) => {
    // --
    const logger = winston.createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            // format.colorize(), // Ajoute des couleurs selon le niveau de log
            format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] [${level}]: ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: path.join(app.config.pathLog, app.config.logName),
                format: format.combine(
                    format.simple(),
                    format.printf(({ level, message, timestamp }) => {
                        return `[${timestamp}] [${level}]: ${message}`;
                    })
                ),
                maxsize: 10 * 1024 * 1024,  // 10MB
                maxFiles: 3,  // Conserver 5 anciens fichiers de log
                tailable: true  // Assurer une rotation quand la taille est dépassée
            })
        ],
    });

    app.logger = logger;
}