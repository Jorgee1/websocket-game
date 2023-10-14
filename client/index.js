const header = document.createElement('h1')
header.textContent = 'HAYYHYAHYHA'
document.body.replaceChildren()
document.body.append(header)



const ws = new WebSocket('ws://localhost:8080')

ws.addEventListener('open', () => {
    console.log('i have come')
    ws.send('asd {}')
})