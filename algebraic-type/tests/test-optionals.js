const [type, { data, forall }] = require("@algebraic/type");
const { caseof } = data;
const Person = data `Person`
({
    name    :of =>  type.string,
    age     :of =>  type.number
});

const Pair = data `Pair` (of => type.number, of => type.number);

console.log(Person);
console.log(Person({ name: "Francisco", age: 37 }));

console.log(Pair(10, 10));

// console.log(Person({ name: "Francisco", age: 37 }, 10));
console.log(caseof);
const OptionalPerson = data `OptionalPerson`
([
    caseof `some` (of => Person),
    caseof `none` ()
]);

const x = OptionalPerson.some(Person({ name: "Francisco", age: 37 }));

//console.log(Object.getPrototypeOf(x.constructor).constructor);
//console.log(Object.getPrototypeOf(x.values[0]).constructor);
console.log(x);


const { some } = OptionalPerson;

console.log(some(Person({ name: "Francisco", age: 37 })));


console.log(
    some(Person({ name: "Francisco", age: 37 })).caseof(
    {
        some: x => x.age + 1,
        none: () => 10
    }));

const optional = data `optional` .forall (T =>
([
    caseof `some` (of => T),
    caseof `none` ()
]));

console.log(optional.of(Person));
console.log(Person `?`);

const { some: some_ } = Person `?`;

console.log(some_(Person({ name: "Francisco", age: 37 })));



const List = data `List` .forall (T =>
([
    caseof `List` (item => T, next => List.of(T)),
    caseof `Empty` ()
]));

console.log(List.of(type.number).List(5, List.of(type.number).Empty()));

//const Pair = data `Pair` .forall (T => [of => T, of => T]);

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
