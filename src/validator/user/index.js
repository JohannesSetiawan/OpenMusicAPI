const InvariantError = require('../../exceptions/InvariantError');
const { RegisterPayloadSchema } = require('./schema');

const UserValidator = {
  validateRegisterPayload: (payload) => {
    const validationResult = RegisterPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
