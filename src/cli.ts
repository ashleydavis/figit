import { figit } from ".";
import * as path from "path";

const args = process.argv.slice(2);
const filePath = path.join(__dirname, "..", args[0]);
console.log(figit(filePath));