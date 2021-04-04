import {Context} from "./program";

export const runOnClick = (ctx: Context, ...args: string[]) => (e: MouseEvent) => {
    e.preventDefault()
    ctx.terminal.run(args)
    return false
}