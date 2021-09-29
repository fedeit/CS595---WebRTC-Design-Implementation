// Setup .env
require('dotenv').config()

// Import express and setup instance
const express = require('express')
const app = express()

app.use(express.static('public'))

// Start listening either on a defined port or 3000
let listener = app.listen(process.env.PORT || 3000, (e) => {
    console.log(`Example app listening at http://localhost:${listener.address().port}`)
})