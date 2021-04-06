const type = require("@algebraic/type");

const List = type `List`
    .case `List` ({ item: of => type.number, next: of => List })
    .case `Empty` ();

// console.log(List.has(List.Empty()));
// console.log(Object.getPrototypeOf(List.Empty()).constructor);
console.log(List({ item: 5, next: List.Empty() }));

const MaybeNumber = type `MaybeNumber`
    .case `Just` (of => type.number)
    .case `Nothing` ();

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
