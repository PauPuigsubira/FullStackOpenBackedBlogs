require('dotenv').config({quiet: true})

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const passwordObject = {
  pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9!@#$%^&*]{6,})$/,
  msgPatternError: 'password must be six characters long and contain at least one number, one special character, one lowercase letter and one uppercase letter',
  saltRounds: 10,
};

const SECRET = process.env.NODE_ENV === 'test'
  ? process.env.TEST_SECRET
  : process.env.SECRET

module.exports = {
  PORT,
  MONGODB_URI,
  passwordObject,
  SECRET
}