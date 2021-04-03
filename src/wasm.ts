import {Context} from "./program";

if (WebAssembly) {
    // WebAssembly.instantiateStreaming is not currently available in Safari
    if (WebAssembly && !WebAssembly.instantiateStreaming) { // polyfill
        WebAssembly.instantiateStreaming = async (resp, importObject) => {
            const source = await (await resp).arrayBuffer();
            return WebAssembly.instantiate(source, importObject)
        };
    }
} else {
    console.log("WebAssembly is not supported in your browser")
}

let instance = 0

export function runWasm(ctx: Context, file: string, args: string[]) {
    return new Promise(((resolve, reject) => {
        if (WebAssembly.instantiateStreaming) {
            const go = new globalThis.Go();
            go.argv = args
            const instanceName = `wasmInstance${instance}`
            go.argv[0] = instanceName

            instance++

            WebAssembly.instantiateStreaming(fetch(file), go.importObject).then((result) => {
                go.run(result.instance);
            });

            const tryToConnect = () => {
                if (!globalThis[instanceName]) {
                    setTimeout(tryToConnect,1000)
                    return
                }

                let err = globalThis[instanceName].stdout((message) => ctx.stdout.write(message))
                if (err) {
                    reject(err)
                }

                err = globalThis[instanceName].stderr((message) => ctx.stderr.write(message))
                if (err) {
                    reject(err)
                }

                if (globalThis[instanceName].get) {
                    globalThis[instanceName].get().then(resolve).catch(reject)
                }
            }
            tryToConnect()
        } else {
            reject("web assembly not possible")
        }
    }))
}