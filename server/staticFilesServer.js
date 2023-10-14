import { createServer } from 'http'
import { readFile } from 'fs'

const publicFolders = ['client', 'utils']

const isURLinPublicFolder = (url, publicFolders) => {
    for (const publicFolder of publicFolders) {
        const regex = new RegExp(`^${publicFolder}/\\w+`)
        const match = url.match(regex)
        if (match) return true
    }
    return false
}

const port = 5173

const server = createServer((req, res) => {
    const url = (req.url) ? req.url: '/'
    const path = (url !== '/') ? url.replace(/^\//, ''): 'client/index.html'

    console.log(req.socket.remoteAddress, path)
    if (!isURLinPublicFolder(path, publicFolders)) {
        res.writeHead(401)
        res.end(`401 ${url}`)
        return
    }

    readFile(path, 'utf-8', (error, data) => {
        if (error) {
            res.writeHead(404)
            res.end(`404 ${url}`)
            return
        }

        if      (path.match(/.html$/)) res.writeHead(200, {'Content-Type': 'text/html'})
        else if (path.match(/.js$/  )) res.writeHead(200, {'Content-Type': 'text/javascript'})
        else if (path.match(/.css$/ )) res.writeHead(200, {'Content-Type': 'text/css'})

        res.end(data)
    })

})
server.listen(port, () => console.log(`Listening ${port}`))