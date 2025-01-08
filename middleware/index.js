'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');

const globalRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Fenêtre de 15 minutes
    max: 20, // Limite à 100 requêtes par fenêtre
    message: "Too many requests, please try again later."
});

module.exports = (app) => {
    app.use(logger('dev'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(fileUpload());
    app.use(globalRateLimiter); 
};