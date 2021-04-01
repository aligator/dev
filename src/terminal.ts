import Buffer from './buffer'
import Program from './program'
import Help from './programs/help'
import Github from './programs/github'

export default class Terminal {
    mixed: Buffer = new Buffer()
    stdout: Buffer = new Buffer()
    stderr: Buffer = new Buffer()
    stdin: Buffer = new Buffer()

    commands: Record<string, Program> = {}

    constructor() {
        this.commands["help"] = new Help()
        this.commands["github"] = new Github()
    }

    run(...args: string[]) {
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

    write(text: string) {
        this.stdin.write(text)
    }
}