const { TotalTypes } = require("@/configs/enums.config");
const { validateTypeTransition } = require("../factory/type-transition.middleware-factory");

const convertUserToClientMiddleware = validateTypeTransition(TotalTypes.USER, TotalTypes.CLIENT);

module.exports = {
    convertUserToClientMiddleware
}