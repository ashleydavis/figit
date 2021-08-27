//
// Run this example:
//
//    set APP_NAME=web-server
//    set IMAGE_NAME=nginx:latest
//    npx ts-node src\cli.ts examples\example.js --output yaml
//

const APP_NAME = process.env.APP_NAME;
if (!APP_NAME) {
    throw new Error(`Expected environment variable APP_NAME.`);
}

const IMAGE_NAME = process.env.IMAGE_NAME;
if (!IMAGE_NAME) {
    throw new Error(`Expected environment variable IMAGE_NAME.`);
}

module.exports = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: APP_NAME,
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
