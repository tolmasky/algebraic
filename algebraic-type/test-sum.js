const type = require("@algebraic/type");

const List = type(T => type `List`
    .case `List` ({ item: of => T, next: of => List.of(T) })
    .case `Empty` ());

console.log(List.of(type.number).Empty());

// console.log(List.has(List.Empty()));
// console.log(Object.getPrototypeOf(List.Empty()).constructor);
console.log(List.of(type.number)({ item: 5, next: List.of(type.number).Empty() }));

const Maybe = type(T => type `Maybe`
    .case `Just` (of => T)
    .case `Nothing` () );

const MaybeNumber = Maybe.of(type.number);

console.log(MaybeNumber);
console.log(MaybeNumber.Just(5));
console.log("---");
console.log(MaybeNumber.Nothing());
console.log("---");
const x = MaybeNumber.Just(5);
console.log("+++");
console.log(x.match
({
    Just: value => value + 1,
    Nothing: () => MaybeNumber.Nothing()
}));
console.log("+++");
console.log(MaybeNumber.Just(5).match
({
    Just: value => value + 1,
    default: () => MaybeNumber.Nothing()
}));

console.log(MaybeNumber.Nothing());


const AssignmentExpression = type `AssignmentExpression` ({ name: of => type.string });
const UnaryExpression = type `UnaryExpression` ({ name: of => type.string });
const Expression = type `Expression`
    .case (AssignmentExpression)
    .case (UnaryExpression);

const AE = Expression.AssignmentExpression(AssignmentExpression({ name: "hi" }));

console.log(AE);
console.log(AE.match(
{
    AssignmentExpression: ({ name }) => "AssignmentExpression " + name + "!",
    UnaryExpression: ({ name }) => "UnaryExpression " + name + "!"
}));

console.log(MaybeNumber.Just("hi"));
