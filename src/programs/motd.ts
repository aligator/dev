import Buffer from "../buffer";
import Program from "../program";

export default class Motd extends Program {
    async run(ctx) {
        ctx.stdout.write(
` ========================================================================================
|                                Welcome to <a href='https://aligator.dev' alt="aligator.dev">aligator.dev</a>!                                |
|                                                                                        |
|                                    <a href='https://github.com/aligator/dev' alt="aligator.dev Github">This page is WIP</a>                                    |
|                                                                                        |
|                 Please type 'help' to see a list of available commands.                |
 ========================================================================================
`)
        return 0
    } 
}