import Program from "../program";

export default class Help extends Program {
    async run(ctx) {
        ctx.stdout.write(`Help for <a href='https://aligator.dev' alt="aligator.dev">aligator.dev</a>

help\t\t\tPrints this help.
motd\t\t\tMessage of the day
github\t\t\tGithub profile.
goslice\t\t\t<a href="https://github.com/aligator/goslice" alt="Goslice">GoSlice</a> running as webassembly inside the browser. Modified to accept URLs to stl files directly. Example file 'gopher.stl' is always available.

`)
        
        return 0
    } 
}