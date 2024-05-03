const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

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
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]



app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
    })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    persons = persons.filter(person => person.id !== id)  
    response.json(person)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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
        response.json(person)
    }
    

    
})

    app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people<p> <p>${Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})