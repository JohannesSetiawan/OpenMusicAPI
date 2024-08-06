const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.registerUserHandler,
  },
];

module.exports = routes;
