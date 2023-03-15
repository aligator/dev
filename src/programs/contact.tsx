import * as PlainJSX from "../plainJSX"
import Program, { Context } from "../program"

export default class Contact extends Program {
    async run(ctx: Context): Promise<number> {
        // ToDo: base the size of the ASCII on the window size to be somehow "responsive"

        ctx.stdout.write(
            <div className="center">
                <h1 className="color-heading">Contact</h1>
                <a
                    href={`mailto:me${"@"}aligator.dev`}
                >{`me${"@"}aligator.dev`}</a>
                <br />
                <a
                    href="https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2aaab9c285a8bd5c347da49469810152911c5492"
                    download="aligator.pub.asc"
                >
                    PGP Key
                </a>
            </div>
        )
        return ctx.terminal.runCommand(["github"])
    }
}
