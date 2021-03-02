import * as YAML from 'yaml'

export function figit(filePath: string): string {
    const data = require(filePath);
    return YAML.stringify(data);

}