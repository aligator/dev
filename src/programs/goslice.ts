import Buffer from "../buffer";
import Program from "../program";

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

// if (WebAssembly) {
//     // WebAssembly.instantiateStreaming is not currently available in Safari
//     if (WebAssembly && !WebAssembly.instantiateStreaming) { // polyfill
//         WebAssembly.instantiateStreaming = async (resp, importObject) => {
//             const source = await (await resp).arrayBuffer();
//             return WebAssembly.instantiate(source, importObject)
//         };
//     }
//
//     const go = new globalThis.Go();
//
//     WebAssembly.instantiateStreaming(fetch("goslice.wasm"), go.importObject).then((result) => {
//         go.run(result.instance);
//     });
// } else {
//     console.log("WebAssembly is not supported in your browser")
// }

export default class GoSlice extends Program {
    async run(ctx, args) {
        ctx.stdout.write("As goslice in Webassembly blocks the web page, please note that the browser may be unresponsive for some time. (Based on how large your stl file is.)\nChrome seems to be faster.\n\n")

        return new Promise(((resolve, reject) => {
            if (WebAssembly.instantiateStreaming) {
                const go = new globalThis.Go();
                go.argv = args
                console.log(go.argv)

                WebAssembly.instantiateStreaming(fetch("goslice.wasm"), go.importObject).then((result) => {
                    go.run(result.instance);
                });

                const checkResult = () => {
                    if (!globalThis.pollGoSlice) {
                        setTimeout(checkResult, 1000)
                    }

                    const res = globalThis.pollGoSlice(args, ctx.stdout)
                    if (typeof res == "string" || res == null) {
                        if (res != "" && res != null) {
                            resolve(res)
                        } else {
                            setTimeout(checkResult, 1000)
                        }
                    } else {
                        reject(res)
                    }
                }

                setTimeout(checkResult, 1000)
            } else {
                reject("web assembly not possible")
            }
        })).then((gcode) => {
            ctx.stdout.write(gcode)
            return 0
        }).catch((err) => {
            ctx.stderr.write(err)
            return 1
        })
    } 
}
