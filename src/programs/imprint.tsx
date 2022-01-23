import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";

export default class Imprint extends Program {
    async run(ctx: Context): Promise<number> {
        // ToDo: base the size of the ASCII on the window size to be somehow "responsive"

        ctx.stdout.write(
            <div className="center">
                <h1 className="color-heading">Contact</h1>
                me (at) aligator.dev<br/>
                <a href="https://keys.mailvelope.com/pks/lookup?op=get&search=me@aligator.dev">PGP Key</a>

                <h2 className="color-heading">Imprint</h2>
                Johannes Hörmann<br/>
                Untere Schwimmschulstraße 3<br/>
                84034 Landshut<br/>
                Germany<br/>
            </div>
        )
        return ctx.terminal.runCommand(["github"])
    } 
} 