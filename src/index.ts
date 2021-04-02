import Terminal from './terminal'
const consoleContainer = document.getElementById('console-container')
const consoleInput = document.getElementById('console-input')
const root = document.getElementById('root')
root.addEventListener("click", () => {
    consoleInput.focus()
})

const t = new Terminal()

t.stdout.on("write", ((b) => {
    consoleContainer.innerHTML += b.read()
}))

t.stderr.on("write", ((b) => {
    consoleContainer.innerHTML += "<span class='term-error'>" + b.read() + "</span>"
}))

t.stdin.on("write", (b) => {
    consoleInput.innerHTML = "$" + b.get()
    consoleInput.scrollIntoView({behavior: "smooth"});
})

t.stdin.on("read", (b) => {
    consoleInput.innerHTML = "$"
})

t.stdin.bindInputElement(consoleInput, (text) => {
    t.run(...text.split(" "))
    consoleInput.scrollIntoView({behavior: "smooth"});
})

t.run("motd")

