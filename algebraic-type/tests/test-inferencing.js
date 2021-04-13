const [type, { data, forall }] = require("@algebraic/type");
const { caseof } = data;

//const ostring = type.optional(type.string);
const { some, none } = type.optional;

console.log(some(10));


const test = data `test` .forall ((T, U) =>
([
    caseof `whatever` (of => T, of => U)
]));

console.log(test.whatever(10, 10));

console.log(test.whatever(10, "10"));

// array(10,12,13) should work (generates array(number) [10, 12, 13])
