const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");

const clientConversionRequestMiddlewares = {
    ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = {
    clientConversionRequestMiddlewares
};
