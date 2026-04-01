const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SECRET } = require('../utils/config');

const generateToken = async (userId = null) => {
  console.log('Received userid for token generation:', userId);
  const user = await User.findOne();

    console.log('User found for token generation:', user);

  const tokenUserId = userId ? userId : user._id.toString();

  const token = jwt.sign({ username: user.username, id: tokenUserId }, SECRET);
  return token;
}

module.exports = {
  generateToken
}