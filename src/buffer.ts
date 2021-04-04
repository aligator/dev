import {PlainJSXElement, Fragment} from './plainJSX'

export default class Buffer {
    private onWrites: ((buffer: Buffer) => void)[] = []
    private onReads: ((buffer: Buffer) => void)[] = []

    private buffer: string = ""

    bindInputElement(element: HTMLInputElement, onSend: (text: string) => void) {
        element.addEventListener("paste", (e) => {
            if (!e.clipboardData) {
                return
            }

            let paste = (e.clipboardData).getData('text');
            this.write(paste)
            e.preventDefault();
        })
        element.addEventListener("keydown", (e) => {
            // e.preventDefault()
            // e.stopPropagation()
            switch (e.key) {
                case "Backspace":
                    // delete one char
                    this.buffer = this.buffer.substring(0, this.buffer.length-1)
                    this.write("")
                    break;
                case "Enter":
                    if (e.shiftKey) {
                        this.write("\n")
                    } else {
                        onSend(this.read())
                    }
                    break;
                case "Shift":
                case "Control":
                case "Alt":
                    break
                default:
                    // Ignore if special keys are pressed
                    if (e.ctrlKey || e.altKey) {
                        break
                    }
                    this.write(e.key)
            }
        })
    }

    write(...values: (PlainJSXElement | PlainJSXElement[] | string)[]) {
        const printAll = (...data: (PlainJSXElement | PlainJSXElement[] | string)[]) => {
            data.forEach(element => {
                if (element instanceof PlainJSXElement) {       
                    this.buffer += element.outerHTML + "\n"
                } else if (typeof element === "string") {
                    this.buffer += element
                } else if (Array.isArray(element)) {
                    printAll(element)
                } else {
                    console.error("write called without valid value", element)
                    return
                }
            });
        }
        
        printAll(...values)

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