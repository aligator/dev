import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";
import {runOnClick} from "../utils";
import Terminal from "../windows/terminal";

export default class TerminalLauncher extends Program {
    async run(ctx: Context) {
        new Terminal()
        return 0
    } 
} 