import Buffer from "../buffer";
import Program from "../program";

export default class Github extends Program {
    run(ctx) {
        ctx.stdout.write("<a target='_blank' href='https://github.com/aligator'>github.com/aligator</a>\n")
        
        return 0
    } 
}