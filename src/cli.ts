import { figit } from ".";
import * as path from "path";
import * as minimist from "minimist";

async function main(): Promise<void> {
    const argv = minimist(process.argv.slice(2));
    const filePaths = argv._.map(filePath => path.resolve(filePath));
    if (filePaths.length === 0) {
        console.error(`No files specified.`);
        console.log(`Usage: figit [files...] --output=json|yaml`)
        console.log(`Default output: json`);
        console.log(`Example: figit myconfig.js --output=yaml`);
        process.exit(1);
    }

    for await (const output of figit({ filePaths: filePaths, output: argv.output })) {
        console.log(output);
    }
}

main()
    .catch(err => {
        console.error(`An error occurred.`);
        console.error(err.message || err.stack || err);
        process.exit(1);
    });
