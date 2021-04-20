import Program, { Context } from "../program";
import GCodeViewer from "../windows/gcodeViewer";

export default class GCodeViewerLauncher extends Program {
    async run(ctx: Context) {
        new GCodeViewer()
        return 0
    } 
} 