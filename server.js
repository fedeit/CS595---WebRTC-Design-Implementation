// Setup .env
require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').Server(app)
const { Server } = require("socket.io")
const io = new Server(server)

// Setup express middleware
app.use(express.static('public'))
app.use(express.json())

io.sockets.on("error", e => console.log(e))

let allRooms = [{
    members: []
}]


io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })    

    socket.on('join', (room, user) => {
        console.log(`User ${user.id} joined room ${room.id}`)
        socket.join(room.id)
        
        socket.broadcast.to(room.id)
        .emit('userJoined', user)
    })

    socket.on('callOffer', (user, offer, room) => {
        console.log(`User ${user.id} requesting call in room`)
        
        socket.broadcast.to(room.id)
        .emit('callOffer', offer)
    })

    socket.on('responseOffer', (user, offer, room) => {
        console.log(`User ${user.id} responding to call in room`)
        
        socket.broadcast.to(room.id)
        .emit('responseOffer', offer)
    })
})

app.get('/room/:id', (req, res) => {
    res.send(req.params.id)
})

app.get('/me/id', (req, res) => {
    res.status(200).send({
        user: {
            id: 'fedeit',
            email: 'fgalbiati@wpi.edu'
        }
    })
})

// Start listening either on a defined port or 3000
let listener = server.listen(process.env.PORT || 3000, (e) => {
    console.log(`Example app listening at http://localhost:${listener.address().port}`)
})