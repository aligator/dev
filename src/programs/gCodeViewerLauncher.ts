import Program, { Context } from "../program";
import GCodeViewer from "../windows/gCodeViewer";

export default class GCodeViewerLauncher extends Program {
    async run(ctx: Context, args: string[]) {
        new GCodeViewer(args[1])
        return 0
    } 
} 