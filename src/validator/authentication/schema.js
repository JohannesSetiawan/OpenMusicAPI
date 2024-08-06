const Joi = require('joi');

const LoginPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const TokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { LoginPayloadSchema, TokenPayloadSchema };
