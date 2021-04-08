const [type, { data, forall }] = require("@algebraic/type");
const Person = data `Person`
({
    name    :of =>  type.string,
    age     :of =>  type.number
});


console.log(Person);
console.log(Person({ name: "Francisco", age: 37 }));


const optional = forall (T =>
    data `optional`
        .case `some` (of => T)
        .case `none` ());
        
console.log(optional.of(type.number));
console.log(optional.of(type.number).some);
console.log(optional.of(type.number).some(5));

console.log(optional.of(type.number).some(5).caseof
({
    some: x => x + 1,
    none: () => 0
}));
console.log(optional.some);
const { some, none } = optional;

console.log(some.of(type.number)(5));
console.log(none.of(type.number));

const Pizza = data `Pizza`
({
    toppings    :of => optional.of(type.number)
});

console.log(Pizza({ toppings: none.of(type.number)() }));

// console.log(Person `?`);

