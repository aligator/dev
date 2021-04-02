import Buffer from './buffer';
import Help from './programs/help';
import Github from './programs/github';
import GoSlice from './programs/goslice';
export default class Terminal {
    constructor() {
        this.mixed = new Buffer();
        this.stdout = new Buffer();
        this.stderr = new Buffer();
        this.stdin = new Buffer();
        this.commands = {};
        this.commands["help"] = new Help();
        this.commands["github"] = new Github();
        this.commands["goslice"] = new GoSlice();
    }
    run(...args) {
        console.log("???????");
        const cmd = this.commands[args[0]];
        if (cmd === undefined) {
            this.stderr.write(`command '${args[0]}' not found\n`);
            return;
        }
        console.log("Run " + args[0]);
        cmd.run({
            terminal: this,
            stderr: this.stderr,
            stdout: this.stdout
        }, args);
    }
    write(text) {
        this.stdin.write(text);
    }
}
//# sourceMappingURL=terminal.js.map