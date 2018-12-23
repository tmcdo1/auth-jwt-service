const mongoose = require('mongoose')
const crypto = require('crypto')
const uuidv4 = require('uuid/v4')
const User = require('../models/user')
const { smtpTransport, passwordResetEmail } = require('../config')

const { databaseConnectionOptions, databaseConnectionError } = require('../config')

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, databaseConnectionOptions, databaseConnectionError)
/*
@param  {String}    email   the email for the user you want to get the object for
@return {Object}    user    the user object for the user
*/
async function getUser (email) {
  try {
    let userQuery = User.findOne({ email })
    let user = await userQuery.exec()
    return user
  } catch (err) {
    return null
  }
}

/*
@param  {Object}    body    the body of the request made. Should contain at least email and password
@return {Error}     err     returns null or an err depending if operation successful
*/
async function createUser (body) {
  let newUserObject = {}

  newUserObject._id = uuidv4()

  // email
  if (body.email && body.email != null) newUserObject.email = body.email
  // password
  if (body.password && body.password != null) newUserObject.password = body.password
  // firstname
  if (body.firstname && body.firstname != null) newUserObject.firstname = body.firstname
  // lastname
  if (body.lastname && body.lastname != null) newUserObject.lastname = body.lastname
  // username
  if (body.username && body.username != null) newUserObject.username = body.username
  // dateCreated
  newUserObject.dateCreated = Date.now()

  const newUser = new User(newUserObject)
  try {
    await newUser.save()

    // Send verification email
    
    return null
  } catch (err) {
    return err
  }
}

async function forgotPassword (email) {
  try {
    // Create a token using crypto
    const token = crypto.randomBytes(20).toString('hex')

    // Find user with given email address and set token and expiration
    let user = await getUser(email)
    if (!user) throw Error('user not found')

    user.passwordResetToken = token
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour expiration

    await user.save()
    // Email custom link with token to email
    let mailOptions = {
      to: user.email,
      from: passwordResetEmail,
      subject: 'Password Reset',
      text: `
                You are receiving this email because a password reset has been requested on your account.
                If this was you, please click the following link or paste it into your browser:
                Link: ${process.env.HOST || 'http://localhost'}${process.env.PORT ? ':' : ''}${process.env.PORT}${process.env.AUTH_PATH}${process.env.AUTH_PATH.endsWith('/') ? '' : '/'}reset/${token} \n
                If this was not you, ignore this email and your password will remain unchanged.
            `
    }

    await smtpTransport.sendMail(mailOptions)

    return null
  } catch (err) {
    return { message: err.toString() }
  }
}

async function resetTokenValid (token) {
  try {
    // Find user with given reset token
    let userQuery = User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } })
    let user = await userQuery.exec()
    if (!user) {
      throw Error('user not found')
    } else {
      return true
    }
  } catch (err) {
    return false
  }
}

async function resetPassword (token, password) {
  try {
    // Find user with given reset token
    let userQuery = User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } })
    let user = await userQuery.exec()
    if (!user) {
      throw Error('user not found')
    }

    // Reset token and expiration and set new password
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    // send confirmation email
    let mailOptions = {
      to: user.email,
      from: passwordResetEmail,
      subject: 'Password Reset Successful',
      text: `
                  Your password has been successfully changed.
              `
    }

    await smtpTransport.sendMail(mailOptions)
    return null
  } catch (err) {
    return err
  }
}

async function deleteAccount (email) {
  await User.deleteOne({ email }).exec()
}

module.exports = {
  getUser,
  createUser,
  forgotPassword,
  resetPassword,
  resetTokenValid,
  deleteAccount
}
