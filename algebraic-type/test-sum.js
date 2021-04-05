const type = require("@algebraic/type");
const sum = require("@algebraic/type/sum");
const MaybeNumber = sum("MaybeNumber")
    .case `Just` (of => type.number)
    .case `Nothing` ();

console.log(MaybeNumber);
console.log(MaybeNumber.Just(5));
console.log(MaybeNumber.Nothing());

console.log(MaybeNumber.Just(5).match
({
    Just: value => value + 1,
    Nothing: () => MaybeNumber.Nothing()
}));

console.log(MaybeNumber.Just(5).match
({
    Just: value => value + 1,
    default: () => MaybeNumber.Nothing()
}));


console.log(MaybeNumber.Just("hi"));
