export default class Buffer {
    private onWrites: ((buffer: Buffer) => void)[] = []
    private onReads: ((buffer: Buffer) => void)[] = []

    private buffer: string = ""

    bindInputElement(element: HTMLElement, onSend: (text: string) => void) {
        element.addEventListener("keydown", (e) => {
            console.log("keydown", e)
            switch (e.key) {
                case "Backspace":
                    this.buffer = this.buffer.substring(0, this.buffer.length-1)
                    this.write("")
                    break;
                default:
            }
        })
        element.addEventListener("keypress", (e) => {
            console.log("keypress", e)
            if (e.key) {
                switch (e.key) {
                    case "Enter":
                        if (e.shiftKey) {
                            this.write("\n")
                        } else {
                            onSend(this.read())
                        }
                        
                        break;
                    default:
                        this.write(e.key)
                }
            }
        })
    }

    write(data: string) {
        this.buffer += data

        this.onWrites.forEach((onWrite) => {
            onWrite(this)
        })
    }

    read(): string {
        const data = this.buffer
        this.buffer = ""
        this.onReads.forEach((onRead) => {
            onRead(this)
        })
        return data
    }

    get(): string {
        return this.buffer;
    }

    on(event: "write" | "read", cb: (buffer: Buffer) => void) {
        switch (event) {
            case "write":
                this.onWrites.push(cb)
                break
            case "read":
                this.onReads.push(cb)
                break
            default:
        }
    }
}