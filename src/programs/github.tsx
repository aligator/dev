import * as PlainJSX from "../plainJSX";
import Program, { Context } from "../program";

export default class Github extends Program {
    async run(ctx: Context) {
        ctx.stdout.write(<a target='_blank' href='https://github.com/aligator'>github.com/aligator</a>)
        
        return 0
    } 
}