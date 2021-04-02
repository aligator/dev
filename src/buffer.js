export default class Buffer {
    constructor() {
        this.onWrites = [];
        this.onReads = [];
        this.buffer = "";
    }
    bindInputElement(element, onSend) {
        element.addEventListener("keydown", (e) => {
            // e.preventDefault()
            // e.stopPropagation()
            console.log("keydown", e);
            switch (e.key) {
                case "Backspace":
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    this.write("");
                    break;
                case "Enter":
                    if (e.shiftKey) {
                        this.write("\n");
                    }
                    else {
                        console.log("????asd???");
                        onSend(this.read());
                        console.log("after");
                    }
                    break;
                default:
                    this.write(e.key);
            }
        });
    }
    write(data) {
        this.buffer += data;
        this.onWrites.forEach((onWrite) => {
            onWrite(this);
        });
    }
    read() {
        const data = this.buffer;
        this.buffer = "";
        this.onReads.forEach((onRead) => {
            onRead(this);
        });
        return data;
    }
    get() {
        return this.buffer;
    }
    on(event, cb) {
        switch (event) {
            case "write":
                this.onWrites.push(cb);
                break;
            case "read":
                this.onReads.push(cb);
                break;
            default:
        }
    }
}
//# sourceMappingURL=buffer.js.map