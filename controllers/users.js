const bcrypt = require('bcrypt')
const User = require('../models/user');
const userRouter = require('express').Router();
const { passwordObject } = require('../utils/config')

// Get all users
userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, url: 1 });
  response.json(users);
});

// Get a specific user by ID
userRouter.get('/:id', async (request, response) => {
  try {
    const user = await User.findById(request.params.id).populate('blogs', { title: 1, url: 1 });
    if (user) {
      response.json(user);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    console.error(error.message);
    response.status(400).json({ error: 'malformatted id' });
  }
});

// Create a new user
userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  console.log('passwordPattern', passwordObject.pattern);
  if (passwordObject.pattern.test(password) === false) {
    return response
      .status(400)
      .json({ error: passwordObject.msgPatternError });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return response.status(400).json({ error: 'username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, passwordObject.saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  // Validate the user before saving
  try {
    await user.validate();
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

module.exports = userRouter;
