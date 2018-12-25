const mongoose = require('mongoose')
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const { databaseConnectionOptions, databaseConnectionError } = require('../config')

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, databaseConnectionOptions, databaseConnectionError)

var JwtStrategy = passportJWT.Strategy
var ExtractJwt = passportJWT.ExtractJwt

// Custom Cookie Extraction function. Based on sample from http://www.passportjs.org/packages/passport-jwt/#extracting-the-jwt-from-the-request
var cookieExtractor = function(req) {
  var token = null
  if (req && req.signedCookies) {
      token = req.signedCookies.user
  }
  return token
};

const extractOptions = {
  body: () => { return ExtractJwt.fromBodyField('jwtToken') },
  bearer: () => { return ExtractJwt.fromAuthHeaderAsBearerToken() },
  cookie: () => { return cookieExtractor },
  authHeader: () => { return ExtractJwt.fromAuthHeader() },
  authHeaderWithScheme: (auth_scheme) => { return ExtractJwt.fromAuthHeaderWithScheme(auth_scheme) }
}

function createStrategy(option=extractOptions.body()) {

  let jwtOptions = {
    jwtFromRequest: option,
    secretOrKey: process.env.TOKEN_SECRET
  }

  let jwtStrategy = new JwtStrategy(jwtOptions, function (jwtPayload, next) {
    User.findById(jwtPayload.id, (err, user) => {
      if (err) {
        return next(err, false)
      }
      if (user) {
        return next(null, user)
      } else {
        return next(null, false)
      }
    })
  })

  return jwtStrategy
}

/*
@param  {mongoose.Schema.Types.ObjectId}    userId  The _id of the user from the database
@return {String}                            token   the signed JWT Token
*/
async function createToken (userId) {
  let payload = {
    id: userId
  }
  try {
    let token = await jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPR })
    return token
  } catch (err) {
    console.log('JWT ERROR:', err)
    return null
  }
}

module.exports = {
  createToken,
  createStrategy,
  extractOptions
}
