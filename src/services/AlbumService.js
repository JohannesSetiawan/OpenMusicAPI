const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../utils');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbum(id) {
    const query = {
      text: 'SELECT * FROM album WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    const querySong = {
      text: 'Select * from song where albumid = $1',
      values: [id],
    };

    const resultSong = await this._pool.query(querySong);

    const allSongsFromAlbum = resultSong.rows.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    if (!result.rows[0]) {
      throw new NotFoundError('Album tidak ditemukan!');
    }

    const { name, year, coverUrl } = result.rows.map(mapAlbumDBToModel)[0];

    return {
      id, name, year, coverUrl, songs: allSongsFromAlbum,
    };
  }

  async updateAlbum(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING *',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id album tidak ditemukan!');
    }

    return result.rows.map(mapAlbumDBToModel)[0];
  }

  async deleteAlbum(id) {
    const query = {
      text: 'DELETE FROM album WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Id album tidak ditemukan!');
    }
  }
}

module.exports = AlbumService;
