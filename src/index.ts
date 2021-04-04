import Terminal from './terminal'
import './window'

function run() {
    const consoleContainer = document.getElementById('console-container')
    const consoleInput: HTMLInputElement = document.getElementById('console-input') as HTMLInputElement
    const root = document.getElementById('root')
    if (!root || !consoleInput || !consoleContainer) {
        return
    }


    root.addEventListener("click", () => {
        consoleInput.focus()
    })

    const t = new Terminal()

    t.stdout.on("write", ((b) => {
        consoleContainer.innerHTML += b.read()
        consoleInput.scrollIntoView({behavior: "smooth"});
    }))

    t.stderr.on("write", ((b) => {
        consoleContainer.innerHTML += "<span class='term-error'>" + b.read() + "</span>"
        consoleInput.scrollIntoView({behavior: "smooth"});
    }))

    consoleInput.addEventListener("change", (e) => {
        consoleInput.scrollIntoView({behavior: "smooth"});
    })

    consoleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            t.run((consoleInput.value || "").split(" "))
            consoleInput.value = ""
        }
    })

    t.run(["motd"], {
        noEcho: true
    })
}

run()