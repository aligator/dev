import {PlainJSXElement, Fragment} from './plainJSX'

export default class Buffer {
    private onWrites: ((buffer: Buffer) => void)[] = []
    private onReads: ((buffer: Buffer) => void)[] = []

    private buffer: PlainJSXElement

    constructor() {
        this.buffer = new PlainJSXElement("")
    }

    write(...values: (PlainJSXElement | PlainJSXElement[] | string)[]) {
        const printAll = (...data: (PlainJSXElement | PlainJSXElement[] | string)[]) => {
            data.forEach(element => {
                if (element instanceof PlainJSXElement) {
                    this.buffer.children.push(...element.children)
                } else if (typeof element === "string") {
                    this.buffer.children.push(element)
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

    read(): PlainJSXElement {
        const data = this.buffer

        for (let i=0; i<=this.buffer.children.length; i++) {
            if (typeof this.buffer.children[i] !== "string") {
                (this.buffer.children[i] as Element | undefined)?.remove()
            }
        }

        this.buffer = new PlainJSXElement("")

        this.onReads.forEach((onRead) => {
            onRead(this)
        })
        return data
    }

    get(): PlainJSXElement {
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