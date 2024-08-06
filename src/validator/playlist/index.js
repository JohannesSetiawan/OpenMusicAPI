const InvariantError = require('../../exceptions/InvariantError');
const { CreatePlaylistPayloadSchema, SongPlaylistPayloadSchema } = require('./schema');

const PlaylistValidator = {
  validateCreatePlaylistPayload: (payload) => {
    const validationResult = CreatePlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateSongPlaylistPayload: (payload) => {
    const validationResult = SongPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
