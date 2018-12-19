require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const bcrypt = require('bcrypt')
const app = express()

var { jwtStrategy, createToken } = require('./auth/jwt')
var { getUser, createUser } = require('./auth/user')

passport.use(jwtStrategy)

app.set('view engine', 'ejs')

// Parse both application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/** **   API uses   ****/
// Authenticates and returns token
app.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password || req.body.email == null || req.body.password == null) {
    return res.status(401).json({ message: 'missing parameters' })
  }

  // Verify that a user with email exists
  let user = await getUser(req.body.email)
  if (user == null) {
    return res.status(401).json({ message: 'user not found' })
  }

  // compare passwords (using bcrypt)
  const match = await bcrypt.compare(req.body.password, user.password)

  if (match) {
    const token = createToken(user._id)
    return res.json({ message: 'ok', token })
  } else {
    return res.status(401).json({ message: 'password did not match' })
  }
})

// Registers a new user
app.post('/register', async (req, res) => {
  let err = await createUser(req.body)
  if (err) {
    return res.json({ message: 'failed to create user' })
  }
  return res.json({ message: 'ok' })
})

// Verfies that token is valid and returns the user information w/o password
app.post('/authenticate', (req, res, next) => {
  passport.authenticate('jwt', function (err, user, info) {
    if (err) return next(err)
    if (!user) return res.status(401).json({ message: 'invalid token' })

    delete user.password
    return res.json({ message: 'ok', user })
  })(req, res, next)
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

app.listen(process.env.PORT, () => { console.log(`Authentication Service is running on port ${process.env.PORT}`) })
