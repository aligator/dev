var connect  = require('connect')
var static = require('serve-static')
var child_process = require('child_process')

child_process.exec("yarn bin nodemon", (error, stdout, stderr) => {
    if (error) {
        console.error(error)
        return;
    }
    console.error(stderr.toString())

    const nodemon = child_process.spawn(stdout.toString().trim())
    nodemon.stdout.on("data", (data) => {
        console.log(data.toString())
    })
    nodemon.stderr.on("data", (data) => {
        console.error(data.toString())
    })
    nodemon.on("close", (code) => {
        console.log("closed nodemon with " + code)
    })
})

console.log("start server")

var server = connect()

server.use(static(__dirname + '/build', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith("js")) {
            res.setHeader("Content-Type", "application/javascript")
        }
    }
}))

server.listen(3000)

var livereload = require('livereload')
var lrserver = livereload.createServer()
lrserver.watch(__dirname + "/build")
