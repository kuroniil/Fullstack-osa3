const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(morgan('tiny'))
app.use(morgan(':data'))

morgan.token('data', function (request, response) {
  const data = request.body
  return JSON.stringify(data)
})

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  }
]



app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  if (!request.body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!request.body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  } else if (persons.map(person => person.name).includes(person.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  } else {
    person.id = Math.round(Math.random()*100000000)
    persons.push(person)
    const newPerson = new Person(person)
    newPerson.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => {
        persons = persons.filter(person2 => person2.id !== person.id)
        next(error)
      })
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
	  number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { number: person.number })
	  .then(updatedPerson => {
      response.json(updatedPerson)
	  })
	  .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people<p> <p>${Date()}</p>`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})