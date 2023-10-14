import { z } from 'zod'
import { randomBytes } from 'crypto'
import { WebSocketServer, WebSocket } from 'ws'
/**
 * @typedef {{id: string, socket: WebSocket}} Client
 */



/**
 * @type {Client[]}
 */
const clients = []
const server = new WebSocketServer({port: 8080})

/**
 * 
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 
 * @param {import('ws').RawData} messageRaw
 * @returns {{
 *  message: string
 *  payload: object
 * }}
 */
const parseMessage = (messageRaw) => {
    const [message, ...splitPayload] = messageRaw.toString().split(' ')
    const payloadRaw = splitPayload.join(' ')
    let payload = {}
    try { payload = JSON.parse(payloadRaw) }
    catch (error){ console.error(error) }

    return {message, payload}
}


server.on('connection', socket => {
    const id = randomBytes(25).toString('base64')
    clients.push({id, socket})

    console.log(id, 'has come')
    socket.on('message', messageRaw => {
        const {message, payload} = parseMessage(messageRaw)

        console.log(message, payload)
    })
    socket.on('close', () => {
        const index = clients.findIndex((e) => e.id === id)
        if (index >= 0) clients.splice(index, 1)
        console.log(id, 'has exited')
    })

    
    socket.on('pong', () => console.log('received pong'))
    
    setInterval(() => {
        console.log('Sending ping')
        socket.ping()
    }, 10000)
    
})
server.on('error', error => console.error(error))

