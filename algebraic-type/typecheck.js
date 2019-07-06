const { fNamed, is } = require("./declaration");
const fail = require("./fail");

const value = (type, message, value) =>
    is(type, value) ?
        value :
        fail.type(message(type, value));

module.exports = value;

module.exports.value = value;

module.exports.function = (type, message, f) =>
    fNamed(f.name, (...args) =>
        value(type, message, f(...args)));
