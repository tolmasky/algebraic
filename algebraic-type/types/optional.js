const { type, caseof, fallback } = require("../type");

module.exports = type `Optional` .forall (T =>
([
    caseof `Some` (of => T),
    caseof `None`,

    fallback (O => O.None)
]));
