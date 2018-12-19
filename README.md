# Simple AUTH Microservice (WIP)
The purpose of this project is to have an easily usable authentication microservice that one could "plug and play" into their existing API or gateway. This project will be 100% working out of the box (currently in development). However, it is also meant to be a starting point for those who want a more customized authentication service. The microservice is also meant to be used how you would like it to be used, meaning certain pages (login, register, password reset) will be provided but are by no means required to be used. If you would like to customize the pages or use another service for the pages, it is encouraged.

NOTE: Passwords are hashed using bcrypt

## Currently Planned Features
- Simple login page
- Simple registration page
- Password reset functionality
- Delete account
- Uses MongoDB as datastore 
- Encrypt everything in database (User collection/table) at rest

## Future Plans
- Allow for interchangeable databases with just specifying an environment variable (currently only MongoDB will be supported out of the box)
- Add more security features to prevent against spamming (brute-force) and DOS attacks
- Optional features to have a stateful service that will allow "logout" functionality, even with token expiration
- Verify email

## API 
Work in progress...

Authentication requests will need to have token in body of POST request with a 'jwtToken' id.

## .env Customization
    # All variables defined here will not overwrite variables currently defined in environment

    # Backend services
    HOST='localhost'
    PORT=3000
    AUTH_PATH='/' # used for the optional pages to direct to correct endpoint location (i.e. '/auth' or '/auth/jwt')

    TOKEN_SECRET='secret' # Change this to whatever you would like your token secret to be
    TOKEN_EXPR='2d' # Token Expiration Length. Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. 
                    # If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

    # Database
    DB_HOST='localhost'
    DB_PORT=27017
    DB_NAME='JWTService'

## User Schema
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        username: {
            type: String,
            unique: true,
            required: false,
            trim: true
        },
        firstname: {
            type: String,
            required: false,
            trim: true
        },
        lastname: {
            type: String,
            required: false,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        dateCreated: {
            type: Date,
            required: false,
            default: Date.now
        }
    }