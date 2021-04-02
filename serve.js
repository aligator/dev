var connect  = require('connect')
var static = require('serve-static')
var child_process = require('child_process')
var chokidar = require('chokidar');

// Watch for typescript src.
const watch = child_process.spawn("yarn", ["watch"])
watch.stdout.on("data", (data) => {
    console.log(data.toString())
})
watch.stderr.on("data", (data) => {
    console.error(data.toString())
})
watch.on("close", (code) => {
    console.log("closed tsc-watch with " + code)
})

// Watch for public folder.
chokidar.watch("./public").on("all", (event, path) => {
    console.log(event, path)
    child_process.exec("yarn dist-public:dev", (error, stdout, stderr) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(stdout.toString())
        console.error(stderr.toString())
    })
})

// Watch goslice folder.
chokidar.watch("./goslice").on("all", (event, path) => {
    console.log(event, path)
    process.env.GOOS="js"
    process.env.GOARCH="wasm"
    child_process.exec("yarn build:go", (error, stdout, stderr) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(stdout.toString())
        console.error(stderr.toString())
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
