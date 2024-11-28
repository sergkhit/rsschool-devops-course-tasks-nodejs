const request = require('supertest');
const app = require('..index'); 

describe('GET /', () => {
  it('respond with Simple test app', (done) => {
    request(app)
      .get('/')
      .expect('Simple test app', done);
  });
});