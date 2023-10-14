import { sleep } from '../utils/sleep.js'
import { parseMessage } from '../utils/parseMessage.js'
/**
 * 
 * @param {WebSocket} ws 
 */
const initWS = (ws) => {
    ws.addEventListener('open', () => {
        console.log('i have come')
        ws.send('getClients {}')
    })
    ws.addEventListener('message', (event) => {
        const {message, payload} = parseMessage(event.data)
        console.log(message, payload)
    })
    ws.addEventListener('error', (event) => {
        console.error(event)
    })
    ws.addEventListener('close', async (event) => {
        // The browser does the retying and ponging
        await sleep(1000)
        ws = new WebSocket('ws://localhost:8080')
        initWS(ws)
    })
}

const header = document.createElement('h1')
header.textContent = 'HAYYHYAHYHA'
document.body.replaceChildren()
document.body.append(header)



let ws = new WebSocket('ws://localhost:8080')
initWS(ws)