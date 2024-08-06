const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const PermissionError = require('../exceptions/PermissionError');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async createPlaylist(name, owner) {
    const id = nanoid(16);

    const username = await this.getUsername(owner);

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) returning id',
      values: [id, name, username],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAllPlaylist(owner) {
    const username = await this.getUsername(owner);

    const query = {
      text: 'SELECT id, name, username FROM playlist WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }

    return result.rows;
  }

  async deletePlaylist(id, owner) {
    await this.verifyPlaylistAccess(id, owner);

    const query = {
      text: 'delete from playlist where id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Id playlist tidak ditemukan!');
    }
  }

  async addSongToPlaylist(playlistId, songId, owner) {
    await this.verifyPlaylistAccess(playlistId, owner);
    await this.verifySongExist(songId);

    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) returning id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getAllSongsFromPlaylist(playlistId, owner) {
    const query = {
      text: 'SELECT id, name, username FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }

    await this.verifyPlaylistAccess(playlistId, owner);

    const { id, name, username } = result.rows[0];

    const querySong = {
      text: 'SELECT s.id, s.title, s.performer FROM playlist_song ps join song s on ps.song_id = s.id WHERE ps.playlist_id = $1',
      values: [playlistId],
    };

    const resultSong = await this._pool.query(querySong);

    return {
      id, name, username, songs: resultSong.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, owner) {
    await this.verifyPlaylistAccess(playlistId, owner);

    const query = {
      text: 'delete from playlist_song where playlist_id = $1 and song_id = $2 returning id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }

  async getUsername(ownerId) {
    const getUnameQuery = {
      text: 'Select username from users where id = $1',
      values: [ownerId],
    };

    const { username } = (await this._pool.query(getUnameQuery)).rows[0];

    return username;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const getPlaylistQuery = {
      text: 'Select username from playlist where id = $1',
      values: [playlistId],
    };

    const { username } = (await this._pool.query(getPlaylistQuery)).rows[0];

    const accessUserUname = await this.getUsername(userId);

    if (username !== accessUserUname) {
      throw new PermissionError('Anda tidak memiliki akses!');
    }
  }

  async verifySongExist(songId) {
    const getSongQuery = {
      text: 'Select * from song where id = $1',
      values: [songId],
    };

    const result = await this._pool.query(getSongQuery);

    if (!result.rows[0]) {
      throw new NotFoundError('Lagu tidak terdaftar');
    }
  }
}

module.exports = PlaylistService;
