import { createServer } from 'http'
import { readFile } from 'fs'
import { join } from 'path'

const port = 5173

const server = createServer((req, res) => {
    const url = (req.url) ? req.url: '/'
    const file = (url !== '/') ? url: '/index.html'
    const path = join('client', file)

    readFile(path, 'utf-8', (error, data) => {
        if (error) {
            res.writeHead(404)
            res.end(`404 ${url}`)
            return
        }

        if      (file.match(/.html$/)) res.writeHead(200, {'Content-Type': 'text/html'})
        else if (file.match(/.js$/  )) res.writeHead(200, {'Content-Type': 'text/javascript'})
        else if (file.match(/.css$/ )) res.writeHead(200, {'Content-Type': 'text/css'})

        res.end(data)
    })

})
server.listen(port, () => console.log(`Listening ${port}`))