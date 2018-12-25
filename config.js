const nodemailer = require('nodemailer')

const databaseConnectionOptions = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500
}

function databaseConnectionError (error) {
  if (error) {
    console.log('Failed to first attempt to connect to database:', error)
  }
}

// Used to send emails for password reset
var smtpTransport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

var passwordResetEmail = 'noreply@passwordreset.com'

// Only used when the '-c' (enable cookie use) is passed on service startup 
var cookieOptions = { 
  signed: true, 
  maxAge: process.env.COOKIE_EXPR, 
  httpOnly: true 
}

module.exports = {
  databaseConnectionOptions,
  databaseConnectionError,
  smtpTransport,
  passwordResetEmail,
  cookieOptions
}
