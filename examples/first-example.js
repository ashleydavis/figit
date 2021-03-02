//
// Run this example:
//
//    set APP_NAME=web-server
//    set APP_LABEL=web-server
//    set CONTAINER_NAME=nginx
//    set IMAGE_NAME=nginx:latest
//    npx ts-node src\cli.ts examples\first-example.js
//

module.exports = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: process.env.APP_NAME,
        labels: {
            app: process.env.APP_LABEL,
        },
    },
    spec: {
        replicas: 3,
        selector: {
            matchLabels: {
                app: process.env.APP_LABEL,
            },
        },
        template: {
            metadata: {
                labels: {
                    app: process.env.APP_LABEL,
                },
            },
            spec: {
                containers: [
                    {
                        name: process.env.CONTAINER_NAME,
                        image: process.env.IMAGE_NAME,
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
