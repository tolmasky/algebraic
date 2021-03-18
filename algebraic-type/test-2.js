const type = require("./type");
const Person = type `Person` ({ name: of => type.string });
console.log(Person);
console.log(Person({ name: "Francisco" }));
console.log(Person);
// console.log(Person({ name: 5 }));

const Node = type `Node` (fields => type(fields));
const ObjectProperty = Node `ObjectProperty`
({
    computed            : of => type.boolean,
    canBeShorthand      : of => type.boolean,

    shorthand           : of => type.boolean,

    prefersShorthand    : of => type.boolean,

    key                 : of => type.string,
    value               : of => type.string
});

/*
console.log(Node instanceof Function);
console.log(Node instanceof type);
console.log(Person instanceof type);
console.log(Node({ name: "string" }) instanceof type);
console.log(ObjectProperty);

process.exit(1);
*/
const X = type({name: of => string })

console.log(X);
console.log(Node);
console.log(ObjectProperty);
console.log(ObjectProperty({ computed: true, canBeShorthand: true, shorthand: true, prefersShorthand: true, key: "hi", value: "bye" }));

/*const VIP = type (function VIP(stuff){ return Person(stuff) });

console.log(VIP({name:"Francisco"}));

console.log(getTypeChain(VIP({name:"Francisco"})));

console.log("----");

const id = type (function id(T) { return T });
const idVIP = id(VIP);


console.log(idVIP);
console.log(idVIP({name:"Francisco"}));
console.log(getTypeChain(idVIP({name:"Francisco"})));
*/
