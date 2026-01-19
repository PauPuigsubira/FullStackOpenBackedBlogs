const assert = require('node:assert');
const { beforeEach, describe, test, after } = require('node:test');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const api = supertest(app);

describe('User API tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('Initial@123', 10);
    const initialUser = new User({ username: 'initialuser', name: 'Initial User', passwordHash });
    await initialUser.save();
  });

  test('Creating a user with valid data succeeds', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'Test@123'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, 2);
    const usernames = usersAtEnd.map(u => u.username);
    assert(usernames.includes(newUser.username));
  });

  test('Creating a user without a username fails', async () => {
    const newUser = {
      name: 'No Username User', 
      password: 'NoUser@123'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('`username` is required'));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, 1);
  });

  test('Creating a user without a password fails', async () => {
    const newUser = {
      username: 'nopassworduser',
      name: 'No Password User'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('password'));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, 1);
  });

  test('Creating a user with an existing username fails', async () => {
    const newUser = {
      username: 'initialuser',
      name: 'Duplicate User',
      password: 'Duplicate@123'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(result.body.error, 'username already exists');

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, 1);
  });

  test('Creating a user with a short password fails', async () => {
    const newUser = {
      username: 'shortpassuser',
      name: 'Short Pass User',
      password: 'shrt'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert(result.body.error.includes('password'));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, 1);
  });

  test('Fetching all users returns the correct number of users', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.length, 1);
    assert.strictEqual(response.body[0].username, 'initialuser');
  });

  test('Fetching a specific user by ID returns the correct user', async () => {
    const usersAtStart = await User.find({});
    const userToFetch = usersAtStart[0];

    const response = await api
      .get(`/api/users/${userToFetch._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.username, userToFetch.username);
    assert.strictEqual(response.body.name, userToFetch.name);
  });

  test('Fetching a non-existing user returns 404', async () => {
    const nonExistingId = new mongoose.Types.ObjectId();

    await api
      .get(`/api/users/${nonExistingId}`)
      .expect(404);
  });

  test('Fetching a user with malformatted ID returns 400', async () => {
    const malformattedId = '12345invalidid';

    const result = await api
      .get(`/api/users/${malformattedId}`)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(result.body.error, 'malformatted id');
  });

  after(async () => {
    await mongoose.connection.close();
  });

});