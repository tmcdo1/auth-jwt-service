require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const bcrypt = require('bcrypt')
const path = require('path')
const app = express()

var { jwtStrategy, createToken } = require('./auth/jwt')
var { getUser, createUser, forgotPassword, resetPassword, deleteAccount } = require('./auth/user')

passport.use(jwtStrategy)

// Parse both application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(passport.initialize())

// Authenticate function
function authenticate (req, res, next) {
  passport.authenticate('jwt', function (err, user, info) {
    if (err) return next(err)
    if (!user) return res.status(401).json({ message: 'invalid token' })

    let tempUser = copyObjectNoPassword(user.toObject())
    delete tempUser.password
    req.user = tempUser
    next()
  })(req, res, next)
}

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
    const token = await createToken(user._id)
    if (!token) {
      return res.status(401).json({ message: 'failed creating token' })
    }
    return res.json({ message: 'ok', token })
  } else {
    return res.status(401).json({ message: 'password did not match' })
  }
})

// Registers a new user
app.post('/register', async (req, res) => {
  // console.log(req.headers)
  let err = await createUser(req.body)
  if (err) {
    return res.json({ message: 'failed to create user', error: err })
  }
  return res.json({ message: 'ok' })
})

// Verfies that token is valid and returns the user information w/o password
app.post('/authenticate', authenticate, (req, res) => {
  res.json({ message: 'ok', user: req.user })
})

// Initiate forgot password sequence
app.post('/forgot', async (req, res) => {
  if (!req.body.email || req.body.email == null) {
    return res.json({ message: 'no email given' })
  }
  let err = await forgotPassword(req.body.email)
  if (err) {
    return res.json({ message: 'failed to send email', error: err })
  }
  res.json({ message: 'ok' })
})

// Change the password of current user
app.post('/reset/:token', async (req, res) => {
  if (!req.params.token || req.params.token == null || !req.body.password || req.body.password == null) {
    return res.json({ message: 'no token or no password received' })
  }
  let err = await resetPassword(req.params.token, req.body.password)
  if (err) {
    return res.json({ message: 'failed to reset password', error: err })
  }
  res.json({ message: 'ok' })
})

app.delete('/delete-account', authenticate, async (req, res) => {
  if (!req.body.email || req.body.email == null) {
    return res.json({ message: 'no email given' })
  }
  if (req.body.email !== req.user.email) {
    return res.status(401).json({ message: 'unauthorized to delete account' })
  }
  try {
    await deleteAccount(req.body.email)
    return res.json({ message: 'ok' })
  } catch (err) {
    return res.json({ message: 'unable to delete account', error: err })
  }
})

/** **   Optional Page uses   ****/
app.get('/main.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/css/main.css'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login/login.html'))
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/register/register.html'))
})

app.get('/forgot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/password_reset/forgot.html'))
})

app.get('/reset/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/password_reset/reset.html'))
})

app.listen(process.env.PORT, () => { console.log(`Authentication Service is running on port ${process.env.PORT}`) })

function copyObjectNoPassword (obj) {
  let newObj = {}
  for (let key in obj) {
    newObj[key] = obj[key]
  }
  return newObj
}
