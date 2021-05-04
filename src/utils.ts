import {Context} from "./program";

const root = document.getElementById('root')

export const runOnClick = (ctx: Context, ...args: string[]) => (e: MouseEvent): boolean => {
    e.preventDefault()
    e.stopPropagation()

    ctx.terminal.runCommand(args)
    return false
}

export const getRoot = (): HTMLElement => {
    if (!root) {
        throw new Error("root not found")
    }
    return root;
}