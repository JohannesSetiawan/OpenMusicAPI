const autoBind = require('auto-bind');

class LikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async createLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const id = await this._service.createLikes(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
      data: {
        likesId: id,
      },
    });
    response.code(201);
    return response;
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, cache } = await this._service.getLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLikes(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus likes',
    });
    response.code(200);
    return response;
  }
}
module.exports = LikesHandler;
