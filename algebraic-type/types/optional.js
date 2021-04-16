const { type, caseof } = require("../type");

module.exports = type `Optional` .forall (T =>
([
    caseof `Some` (of => T),
    caseof `None`
]));
