'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Fenêtre de 15 minutes
    max: 20, // Limite à 100 requêtes par fenêtre
    message: "Too many requests, please try again later."
});

module.exports = (app) => {
    const morganStream = {
        write: (message) => app.logger.info(message.trim()), // Trim to remove extra newlines
    };

    app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(fileUpload());
    app.use(globalRateLimiter);
};