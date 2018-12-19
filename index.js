require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.set('view engine', 'ejs')

// Parse both application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/** **   API uses   ****/
// Authenticates and returns token
app.post('/login', (req, res) => {

})

// Registers a new user
app.post('/register', (req, res) => {

})

// Verfies that token is valid
app.post('/authenticate', (req, res) => {

})

// Change the password of current user
app.post('/resetpassword', (req, res) => {

})

/** **   Optional Page uses   ****/
app.get('/login', (req, res) => {

})

app.get('/register', (req, res) => {

})

app.get('/resetpassword', (req, res) => {

})

app.listen(process.env.PORT, `Authentication Service is running on port ${process.env.PORT}`)
