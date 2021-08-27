import * as YAML from 'yaml'
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as handlebars from 'handlebars';

export interface IFigitOptions {
    //
    // Loads a JSON or Yaml data file to use as template data.
    //
    dataFilePath?: string;

    //
    // Sets standard input to be received as template data in JSON or Yaml format.
    //
    stdin?: "json" | "yaml";

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
        const data = await loadTemplatedDataFile(filePath, options);

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

//
// Supported methods of parsing data.
//
const dataTypes = [
    {
        ext: ".json",
        parse: (fileData: string) => JSON.parse(fileData),
    },
    {
        ext: ".yaml",
        parse: (fileData: string) => YAML.parse(fileData),
    },
];

//
// Loads a normal (non-templated) data file.
//
export async function loadDataFile(filePath: string): Promise<any> {
    let dataType = undefined;

    for (const type of dataTypes) {
        if (filePath.endsWith(type.ext)) {
            dataType = type;
            break;
        }
    }

    if (dataType === undefined) {
        throw new Error(`Unexpected data file type: ${filePath}`);
    }

    const fileData = await fsPromises.readFile(filePath, "utf-8");
    return dataType.parse(fileData);
}

//
// Loads and expands a templated data file.
//
async function loadTemplatedDataFile(filePath: string, options: IFigitOptions): Promise<any> {
    if (filePath.endsWith(".js")) {
        // Executes a JavaScript file.
        return require(filePath);
    }
    else {
        // Loads and expands a templated data file.
        let dataType = undefined;

        for (const type of dataTypes) {
            if (filePath.endsWith(type.ext)) {
                dataType = type;
                break;
            }
        }

        if (dataType === undefined) {
            throw new Error(`Unexpected input file type: ${filePath}`);
        }

        const fileData = await fsPromises.readFile(filePath, "utf-8");
        const template = handlebars.compile(fileData);

        let baseTemplateData: any = {};
        if (options.dataFilePath) {
            baseTemplateData = await loadDataFile(options.dataFilePath);           
        }

        let overrideTemplateData: any = undefined;
        if (options.stdin === "json") {
            overrideTemplateData = JSON.parse(fs.readFileSync(process.stdin.fd, { encoding: "utf-8" }));
        }
        else if (options.stdin === "yaml") {
            overrideTemplateData = YAML.parse(fs.readFileSync(process.stdin.fd, { encoding: "utf-8" }));
        }
        else if (options.stdin !== undefined) {
            throw new Error(`Invalid input format to read from standard input: ${options.stdin}`);
        }

        const templateData: any = Object.assign(baseTemplateData, process.env, overrideTemplateData);
        const expandedData = template(templateData);
        return dataType.parse(expandedData);
    }
}
