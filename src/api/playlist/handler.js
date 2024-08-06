const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async createPlaylistHandler(request, h) {
    this._validator.validateCreatePlaylistPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { name } = request.payload;

    const id = await this._service.createPlaylist(name, owner);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId: id,
      },
    });
    response.code(201);
    return response;
  }

  async getAllOwnedPlaylist(request, h) {
    const { id: owner } = request.auth.credentials;

    const playlists = await this._service.getAllPlaylist(owner);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylist(request, h) {
    const { id: owner } = request.auth.credentials;
    const { id } = request.params;

    await this._service.deletePlaylist(id, owner);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus playlist',
    });
    response.code(200);
    return response;
  }

  async addSongToPlaylist(request, h) {
    const { id: owner } = request.auth.credentials;
    const { songId } = request.payload;
    const { id } = request.params;
    this._validator.validateSongPlaylistPayload(request.payload);

    await this._service.addSongToPlaylist(id, songId, owner);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylist(request, h) {
    const { id: owner } = request.auth.credentials;
    const { id } = request.params;

    const playlist = await this._service.getAllSongsFromPlaylist(id, owner);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deleteSongFromPlaylist(request, h) {
    const { id: owner } = request.auth.credentials;
    const { songId } = request.payload;
    const { id } = request.params;
    this._validator.validateSongPlaylistPayload(request.payload);

    await this._service.deleteSongFromPlaylist(id, songId, owner);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus lagu dari playlist',
    });
    response.code(200);
    return response;
  }
}
module.exports = PlaylistHandler;
