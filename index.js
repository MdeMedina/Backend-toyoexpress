require('dotenv').config()
const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const mongoose = require('mongoose')
const {dbConnect} = require('./config/mongo')
const cors = require('cors')
const PORT = process.env.PORT
dbConnect()


const app = express()
let server = http.createServer(app);

app.use(express.json())
app.use(cors())

app.use('/users', require('./app/routes/users'))
app.use(express.static('app'))

app.use('/moves', require('./app/routes/movements'))
app.use(express.static('app'))

app.use('/dates', require('./app/routes/dates'))
app.use(express.static('app'))

let io = new Server(server, {
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "UPDATE"]
    }
})

let nots = []
io.on("connection", (socket) => {
    console.log(`User Connected ${socket.id}`)
    
    socket.on("join_room", (data) => {
        socket.join(data);
    })

    socket.on("send_message", (data) => {
        nots.unshift(data)
        socket.to(data.room).emit("receive_message", nots)
    })

    socket.on("clean_nots", (data) => {
    nots = []
    socket.to(data.room).emit("receive_message", nots)
    })

})

server.listen(PORT, () => {
    console.log('listening in port ' + PORT)
})

