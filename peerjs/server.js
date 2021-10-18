require('dotenv').config()
require('./services/passport-service.js')
const validateLoginMiddleware = require('./services/passport-auth.js')
const { PeerServer } = require('peer')
const session = require('express-session')
const express = require('express')
const passport = require('passport')
const path = require('path')
const app = express()
const peerServer = PeerServer({ port: 9000, path: '/peerjs' })
const port = 3000

app.use(express.json())
app.use(session({ secret: process.env.cookieKey1, cookie: { maxAge: 24 * 60 * 60 * 1000 } }))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))

app.get('/auth/github', passport.authenticate('github', {
  scope: [ 'user:email' ]
}))

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/auth/error',
  successRedirect: '/'
}))

app.get('/auth/error', (req, res) => {
  res.writeHeader( 400, { 'Content-Type': 'text/plain' })
  res.end("Could not authenticate you with GitHub, error from OAuth2")
})

app.get('/auth/me', validateLoginMiddleware, (req, res) => {
  res.writeHeader( 200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ 'username': req.user.username , 'status': 200}))
})

app.get('/', validateLoginMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/index.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/login.html'))
})

app.listen(port, () => {
  console.log(`WebRTC app listening at http://localhost:${port}`)
})
