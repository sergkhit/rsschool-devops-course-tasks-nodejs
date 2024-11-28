const request = require('supertest');
const app = require('./index'); // Убедитесь, что вы экспортировали app из index.js

describe('GET /', () => {
  it('respond with Simple test app', (done) => {
    request(app)
      .get('/')
      .expect('Simple test app', done);
  });
});