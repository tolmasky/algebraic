const [type, { data, variadic }] = require("@algebraic/type");
const Person = data `Person`
({
    name    :of =>  type.string,
    age     :of =>  type.number
});


console.log(Person);
console.log(Person({ name: "Francisco", age: 37 }));


const optional = variadic(T =>
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

// console.log(Person `?`);

