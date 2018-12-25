require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const bcrypt = require('bcrypt')
const path = require('path')
var program = require('commander')
const app = express()

var { createToken, createStrategy, extractOptions } = require('./auth/jwt')
var { getUser, createUser, forgotPassword, resetPassword, resetTokenValid, deleteAccount } = require('./auth/user')
var { cookieOptions } = require('./config')

// Parse flags
program
  .option('-c, --cookies', 'Use cookies with token')
  .option('-e, --email-verification', 'Send email on user registration for verification')
  .option('-b, --bearer-token', 'Use bearer tokens in Authorization header')
  .option('-s, --sessions', 'Use stored user sessions')
  .parse(process.argv);

// Determine which extraction method to use
var jwtStrategy = createStrategy()
if(program.cookies) {
  jwtStrategy = createStrategy(extractOptions.cookie())
} else if(program.bearerToken) {
  jwtStrategy = createStrategy(extractOptions.bearer())
} 
passport.use(jwtStrategy)

// Parse both application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

if(program.cookies) {
  app.use(cookieParser(process.env.COOKIE_SECRET))
}

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

function checkHoneyPot (req, res, next) {
  // check for bots with honeypot field
  if (req.body.name && req.body.name !== '') {
    return res.json({ message: 'failed to submit form' })
  } else {
    next()
  }
}

/** **   API uses   ****/
// Authenticates and returns token
app.post('/login', checkHoneyPot, async (req, res) => {
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

    let tempUser = copyObjectNoPassword(user.toObject())
    delete tempUser.password

    // Set cookie for client if flag exists
    if(program.cookies) {
      if(req.signedCookies.user) {
        res.clearCookie('user', cookieOptions)
      }
      res.cookie('user', token, cookieOptions)
    }

    // Change to redirect here if you would like to redirect to a page on login
    return res.json({ message: 'ok', token, user: tempUser })
  } else {
    return res.status(401).json({ message: 'password did not match' })
  }
})

// Registers a new user
app.post('/register', checkHoneyPot, async (req, res) => {
  let err = await createUser(req.body)
  if (err) {
    return res.json({ message: 'failed to create user', error: err })
  }
  // change to a res.redirect if you would like to redirect on successful registration
  return res.json({ message: 'ok' })
})

// Verfies that token is valid and returns the user information w/o password
app.post('/authenticate', authenticate, (req, res) => {
  res.json({ message: 'ok', user: req.user })
})

// Initiate forgot password sequence
app.post('/forgot', checkHoneyPot, async (req, res) => {
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
app.post('/reset/:token', checkHoneyPot, async (req, res) => {
  if (!req.params.token || req.params.token == null || !req.body.password || req.body.password == null) {
    return res.json({ message: 'no token or no password received' })
  }
  let err = await resetPassword(req.params.token, req.body.password)
  if (err) {
    return res.json({ message: 'failed to reset password', error: err })
  }
  res.json({ message: 'ok' })
})

app.post('/logout', authenticate, (req, res) => {
  if(program.cookies && req.signedCookies.user) {
    res.clearCookie('user', cookieOptions)
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

  if(program.cookies && req.signedCookies.user) {
    res.clearCookie('user', cookieOptions)
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

app.get('/reset/:token', async (req, res) => {
  if (!(await resetTokenValid(req.params.token))) {
    return res.send('Reset page has expired')
  }
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
