import { figit } from ".";
import * as path from "path";
import * as minimist from "minimist";

async function main(): Promise<void> {
    const argv = minimist(process.argv.slice(2));
    const filePaths = argv._.map(filePath => path.resolve(__dirname, "..", filePath));
    for await (const output of figit({ filePaths: filePaths, output: argv.output })) {
        console.log(output);
    }
}

main()
    .catch(err => {
        console.error(`An error occurred.`);
        console.error(err.message || err.stack || err);
    });
