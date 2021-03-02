# figit

JavaScript data templates! 

Write code to produce data and output it as JSON or YAML.

I use this to produce Kubernetes configurations from templates.

[Follow the developer on Twitter](https://twitter.com/ashleydavis75) for updates!

## Features

- Produce data from JavaScript code.
- Use variables, environment variables and whatever data sources you like.
- Use whatever npm packages you like.

## Trivial example

Install it:

```bash
npm install -g figit
```

Create a template:

```javascript
// myfile.js
module.exports = {
    /* Whatever code you want here to produce data. */
    data: {
        hello: "world",
    },
};
```

Instantiate data from the template:

```bash
figit myfile.js
```

JSON output:

```bash
{
  "data": {
    "hello": "world"
  }
}
```

Or output YAML:

```bash
figit myfile.js --output yaml
``` 

YAML output:

```bash
data:
  hello: "world"
```

## More complicated example

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
figit mydeploymnent.js | kubectl create -f -
```


