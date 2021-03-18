const { fNamed, is } = require("./declaration");
const result = require("./result");

const error = parameterized((E, R) =>
    data `typecheck.error <${E, R}>` (
        value => R ) );

const value = (type, message, value) =>
    is(type, value) ?
        result.success(value) :
        result.failure()
        fail.type(message(type, value));

module.exports = value;

module.exports.value = value;

module.exports.function = (type, message, f) =>
    fNamed(f.name, (...args) =>
        value(type, message, f(...args)));
