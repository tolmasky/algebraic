const type = require("@algebraic/type");
const SourceLocation = require("./source-location");

const Node = type `Node` (fields => type
({
    location    :of =>  SourceLocation `?`,
    comments    :of =>  Comments,
    ...fields
}));


Node.Node = Node;

module.exports = Node;
/*
const NodeUnion = ([name]) =>
    (filter, exports) =>
        union `${name}` (...Object
            .values(exports)
            .filter(T => filter.test(type.name(T)))
            .map(T => is => T));

Object.assign(module.exports,
{
    Expression: NodeUnion `Expression` (
        /(Reference|Expression|Literal)$/,
        require("./expressions")),
    Statement: NodeUnion `Statement` (
        /(Statement|Declaration)$/,
        require("./statements")),

    ...require("./property-names"),
    ...require("./expressions"),

    ...require("./bindings"),
    ...require("./assignment-targets"),

    ...require("./statements"),
    ...require("./program"),
    
    ...require("./comment")
});

// Deal with union2.
// Deal with array<X>.
const isNodeOrComposite = T =>
    T === Array ||
    parameterized.is(Node, T) ||
    type.kind(T) === union &&
        union.components(T).some(isNodeOrComposite);

// Node.isNodeOrCompose = isNodeOrComposite;

Object
    .values(Node)
    .filter(type => parameterized.is(Node, type))
    .map(type => [type, data.fields(type)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]])
        .filter(([name, T]) => isNodeOrComposite(T))
        .map(([name]) => name)])
    .map(([type, keys]) => type.traversable = keys);

*/