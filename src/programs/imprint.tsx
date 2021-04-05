import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";
import {runOnClick} from "../utils";


export default class Imprint extends Program {
    async run(ctx: Context) {
        // ToDo: base the size of the ASCII on the window size to be somehow "responsive"

        ctx.stdout.write(
            <div className="center">
                <h1 className="color-heading">Contact</h1>
                aligator (at) suncraft-server.de

                <h2 className="color-heading">Imprint</h2>
                Johannes Hörmann<br/>
                Untere Schwimmschulstraße 3<br/>
                84034 Landshut<br/>
                Germany<br/>
            </div>
        )
        ctx.terminal.runCommand(["github"])
        return 0
    } 
} 