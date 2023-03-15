import Buffer from "./buffer"
import Terminal from "./windows/terminal"

export interface Context {
    terminal: Terminal
    stdout: Buffer
    stderr: Buffer
}

export default abstract class Program {
    abstract run(ctx: Context, args: string[]): Promise<number>
}
