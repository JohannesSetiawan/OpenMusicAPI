const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async registerUserHandler(request, h) {
    this._validator.validateRegisterPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.registerUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil diregistrasi',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
