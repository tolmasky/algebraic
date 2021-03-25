const { Predicated, number } = require("./set");
const { floor } = Math;
const { isFinite } = global;

const isInteger =
    Number.isInteger ||
    (value =>
        // This is handled by our superset.
        // typeof value === "number" && 
        isFinite(value) &&
        floor(value) === value);

const integer = Predicated
({
    name: "ℤ",
    subsetof: number,
    predicate: isInteger
});

exports.integer = integer;

integer.positive = Predicated
({
    name: "ℤ⁺",
    subsetof: integer,
    predicate: value => value > 0
});

integer.nonnegative = Predicated
({
    name: "ℤ*",
    subsetof: integer,
    predicate: value => value >= 0
});

integer.negative = Predicated
({
    name: "ℤ⁻",
    subsetof: integer,
    predicate: value => value < 0
});

integer.nonpositive = Predicated
({
    name: "non-positive integer",
    subsetof: integer,
    predicate: value => value < 0
});

