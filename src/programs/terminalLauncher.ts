import Program from "../program"
import Terminal from "../windows/terminal"

export default class TerminalLauncher extends Program {
    async run(): Promise<number> {
        new Terminal()
        return 0
    }
}
