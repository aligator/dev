import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";

export default class Imprint extends Program {
    async run(ctx: Context): Promise<number> {
        // ToDo: base the size of the ASCII on the window size to be somehow "responsive"

        ctx.stdout.write(
            <div className="center">
                <h1 className="color-heading">Contact</h1>
                me (at) aligator.dev<br/>
                <a href="https://keys.openpgp.org/search?q=me%40aligator.dev">PGP Key</a>
            </div>
        )
        return ctx.terminal.runCommand(["github"])
    } 
} 
