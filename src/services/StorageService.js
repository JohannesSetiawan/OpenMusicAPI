const fs = require('fs');
const { Pool } = require('pg');
const NotFoundError = require('../exceptions/NotFoundError');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._pool = new Pool();

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async writeFile(file, meta, albumId) {
    await this.verifyAlbumExist(albumId);

    const filename = `${+new Date()}-${albumId}${meta.filename}`;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    const filepath = await new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });

    this.updateAlbumCover(albumId, filepath);

    return filepath;
  }

  async updateAlbumCover(albumId, filepath) {
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filepath}`;

    const query = {
      text: 'UPDATE album SET cover = $1 WHERE id = $2',
      values: [coverUrl, albumId],
    };

    await this._pool.query(query);
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
}

module.exports = StorageService;
