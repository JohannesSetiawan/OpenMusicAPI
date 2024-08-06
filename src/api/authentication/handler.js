const autoBind = require('auto-bind');

class AuthHandler {
  constructor(authService, usersService, tokenManager, validator) {
    this._authService = authService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async loginHandler(request, h) {
    this._validator.validateLoginPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Berhasil login',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async refreshTokenHandler(request, h) {
    this._validator.validateTokenPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: 'success',
      message: 'Token berhasil diperbarui',
      data: {
        accessToken,
      },
    });
    response.code(200);
    return response;
  }

  async deleteTokenHandler(request, h) {
    this._validator.validateTokenPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Token berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = AuthHandler;
