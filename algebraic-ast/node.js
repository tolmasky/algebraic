const { is, of, data, nullable, array, number, or, type } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const { parameterized } = require("@algebraic/type");
const { parameters } = parameterized;
const SourceLocation = require("./source-location");
const Comment = require("./comment");
const ESTreeBridge = require("./estree-bridge");


/*
const Comments = data `Comments` (
    inner       => [nullable(array(Comment)), null],
    leading     => [nullable(array(Comment)), null],
    trailing    => [nullable(array(Comment)), null] );


comments    => [nullable(Comments), null];
location    => [nullable(SourceLocation), null];
*/

const SourceData = data `SourceData` (
    leadingComments     => [nullable(array(Comment)), null],
    innerComments       => [nullable(array(Comment)), null],
    trailingComments    => [nullable(array(Comment)), null],
    start               => [nullable(number), null],
    end                 => [nullable(number), null],
    loc                 => [nullable(SourceLocation), null] );

const Node = parameterized(function (name, ...fields)
{
    return ESTreeBridge ([name]) (
        sourceData  => [nullable(SourceData), null],
        ...fields );
});

Node.SourceData = SourceData;

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
    ...require("./program")
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
        .filter(([name, type]) =>
            !name.endsWith("Comments") && isNodeOrComposite(type))
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

