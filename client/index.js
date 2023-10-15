import { sleep } from '../utils/sleep.js'
import { encodeMessage } from '../utils/encodeMessage.js'
import { parseMessage } from '../utils/parseMessage.js'
import { Rect } from '../utils/rect.js'

/**
 * @typedef {{
 *  id: string,
 *  rect: Rect
 * }} Client
 */
/**
 * 
 * @param {unknown} e 
 * @returns {boolean}
 */
const isClient = (e) => {
    if (!e) return false
    if (!(typeof e === 'object')) return false
    if (!('id' in e && 'rect' in e)) return false
    return true
}


/**
 * 
 * @param {WebSocket} ws 
 */
const initWS = (ws) => {
    ws.addEventListener('open', () => {
        ws.send(encodeMessage('getClients', {}))
    })
    ws.addEventListener('message', (event) => {
        const {message, payload} = parseMessage(event.data)
        //console.log(message, payload)
        if (message === 'getClientsResponse') {
            document.dispatchEvent(new CustomEvent('getClientsResponse', {detail: payload}))
        } else if (message === 'clientNew') {
            document.dispatchEvent(new CustomEvent('clientNew', {detail: payload}))
        } else if (message === 'clientRemoved') {
            document.dispatchEvent(new CustomEvent('clientRemoved', {detail: payload}))
        }
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

const main = () => {
    document.body.replaceChildren()


    const header = document.createElement('h1')
    header.textContent = 'HAYYHYAHYHA'
    document.body.append(header)

    /**
     * @type {Array<Client>}
     */
    let clients = []
    document.addEventListener('getClientsResponse', (event) => {
        if (!('detail' in event)) return
        if (!(event.detail instanceof Array)) return
        if (!event.detail.every(isClient)) return
        clients = event.detail
    })
    document.addEventListener('clientNew', (data) => {
        if (!('detail' in data)) return
        if (!isClient(data.detail)) return

        const newClient = /** @type {Client} */ (data.detail)

        clients.push(newClient)
    })
    document.addEventListener('clientRemoved', (data) => {
        if (!('detail' in data)) return
        if (!(typeof data.detail === 'string')) return
        console.log('remove', data.detail)

        const index = clients.findIndex((e) => e.id === data.detail)
        if (index < 0) return

        clients.splice(index, 1)
    })

    let ws = new WebSocket('ws://localhost:8080')
    initWS(ws)



    const canvas = document.createElement('canvas')
    document.body.append(canvas)
    canvas.width = 640
    canvas.height = 480
    const context = canvas.getContext("2d")


    const gameLoop = () => {
        if (!context) return
        context.fillStyle = 'gray'
        context.fillRect(0,0,canvas.width, canvas.height)

        context.fillStyle = 'red'
        for (const client of clients) {
            const rect = client.rect
            context.fillRect(rect.x, rect.y, rect.w, rect.h)
        }
        window.requestAnimationFrame(gameLoop)
    }
    window.requestAnimationFrame(gameLoop)

}
main()