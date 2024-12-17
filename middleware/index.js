'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const fileUpload = require('express-fileupload');

module.exports = (app) => {
    // app.use(logger('dev'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(fileUpload());
};