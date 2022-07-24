class Conflict extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
    this.message = 'Пользователь с такой почтой уже существует';
  }
}

module.exports = Conflict;
