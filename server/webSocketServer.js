//import { z } from 'zod'
import { randomBytes } from 'crypto'
import { WebSocketServer, WebSocket } from 'ws'
import { sleep } from '../utils/sleep.js'
import { parseMessage } from '../utils/parseMessage.js'
import { encodeMessage } from '../utils/encodeMessage.js'
import { Rect } from '../utils/rect.js'
/**
 * @typedef {{id: string, socket: WebSocket, rect: Rect}} Client
 */

/**
 * @type {NodeJS.Timeout}
 */
let timer

/**
 * @type {Client[]}
 */
const clients = []

const server = new WebSocketServer({port: 8080})

server.on('connection', socket => {
    const id = randomBytes(25).toString('base64')
    const rect = new Rect(
        Math.random() * (640 - 40),
        Math.random() * (480 - 40),
        40,
        40
    )
    clients.push({id, socket, rect})

    for (const client of clients) {
        //if (client.id === id) continue
        client.socket.send(encodeMessage('clientNew', {id, rect}))
    }

    console.log(id, 'has come')
    socket.on('message', messageRaw => {
        const {message, payload} = parseMessage(messageRaw)
        if (message === 'getClients'){
            const response = encodeMessage('getClientsResponse', {id, clients: clients.map(({id, rect}) => ({id, rect}))})
            console.log(response)
            socket.send(response)
        } else if (message === 'positionUpdate') {
            if(!payload) return
            if (!(typeof payload === 'object')) return
            if (!('x' in payload && 'y' in payload)) return
            if (!(typeof payload.x === 'number' && typeof payload.y === 'number')) return
            rect.x = payload.x
            rect.y = payload.y

            for (const client of clients) {
                if (client.id === id) continue
                client.socket.send(encodeMessage('positionUpdateFromServer', {
                    id, position: {x: rect.x, y: rect.y}
                }))
            }
        }
        console.log(message, payload)
    })
    socket.on('close', () => {
        const index = clients.findIndex((e) => e.id === id)
        if (index >= 0) {
            clients.splice(index, 1)
            for (const client of clients) {
                client.socket.send(encodeMessage('clientRemoved', id))
            }
        }
        console.log(id, 'has exited')
    })
    socket.on('pong', async () => {
        if (timer) clearTimeout(timer)
        await sleep(10000)
        socket.ping()
        timer = setTimeout(() => {
            socket.close()
            console.log(`${id} stoped responding`)
        }, 10000)
        /*console.log('received pong')*/
    })
        
})
server.on('error', error => console.error(error))

