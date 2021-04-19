const { type, caseof, fallback } = require("../type");

module.exports = type `List` .forall (T =>
([
    caseof `List` (of => T, of => List.of(T)),
    caseof `Empty`,

    fallback (L => L.Empty)
]));
