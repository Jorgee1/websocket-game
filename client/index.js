/**
 * 
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 
 * @param {WebSocket} ws 
 */
const initWS = (ws) => {
    ws.addEventListener('open', () => {
        console.log('i have come')
        ws.send('asd {}')
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