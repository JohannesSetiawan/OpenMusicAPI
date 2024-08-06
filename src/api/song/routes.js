const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.createSongHandler,
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getAllSongs,
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.updateSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;
