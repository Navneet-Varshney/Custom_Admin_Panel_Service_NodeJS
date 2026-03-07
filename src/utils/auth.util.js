const { isValidRegex, validateLength } = require("./validators-factory.util");
const { phoneNumberRegex } = require("../configs/regex.config");
const { phoneNumberLength } = require("../configs/fields-length.config");

const createPhoneNumber = (countryCode, number) => {
    const newNumber = "+" + countryCode + number;
    if (!validateLength(newNumber, phoneNumberLength.min, phoneNumberLength.max)) {
        return null;
    }
    if (!isValidRegex(newNumber, phoneNumberRegex)) {
        return null;
    }
    return newNumber;
};

module.exports = {
    createPhoneNumber
}