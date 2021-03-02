import * as YAML from 'yaml'

export interface IFigitOptions {
    //
    // Template files to process and export.
    //
    filePaths: string[];

    //
    // Sets the output format, defaults to "json".
    //
    output?: "json" | "yaml";
};

//
// Process template files and export the generated data.
//
export async function* figit(options: IFigitOptions): AsyncIterable<string> {
    if (options.filePaths === undefined || options.filePaths.length === 0) {
        throw new Error(`No file paths specified, please set "filePaths" to an array of paths for template.`);
    }

    for (const filePath of options.filePaths) {
        const data = require(filePath);
        if (options.output === undefined || options.output === "json") {
            yield JSON.stringify(data, null, 4);
        }
        else if (options.output === "yaml") {
            yield YAML.stringify(data);
        }
        else {
            throw Error(`Invalid output format ${options.output}, expected "json" or "yaml".`);
        }
    }

}