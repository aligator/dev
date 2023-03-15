import Program, { Context } from "../program"
import TestWindow from "../windows/test"

export default class TestLauncher extends Program {
    async run(ctx: Context, args: string[]): Promise<number> {
        new TestWindow(args[1])
        return 0
    }
}
