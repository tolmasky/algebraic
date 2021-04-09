const [type, { data, forall }] = require("@algebraic/type");
const Person = data `Person`
({
    name    :of =>  type.string,
    age     :of =>  type.number
});

const Pair = data `Pair` (of => type.number, of => type.number);

console.log(Person);
console.log(Person({ name: "Francisco", age: 37 }));

console.log(Pair(10, 10));

console.log(Person({ name: "Francisco", age: 37 }, 10));


/*
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


forall(T =>
    data `optional` .of (T)
        .case `some` (of => T)
        .case `none` ());

forall(T =>
    data `optional` .forall (T =>
        .case `some` (of => T)
        .case `none` ());


const extra = data `extra` .forall (T =>
({
    data        :of => T,
    something   :of => T
});


const extra = forall (T =>
    data `optional`
        .case `some` (of => T)
        .case `none` ());

forall (data `optional`)

const optional = forall (T =>
    data `optional` .of (T)
        .case `some` (of => T)
        .case `none` ())


const optiona = forall (T =>
    data `optional` .of (T)
        .case `some` (of => T)
        .case `none` ())

const optional = data `optional` .forall (T =>
[
    caseof `some` (of => T),
    caseof `none`
])

const state = data `state`
([
    caseof .started,
    caseof .stopped
]);


const optional = data `optional`
    .forall (T =>
    [
        caseof `some` (of => T),
        caseof `none`
    ]);


const optional =
    data `optional` .forall (T =>
    [
        caseof `some` (of => T),
        caseof `none`
    ]);

const Expression = data `Expression`
([
    caseof `AssignmenExpression` (),
    caseof `UnaryExpression` (),
    caseof `EmptyExpression` (),
]);


caseof.x = something
caseof.y =

// can't know if its variadic or not ahead of time due to deferred t.

data `optional`
    .forall(T => );
*/
