import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";

export default class Help extends Program {
    async run(ctx: Context) {
        ctx.stdout.write(<>Help for <a target="_blank" href='https://aligator.dev'>aligator.dev</a>{`

help\t\t\tPrints this help.
motd\t\t\tMessage of the day
github\t\t\tGithub profile.
goslice\t\t\t`}<a target="_blank" href="https://github.com/aligator/goslice">GoSlice</a>{` running as webassembly inside the browser. Modified to accept URLs to stl files directly. Example file 'gopher.stl' is always available.

        `}</>)

        
        
        return 0
    } 
}