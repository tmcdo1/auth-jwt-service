# Simple AUTH Microservice (WIP)
The purpose of this project is to have an easily usable authentication microservice that one could "plug and play" into their existing API or gateway. This project will be 100% working out of the box (currently in development). However, it is also meant to be a starting point for those who want a more customized authentication service. The microservice is also meant to be used how you would like it to be used, meaning certain pages (login, register, password reset) will be provided but are by no means required to be used. If you would like to customize the pages or use another service for the pages, it is encouraged.

NOTE: Passwords are hashed using bcrypt

## Currently Planned Features
- Simple login page
- Simple registration page
- Password reset functionality
- Uses MongoDB as datastore 
- Encrypt everything in database (User collection/table) at rest

## Future Plans
- Allow for interchangeable databases with just specifying an environment variable (currently only MongoDB will be supported out of the box)
- Add more security features to prevent against spamming (brute-force) and DOS attacks
- Optional features to have a stateful service that will allow "logout" functionality, even with token expiration

## API 
Work in progress...