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
    


    const dataType = dataTypes.find(type => type.ext === "." + (options.output || "json"));
    if (dataType === undefined) {
        throw Error(`Invalid output format ${options.output}, expected "json" or "yaml".`);
    }

    let numOutputs = 0;

    for (const filePath of options.filePaths) {
        const data = await loadTemplatedDataFile(filePath, options);
        for (const entry of data) {

            if (options.output === "yaml" && numOutputs > 0) {
                // Separator for YAML documents.
                yield "---";
            }

            yield dataType.stringify(entry);

            numOutputs += 1;
        }
    }
}

//
// Supported methods of parsing data.
//
const dataTypes = [
    {
        ext: ".json",
        parseSingle: (fileData: string) => JSON.parse(fileData),
        parseMulti: (fileData: string) => [JSON.parse(fileData)],
        stringify: (entry: any) => JSON.stringify(entry, null, 4),
    },
    {
        ext: ".yaml",
        parseSingle: (fileData: string) => YAML.parse(fileData),
        parseMulti: (fileData: string) => YAML.parseAllDocuments(fileData),
        stringify: (entry: any) => YAML.stringify(entry),
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
    return dataType.parseSingle(fileData);
}

//
// Loads and expands a templated data file.
//
async function loadTemplatedDataFile(filePath: string, options: IFigitOptions): Promise<any[]> {
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
        const template = handlebars.compile(fileData, { noEscape: true });

        let baseTemplateData: any = {};
        if (options.dataFilePath) {
            baseTemplateData = await loadDataFile(options.dataFilePath);           
        }

        let overrideTemplateData: any = undefined;
        if (options.stdin === "json") {
            overrideTemplateData = JSON.parse(fs.readFileSync(0, { encoding: "utf-8" }));
        }
        else if (options.stdin === "yaml") {
            overrideTemplateData = YAML.parse(fs.readFileSync(0, { encoding: "utf-8" }));
        }
        else if (options.stdin !== undefined) {
            throw new Error(`Invalid input format to read from standard input: ${options.stdin}`);
        }

        const templateData: any = Object.assign(baseTemplateData, process.env, overrideTemplateData);
        const expandedData = template(templateData);
        return dataType.parseMulti(expandedData);
    }
}
