const { Predicated, number } = require("./set");
const { floor } = Math;
const { isFinite } = global;
const style = require("./style");


const isInteger =
    Number.isInteger ||
    (value =>
        // This is handled by our superset.
        // typeof value === "number" && 
        isFinite(value) &&
        floor(value) === value);

const integer = Predicated
({
    name: style("number", "ℤ"),
    subsetof: number,
    predicate: isInteger
});

exports.integer = integer;

integer.positive = Predicated
({
    name: style("number", "ℤ⁺"),
    subsetof: integer,
    predicate: value => value > 0
});

integer.nonnegative = Predicated
({
    name: style("number", "ℤ*"),
    subsetof: integer,
    predicate: value => value >= 0
});

integer.negative = Predicated
({
    name: style("number", "ℤ⁻"),
    subsetof: integer,
    predicate: value => value < 0
});

integer.nonpositive = Predicated
({
    name: style("number", "the non-positive integers"),
    subsetof: integer,
    predicate: value => value < 0
});

