class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.message = 'Неизвестная ошибка';
  }
}

module.exports = InternalServerError;
