const assert = require('node:assert')
const { beforeEach, describe, test, after } = require('node:test')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const api = supertest(app)

describe('Login API tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('Test@123', 10)
    const initialUser = new User({ username: 'testuser', name: 'Test User', passwordHash })
    await initialUser.save()
  })

  test('Login with valid credentials succeeds', async () => {
    const loginData = {
      username: 'testuser',
      password: 'Test@123'
    }

    const response = await api
      .post('/api/login')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, loginData.username)
  })

  test('Login with invalid credentials fails', async () => {
    const loginData = {
      username: 'testuser',
      password: 'WrongPassword'
    }

    const response = await api
      .post('/api/login')
      .send(loginData)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'invalid username or password')
  })

  after(async () => {
    await mongoose.connection.close()
  })
})