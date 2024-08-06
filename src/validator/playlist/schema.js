const Joi = require('joi');

const CreatePlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const SongPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { CreatePlaylistPayloadSchema, SongPlaylistPayloadSchema };
