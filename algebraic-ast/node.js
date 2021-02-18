const { is, of, data, nullable, array, number, or, type } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const { parameterized } = require("@algebraic/type");
const { parameters } = parameterized;
const SourceLocation = require("./source-location");
const DeferredComments = () => require("./comment").Comments;

const Node = parameterized((name, ...fields) =>
    data ([name])
    (...[
        name.endsWith("Comment") ?
            false :
            comments    =>  [DeferredComments(), DeferredComments()()],
        location        =>  [nullable(SourceLocation), null],
        ...fields
    ].filter(field => !!field)));


Node.Node = Node;

module.exports = Node;

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

    ...require("./patterns"),
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

Node.isNodeOrCompose = isNodeOrComposite;

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

/*
function placeholders(type)
{
    const name = "placeholders";
    const computed = true;
    const λdefinition = function ()
    {
        const dependencies = type.traversableKeys;
        const compute = children => dependencies
            .map(key => children[key].placeholders);

        field.definition.computed(Map(Node.PlaceholderExpression, boolean))
            ({ dependencies: traversableKeys, compute: children =>  })
    }

    return data.field.deferred({ name, computed, λdefinition });
}

for (const type of Object.values(Node))
    if (getKind(type) === data)
        console.log(getTypename(type));*/

