import Buffer from "../buffer";
import Program from "../program";

export default class Help extends Program {
    run(ctx) {
        ctx.stdout.write(`Help for <a href='https://aligator.dev'>aligator.dev</a>
        
        help\t\t\tPrints this help.
        github\t\t\tGithub profile.
        
        `)
        
        return 0
    } 
}