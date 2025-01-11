'use strict';

const Joi = require('joi');

const sampleSchema = Joi.object({
    content: Joi.string().min(1).required()
});

module.exports = sampleSchema;