import { sleep } from '../utils/sleep.js'
import { encodeMessage } from '../utils/encodeMessage.js'
import { parseMessage } from '../utils/parseMessage.js'
import { Rect } from '../utils/rect.js'

/** @typedef {{id: string, rect: Rect}} Client */
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
 * This is separate to reinitialize the callbacks if the conection breaks
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
        } else if (message === 'positionUpdateFromServer') {
            document.dispatchEvent(new CustomEvent('positionUpdateFromServer', {detail: payload}))
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

const main = async () => {
    document.body.replaceChildren()


    const header = document.createElement('h1')
    header.textContent = 'HAYYHYAHYHA'
    document.body.append(header)

    /** @type {string | undefined} */
    let id = undefined
    /** @type {Array<Client>} */
    let clients = []
    document.addEventListener('getClientsResponse', (event) => {
        if (!('detail' in event)) return
        if (!(event.detail && typeof event.detail === 'object')) return
        if (!('clients' in event.detail && 'id' in event.detail)) return
        if (!(typeof event.detail.id === 'string')) return
        if (!(event.detail.clients instanceof Array)) return
        if (!event.detail.clients.every(isClient)) return
        id = event.detail.id
        clients = event.detail.clients
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
    document.addEventListener('positionUpdateFromServer', (data) => {
        if (!('detail' in data)) return
        if (!data.detail) return
        if (!(typeof data.detail === 'object')) return
        if (!('id' in data.detail)) return
        if (!(typeof data.detail.id === 'string')) return
        if (!('position' in data.detail)) return
        if (!(typeof data.detail.position === 'object')) return
        if (!data.detail.position ) return
        if (!('x' in data.detail.position && 'y' in data.detail.position)) return
        if (!(typeof data.detail.position.x === 'number' && typeof data.detail.position.y === 'number')) return
        /**
         * Me: For the love of god, just use zod already
         * Also me: No
         */
        const clientId = data.detail.id
        const clientToUpdate = clients.find(e => e.id === clientId)
        if (!clientToUpdate) return console.log(`Client to Update not found ${id}`)
        clientToUpdate.rect.x = data.detail.position.x
        clientToUpdate.rect.y = data.detail.position.y
    })
    let ws = new WebSocket('ws://localhost:8080')
    initWS(ws)

    const canvas = document.createElement('canvas')
    document.body.append(canvas)
    canvas.width = 640
    canvas.height = 480
    const context = canvas.getContext("2d")
    if (!context) return console.error(new Error('No Context'))

    // TODO: Redo this later
    while (true) {
        if (id) break
        await sleep(100)
    }

    const keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        action: false
    }

    window.addEventListener('keydown', event => {
        const key = event.key.toLowerCase()
        if (key === 'arrowdown') keys.down = true
        else if (key === 'arrowup') keys.up = true
        else if (key === 'arrowleft') keys.left = true
        else if (key === 'arrowright') keys.right = true
        else if (key === 'z') keys.action = true
    })

    window.addEventListener('keyup', event => {
        const key = event.key.toLowerCase()
        if (key === 'arrowdown') keys.down = false
        else if (key === 'arrowup') keys.up = false
        else if (key === 'arrowleft') keys.left = false
        else if (key === 'arrowright') keys.right = false
        else if (key === 'z') keys.action = false
    })
    const playerSpeed = {x:0, y:0}
    const speed = 10
    const gameLoop = () => {
        const player = clients.find(e => e.id === id)
        if (!player) return console.error(new Error(`Player id ${id} not found`))
        
        if (keys.up) {
            playerSpeed.x = 0
            playerSpeed.y = -speed
        } else if (keys.down) {
            playerSpeed.x = 0
            playerSpeed.y = speed
        } else if (keys.left) {
            playerSpeed.x = -speed
            playerSpeed.y = 0
        } else if (keys.right) {
            playerSpeed.x = speed
            playerSpeed.y = 0
        } else {
            playerSpeed.x = 0
            playerSpeed.y = 0
        }
        player.rect.x += playerSpeed.x
        player.rect.y += playerSpeed.y

        // Render
        context.fillStyle = 'gray'
        context.fillRect(0, 0, canvas.width, canvas.height)

        for (const client of clients) {
            if (client.id === id) context.fillStyle = 'red'
            else context.fillStyle = 'green'

            const rect = client.rect
            context.fillRect(rect.x, rect.y, rect.w, rect.h)
        }

        ws.send(encodeMessage('positionUpdate', player.rect))
        window.requestAnimationFrame(gameLoop)
    }
    window.requestAnimationFrame(gameLoop)

}
main()