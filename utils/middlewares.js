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

module.exports = {
  info, 
  error,
  logger
}