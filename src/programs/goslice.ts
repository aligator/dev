import Program from "../program";
import {runWasm} from "../wasm";


export default class GoSlice extends Program {
    async run(ctx, args) {
        ctx.stdout.write("Note: Chrome is preferred as it is much faster.\n\n")

        return runWasm(ctx, "goslice.wasm", args).then((gcode: string) => {
            if (!gcode) {
                ctx.stdout.write("no gcode generated")
                return 0
            }

            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(gcode));
            const splittedFile = args[1].split("/")

            element.setAttribute('download', splittedFile[splittedFile.length-1] + ".gcode");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

            return 0
        }).catch((err) => {
            ctx.stderr.write(err)
            return 1
        })
    } 
}
