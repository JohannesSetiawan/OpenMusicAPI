const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async createLikes(albumId, userId) {
    await this.verifyAlbumExist(albumId);
    await this.verifyUserLikeExist(albumId, userId);

    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Likes gagal ditambahkan');
    }

    await this._cacheService.delete(`album:${albumId}`);

    return result.rows[0].id;
  }

  async getLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);

      return {
        likes: parseInt(JSON.parse(result), 10), cache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT count(id) as likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError('Likes tidak ditemukan!');
      }

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(result.rows[0].likes));

      return {
        likes: parseInt(result.rows[0].likes, 10), cache: false,
      };
    }
  }

  async deleteLikes(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Likes tidak ditemukan!');
    }

    await this._cacheService.delete(`album:${albumId}`);
  }

  async verifyAlbumExist(albumId) {
    const query = {
      text: 'SELECT * FROM album WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Album tidak ditemukan!');
    }
  }

  async verifyUserLikeExist(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0]) {
      throw new InvariantError('User sudah melakukan like untuk album tersebut!');
    }
  }
}

module.exports = LikesService;
