const http = require('http')

const PORT = 8000
const serverHandle = require('./app')
const sever = http.createServer(serverHandle)

sever.listen(PORT)