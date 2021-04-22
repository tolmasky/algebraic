const { type, caseof, fallback } = require("../type");

const List = type `List` .forall (T =>
([
    caseof `List` (of => T, of => List.of(T)),
    caseof `Empty`,

    fallback (L => L.Empty)
]));

module.exports = List;
