'use strict';

const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(1).required(),
    google_id: Joi.string(),
});

module.exports = userSchema;