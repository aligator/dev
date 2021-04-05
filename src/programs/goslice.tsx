import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";
import {runWasm} from "../wasm";

export default class GoSlice extends Program {
    async run(ctx: Context, args: string[]) {
        ctx.stderr.write("The whole website may freeze between the log outputs.\nThis is known and cannot be worked around currently!\n")
        ctx.stdout.write("Note: Chrome is preferred as it is much faster.\n\n")

        return runWasm(ctx, "goslice.wasm", args).then((gcode: string | null) => {
            if (!gcode) {
                ctx.stdout.write("no gcode generated")
                return 0
            }

            const splittedFile = args[1].split("/")
            const filename = splittedFile[splittedFile.length-1] + ".gcode"
            const url = URL.createObjectURL(new File([gcode], filename, {
                type: "text/x.gcode"
            }))

            // Wait some time that the stdout gets fully written before posting the link.
            setTimeout(() => {
                ctx.stdout.write(<><a href={url} download={filename}>{filename + " DOWNLOAD"}</a><br/></>)
            }, 1000)
            return 0
        }).catch((err) => {
            ctx.stderr.write(err)
            return 1
        })
    } 
}
