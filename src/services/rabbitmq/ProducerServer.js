const amqp = require('amqplib');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const PermissionError = require('../../exceptions/PermissionError');

class ProducerService {
  constructor() {
    this._pool = new Pool();
  }

  async sendMessage(queue, message, playlistId, userId) {
    await this.verifyPlaylistExistAndAccess(playlistId, userId);

    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  }

  async verifyPlaylistExistAndAccess(playlistId, userId) {
    const getPlaylistQuery = {
      text: 'Select username from playlist where id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(getPlaylistQuery);

    if (!result.rows[0]) {
      throw new NotFoundError('Playlist tidak terdaftar');
    }

    const { username: owner } = result.rows[0];

    const getUnameQuery = {
      text: 'Select username from users where id = $1',
      values: [userId],
    };

    const { username: accessUserUname } = (await this._pool.query(getUnameQuery)).rows[0];

    if (owner !== accessUserUname) {
      throw new PermissionError('Anda tidak memiliki akses!');
    }
  }
}

module.exports = ProducerService;
