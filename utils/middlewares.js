const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const info = (...params) => {
  if (process.env.NODE_ENV !== 'test')
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

const logger   = (request, response, next) => {
  info('Method:', request.method)
  info('Path:  ', request.path)
  info('Body:  ', request.body)
  info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.split(' ')[1]
  }

  next()
}

const userExtractor = (request, response, next) => {
  const token = request.token

  if (token) {
    const decodedToken = jwt.verify(token, SECRET)
    request.user = decodedToken.id
  }

  //if (token && decodedToken) {
  //  request.user = decodedToken.id
  //}

  next()
}

module.exports = {
  info, 
  error,
  logger,
  tokenExtractor,
  userExtractor
}