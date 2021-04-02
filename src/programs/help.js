var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Program from "../program";
export default class Help extends Program {
    run(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.stdout.write(`Help for <a href='https://aligator.dev'>aligator.dev</a>
        
        help\t\t\tPrints this help.
        github\t\t\tGithub profile.
        
        `);
            return 0;
        });
    }
}
//# sourceMappingURL=help.js.map