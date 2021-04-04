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

export function runWasm(ctx: Context, file: string, args: string[]): Promise<any> {
    return new Promise(((resolve, reject) => {
        if (WebAssembly.instantiateStreaming) {
            const anyGlobalThis = (globalThis as any)

            const go = new anyGlobalThis.Go();
            go.argv = args
            const instanceName = `wasmInstance${instance}`
            go.argv[0] = instanceName

            instance++

            WebAssembly.instantiateStreaming(fetch(file), go.importObject).then((result) => {
                go.run(result.instance);
            });

            const tryToConnect = () => {
                if (!anyGlobalThis[instanceName]) {
                    setTimeout(tryToConnect,1000)
                    return
                }

                let err = anyGlobalThis[instanceName].stdout((message: string) => ctx.stdout.write(message))
                if (err) {
                    reject(err)
                }

                err = anyGlobalThis[instanceName].stderr((message: string) => ctx.stderr.write(message))
                if (err) {
                    reject(err)
                }

                if (anyGlobalThis[instanceName].get) {
                    anyGlobalThis[instanceName].get().then(resolve).catch(reject)
                }
            }
            tryToConnect()
        } else {
            reject("web assembly not possible")
        }
    }))
}