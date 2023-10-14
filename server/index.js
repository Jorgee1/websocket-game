import { z } from 'zod'
import { WebSocketServer } from 'ws'



/**
 * @readonly
 * @enum {string}
 */
const messages = [
    
]

const server = new WebSocketServer({port: 8080})

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
    console.log('Someone just came')
    socket.on('message', messageRaw => {
        const {message, payload} = parseMessage(messageRaw)

        console.log(message, payload)
    })
})
server.on('error', error => console.error(error))

