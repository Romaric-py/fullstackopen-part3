require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('req-body', function (req) {
  return JSON.stringify(req.body)
})
const morganMiddleware = morgan(
  ':method :url :status :req[content-length] - :response-time ms :req-body',
)
app.use(morganMiddleware)

app.get('/info', (request, response) => {
  Person.find({}).then((result) => {
    const numPersons = result.length
    const date = new Date()
    response.send(
      `<p>Phonebook has info for ${numPersons} people</p><p>${date}</p>`,
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  // Validation
  if (!request.body?.name || !request.body?.number) {
    return response
      .status(400)
      .json({ error: 'Some fields are missing or empty' })
  }

  const newPerson = new Person({
    name: request.body.name,
    number: request.body.number,
  })
  newPerson
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        response.status(404).end()
      } else {
        response.json(person)
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // Validation
  if (!name || !number) {
    return response
      .status(400)
      .json({ error: 'Some fields are missing or empty' })
  }

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number
      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error('Error:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
