const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middlewares')

app.use(cors())
app.use(express.json())
app.use(middleware.logger)
app.use('/api/blogs', blogsRouter)

const unknownEndpoint = (request, response) => {
  middleware.error('Unknown endpoint reached')
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

module.exports = app

