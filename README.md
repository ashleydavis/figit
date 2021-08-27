# figit

JavaScript and Handlebars data templates! 

Write code to produce data and output it as JSON or YAML.

Or expand JSON and YAML templates using [Handlebars](https://handlebarsjs.com/) template syntax.

I use this to produce Kubernetes configurations from templates.

[Follow the developer on Twitter](https://twitter.com/ashleydavis75) for updates!

## Features

- Produce data from JavaScript code.
- Produce data from templated YAML and JSON files.
- Use variables, environment variables and whatever data sources you like.
- Use whatever npm packages you like.
- Use YAML and JSON data files and standard input for Handlebars template data.

## Install it

```bash
npm install -g figit
```

## Command line reference

Evaluate `file.js` and output JSON:

```
figit file.js
```

Evaluate multiple files and output YAML:

```
figit file1 file2 fileN --output yaml
```

General use:

```
figit [file+] --output json | yaml [--stdin json | yaml] [--data <json-or-yaml-data-file>]
```

## A simple JavaScript template

Create a template:

```javascript
// myfile.js
module.exports = {
    /* Whatever code you want here to produce data. */
    data: {
        msg: "Hello world!",
    },
};
```

Instantiate data from the template:

```bash
figit myfile.js
```

JSON output:

```json
{
    "data": {
        "msg": "Hello world!"
    }
}
```

Or output YAML:

```bash
figit myfile.js --output yaml
``` 

YAML output:

```yaml
data:
    msg: "Hello world!"
```

## A simple data template

Create a JSON template:

```json
// myfile.json
{
    "data": {
        "msg": "{{MESSAGE}}",
    },
};
```

Or create a YAML template instead:

```yaml
# myfile.yaml
data:
    msg: "{{MESSAGE}}"
```

Create a file to contain the Handlebars template data (this can be JSON or YAML as well):

```json
// mydata.json
{
    "MESSAGE": "Hello world!"
}
```

Note: Template variables are also populated from environment variables, so you don't necessarily need to create a template data, you could instead set a `MESSAGE` environment variable like this:

```bash
export MESSAGE="Hello world"
```

Instantiate data from the template and output as JSON:

```bash
figit myfile.json --data mydata.json --output json
```

JSON output:

```json
{
    "data": {
        "msg": "Hello world!"
    }
}
```

Or output YAML:

```bash
figit myfile.json --data mydata.json --output yaml
```

YAML output:

```yaml
data:
    msg: "Hello world!"
```

You can also combine template data from a data file, environment variables and standard input.

Load template data from a file like this:

```bash
figit myfile.json --data mydata.json
```

Template data is overwritten by environment variables, so in this case a `MESSAGE` environment variable would override the `MESSAGE` field from the data file.

You can read template from standard input in JSON or YAML format like this:

```bash
figit myfile.json --stdin json < mydata.json
```

You can use this to pipe sensitive variables from one process to another without having to save them to disk.

You can combine the methods of loading template data:

```bash
figit myfile.json --data base-data.json --stdin json < override-data.json
```

This allows you to have multiple levels of data. Base template data is read from the file specified by `--data`. Environment variables can then override the base data. Finally data read from standard input provides the final values for template data.

## A complex JavaScript template

Here's my usecase for Figit, templating Kubernetes configurations.

```javascript
// mydeployment.js
const APP_NAME = process.env.APP_NAME;
if (!APP_NAME) {
    throw new Error(`Expected environment variable ${APP_NAME}`);
}

module.exports = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: ,
        labels: {
            app: APP_NAME,
        },
    },
    spec: {
        replicas: 3,
        selector: {
            matchLabels: {
                app: APP_NAME,
            },
        },
        template: {
            metadata: {
                labels: {
                    app: APP_NAME,
                },
            },
            spec: {
                containers: [
                    {
                        name: APP_NAME,
                        image: IMAGE_NAME,
                        ports: [
                            {
                                containerPort: 80,
                            },
                        ],
                    },
                ],
            },
        },
    },
};
```

Then in my deployment pipeline:

```bash
export APP_NAME=myapp
export IMAGE_NAME=myimage:latest
figit mydeployment.js | kubectl apply -f -
```


