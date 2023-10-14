import { z } from 'zod'
import { randomBytes } from 'crypto'
import { WebSocketServer, WebSocket } from 'ws'
import { parseMessage } from '../utils/parseMessage.js'

/**
 * @typedef {{id: string, socket: WebSocket}} Client
 */

/**
 * @type {Client[]}
 */
const clients = []

const server = new WebSocketServer({port: 8080})

server.on('connection', socket => {
    const id = randomBytes(25).toString('base64')
    clients.push({id, socket})

    console.log(id, 'has come')
    socket.on('message', messageRaw => {
        const {message, payload} = parseMessage(messageRaw)
        if (message === 'getClients'){
            socket.send('getClientsResponse '+JSON.stringify(clients.map(e => e.id)))
        }
        console.log(message, payload)
    })
    socket.on('close', () => {
        const index = clients.findIndex((e) => e.id === id)
        if (index >= 0) clients.splice(index, 1)
        console.log(id, 'has exited')
    })

    
    socket.on('pong', () => {/*console.log('received pong')*/})
    
    setInterval(() => {
        console.log('Sending ping')
        socket.ping()
    }, 10000)
    
})
server.on('error', error => console.error(error))

