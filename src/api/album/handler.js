const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async createAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);

    return response;
  }

  async updateAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    const album = await this._service.updateAlbum(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui!',
      data: album,
    });
    response.code(200);

    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbum(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);

    return response;
  }
}

module.exports = AlbumHandler;
