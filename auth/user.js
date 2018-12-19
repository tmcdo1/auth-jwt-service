const mongoose = require('mongoose')
const User = require('../models/user')

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/Users`)
/*
@param  {String}    email   the email for the user you want to get the object for
@return {Object}    user    the user object for the user
*/
async function getUser (email) {
  let userQuery = User.findOne({ email })
  try {
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
    return null
  } catch (err) {
    return err
  }
}

module.exports = {
  getUser,
  createUser
}
