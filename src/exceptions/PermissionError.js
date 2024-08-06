const ClientError = require('./ClientError');

class PermissionError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = 'PermissionError';
  }
}

module.exports = PermissionError;
