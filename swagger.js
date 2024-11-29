const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "Tasks API",
        description: "Tasks API for CSE341 BYU class"
    },
    host: "localhost:2600",
    schemes: ['https', 'http']
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc)