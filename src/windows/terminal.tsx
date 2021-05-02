import * as PlainJSX from "../plainJSX";
import Buffer from '../buffer'
import Program from '../program'
import Help from '../programs/help'
import Github from '../programs/github'
import GoSlice from '../programs/goslice'
import Motd from "../programs/motd";
import Imprint from "../programs/imprint";
import {Window} from "../window";
import TerminalLauncher from "../programs/terminalLauncher";
import GCodeViewerLauncher from "../programs/gCodeViewerLauncher";

interface Runner{

}

export default class Terminal extends Window {
    stdout: Buffer = new Buffer()
    stderr: Buffer = new Buffer()

    commands: Record<string, Program> = {}
  
    constructor() {
        super()
        this.focus()

        this.setWindowName(<>Terminal</>)
        const consoleContainer = <div id="console-container"></div>
        const consoleContainerElement = (consoleContainer).getFirstAs()
        const consoleInput = <input id="console-input" tabIndex={0} />
        const consoleInputElement: HTMLInputElement = (consoleInput).getFirstAs()

        this.setWindowContent(
            <div id="console">
                {consoleContainer}
                <div id="console-prompt">$</div>{consoleInput}
            </div>
        )

        this.commands["help"] = new Help()
        this.commands["motd"] = new Motd()
        this.commands["github"] = new Github()
        this.commands["goslice"] = new GoSlice()
        this.commands["imprint"] = new Imprint()
        this.commands["terminal"] = new TerminalLauncher()
        this.commands["gcode"] = new GCodeViewerLauncher()
        this.commands["exit"] = {
            run: async () => {
                this.close()
                return 0
            }
        }

        this.onClick = (() => {
            consoleInputElement.focus()
        })

        this.stdout.on("write", ((b) => {
            consoleContainerElement.append(...b.read().children)
            consoleInputElement.scrollIntoView({behavior: "smooth"});
        }))

        this.stderr.on("write", ((b) => {
            const elem = (<span className='term-error'>{b.read()}</span>)
            consoleContainerElement.append(...elem.children)
            consoleInputElement.scrollIntoView({behavior: "smooth"});
        }))

        consoleInputElement.addEventListener("change", (e) => {
            consoleInputElement.scrollIntoView({behavior: "smooth"});
        })

        consoleInputElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.runCommand((consoleInputElement.value || "").split(" "))
                consoleInputElement.value = ""
            }
        })

        this.runCommand(["motd"], {
            noEcho: true
        })
    }

    runCommand(args: string[], options?: {
        noEcho: boolean
    }) {
        if (!options?.noEcho) {
            this.stdout.write("$ " + args.join(" ") + "\n")
        }

        if (args[0].trim().length == 0) {
            return
        }

        const cmd = this.commands[args[0]]
        if (cmd === undefined) {
            this.stderr.write(`command '${args[0]}' not found\n`)
            return
        }
        cmd.run({
            terminal: this,
            stderr: this.stderr,
            stdout: this.stdout
        }, args)
    }
}