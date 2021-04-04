import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";
import {runOnClick} from "../utils";

export default class Help extends Program {
    async run(ctx: Context) {
        ctx.stdout.write(<>Help for <a target="_blank" href='https://aligator.dev'>aligator.dev</a>{`
        
`}<a href="#help" onclick={runOnClick(ctx, "help")} >help</a>{`\t\t\tPrints this help.
`}<a href="#motd" onclick={runOnClick(ctx, "motd")} >motd</a>{`\t\t\tMessage of the day.
`}<a href="#github" onclick={runOnClick(ctx, "github")} >github</a>{`\t\t\tGithub profile.
`}<a href="#goslice" onclick={runOnClick(ctx, "goslice", "gopher.stl")} >goslice</a>{`\t\t\t`}<a target="_blank" href="https://github.com/aligator/goslice">GoSlice</a>{` running as webassembly inside the browser. Modified to accept URLs to stl files directly. Example file 'gopher.stl' is always available.

`}
        </>)

        
        
        return 0
    } 
}