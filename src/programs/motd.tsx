import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";
import {runOnClick} from "../utils";


export default class Motd extends Program {
    async run(ctx: Context) {
        // ToDo: base the size of the ASCII on the window size to be somehow "responsive"

        ctx.stdout.write(
            <>
{` ========================================================================================
|                                Welcome to `}<a target="_blank" href='https://aligator.dev'>aligator.dev</a>{`!                                |
|                                                                                        |
|                                                                                        |
|                                    `}<a target="_blank" href='https://github.com/aligator/dev'>This page is WIP</a>{`                                    |
|                                                                                        |
|                 Please type '`}<a href="#help" onclick={runOnClick(ctx, "help")}>help</a>{`' to see a list of available commands.                |
|                                                                              `}<a href="#imprint" onclick={runOnClick(ctx, "imprint")}>Imprint</a>{` |
 ========================================================================================
`}
            </>
        )
        return 0
    } 
} 