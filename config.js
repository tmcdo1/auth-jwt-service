const databaseConnectionOptions = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500
}

function databaseConnectionError (error) {
  console.log('Failed to first attempt to connect to database:', error)
}

module.exports = {
  databaseConnectionOptions,
  databaseConnectionError
}
