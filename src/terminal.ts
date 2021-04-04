import Buffer from './buffer'
import Program from './program'
import Help from './programs/help'
import Github from './programs/github'
import GoSlice from './programs/goslice'
import Motd from "./programs/motd";

export default class Terminal {
    mixed: Buffer = new Buffer()
    stdout: Buffer = new Buffer()
    stderr: Buffer = new Buffer()

    commands: Record<string, Program> = {}

    constructor() {
        this.commands["help"] = new Help()
        this.commands["motd"] = new Motd()
        this.commands["github"] = new Github()
        this.commands["goslice"] = new GoSlice()
    }

    run(args: string[], options?: {
        noEcho: boolean
    }) {
        if (!options?.noEcho) {
            this.stdout.write("$ " + args.join(" ") + "\n")
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