const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapSongDBToModel } = require('../utils');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO song VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongById(id) {
    const query = {
      text: 'Select * from song where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Lagu tidak ditemukan!');
    }

    return result.rows.map(mapSongDBToModel)[0];
  }

  async getAllSongs(title, performer) {
    let query = {
      text: 'Select * from song',
      values: [],
    };

    if (title) {
      query = {
        text: 'Select * from song where title ilike $1',
        values: [`%${title}%`],
      };
    }
    if (performer) {
      query = {
        text: 'Select * from song where performer ilike $1',
        values: [`%${performer}%`],
      };
    }
    if (title && performer) {
      query = {
        text: 'Select * from song where title ilike $1 and performer ilike $2',
        values: [`%${title}%`, `%${performer}%`],
      };
    }

    const result = await this._pool.query(query);

    const allSongs = result.rows.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    return allSongs;
  }

  async updateSong(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'Update song set title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumid = $6 where id = $7 returning *',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id lagu tidak ditemukan!');
    }

    return result.rows.map(mapSongDBToModel)[0];
  }

  async deleteSong(id) {
    const query = {
      text: 'delete from song where id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Id lagu tidak ditemukan!');
    }
  }
}

module.exports = SongService;
