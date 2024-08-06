require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');

const album = require('./api/album');
const AlbumService = require('./services/AlbumService');
const AlbumValidator = require('./validator/album');

const song = require('./api/song');
const SongService = require('./services/SongService');
const SongValidator = require('./validator/song');

const users = require('./api/user');
const UsersService = require('./services/UserService');
const UsersValidator = require('./validator/user');

const auth = require('./api/authentication');
const AuthValidator = require('./validator/authentication');
const AuthService = require('./services/AuthService');
const TokenManager = require('./token/TokenManager');

const playlist = require('./api/playlist');
const PlaylistService = require('./services/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

const likes = require('./api/like');
const LikesService = require('./services/LikesService');
const CacheService = require('./services/redis/CacheService');

const _exports = require('./api/export');
const ProducerService = require('./services/rabbitmq/ProducerServer');
const ExportsValidator = require('./validator/export');

const uploads = require('./api/upload');
const StorageService = require('./services/StorageService');
const UploadsValidator = require('./validator/upload');

const init = async () => {
  const cacheService = new CacheService();
  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UsersService();
  const authService = new AuthService();
  const playlistService = new PlaylistService();
  const likesService = new LikesService(cacheService);
  const producerService = new ProducerService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/upload/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
      payload: {
        maxBytes: 512000,
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,
      },
    },
    {
      plugin: auth,
      options: {
        authService,
        userService,
        tokenManager: TokenManager,
        validator: AuthValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: likes,
      options: {
        service: likesService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: producerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
