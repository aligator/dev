var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Program from "../program";
if (WebAssembly) {
    // WebAssembly.instantiateStreaming is not currently available in Safari
    if (WebAssembly && !WebAssembly.instantiateStreaming) { // polyfill
        WebAssembly.instantiateStreaming = (resp, importObject) => __awaiter(void 0, void 0, void 0, function* () {
            const source = yield (yield resp).arrayBuffer();
            return WebAssembly.instantiate(source, importObject);
        });
    }
}
else {
    console.log("WebAssembly is not supported in your browser");
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
    run(ctx, args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("calll", WebAssembly.instantiateStreaming);
            return new Promise(((resolve, reject) => {
                if (WebAssembly.instantiateStreaming) {
                    const go = new globalThis.Go();
                    console.log("zzzz");
                    WebAssembly.instantiateStreaming(fetch("goslice.wasm"), go.importObject).then((result) => {
                        go.run(result.instance);
                    });
                    console.log("fffffff");
                    const checkResult = () => {
                        if (!globalThis.pollGoSlice) {
                            setTimeout(checkResult, 1000);
                        }
                        console.log("check");
                        const res = globalThis.pollGoSlice(args, ctx.stdout);
                        console.log("check", res, res === null);
                        if (typeof res == "string" || res == null) {
                            if (res != "" && res != null) {
                                resolve(res);
                            }
                            else {
                                setTimeout(checkResult, 1000);
                            }
                        }
                        else {
                            reject(res);
                        }
                    };
                    setTimeout(checkResult, 1000);
                }
                else {
                    reject("web assembly not possible");
                }
            })).then((gcode) => {
                ctx.stdout.write(gcode);
                return 0;
            }).catch((err) => {
                ctx.stderr.write(err);
                return 1;
            });
        });
    }
}
//# sourceMappingURL=goslice.js.map