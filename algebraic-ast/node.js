Error.stackTraceLimit = 100000;

const { IsSymbol } = require("@algebraic/type/declaration");
const { isArray } = Array;
const { is, of, data, union, nullable, array, number, getTypename, or, getKind, parameterized } = require("@algebraic/type");
const union2 = require("@algebraic/type/union-new");
const { parameters } = require("@algebraic/type").parameterized;
const { Map, List } = require("@algebraic/collections");
const tagged = require("@algebraic/type/tagged");
const SourceLocation = require("./source-location");
const Comment = require("./comment");
const ESTreeBridge = require("./estree-bridge");
const NodeSymbol = Symbol("Node");


const Metadata = data `Metadata` (
    leadingComments     =>  [nullable(array(Comment)), null],
    innerComments       =>  [nullable(array(Comment)), null],
    trailingComments    =>  [nullable(array(Comment)), null],
    start               =>  [nullable(number), null],
    end                 =>  [nullable(number), null],
    loc                 =>  [nullable(SourceLocation), null] );

const Node = parameterized(function (name, ...fields)
{
    return Object.assign(data `${name}` (
        ...fields,
        metadata            =>  [nullable(Metadata), null] ));
});

Node.Metadata = Metadata;

module.exports = Node;

/*
const Node = tagged((name, ...fields) =>
    Object.assign(ESTreeBridge ([name]) (
        ...fields,
        leadingComments     => [nullable(array(Comment)), null],
        innerComments       => [nullable(array(Comment)), null],
        trailingComments    => [nullable(array(Comment)), null],
        start               => [nullable(number), null],
        end                 => [nullable(number), null],
        loc                 => [nullable(SourceLocation), null] ),
        { [NodeSymbol]: true }) );

Node.Node = Node;
Node[IsSymbol] = value => !!value && !!of(value) && of(value)[NodeSymbol];
*/
module.exports = Node;

const expressions = Object
    .values(require("./expressions"))
    .filter(statement =>
        getTypename(statement).endsWith("Expression") ||
        getTypename(statement).endsWith("Literal"));
const statements = Object
    .values(require("./statements"))
    .filter(statement =>
        getTypename(statement).endsWith("Statement") ||
        getTypename(statement).endsWith("Declaration") );

Object.assign(module.exports,
{
    Expression: or(...expressions),
    Statement: or(...statements),
    ...require("./property-names"),
    ...require("./expressions"),
    ...require("./patterns"),
    ...require("./statements"),
    ...require("./program")
});

/*
// Deal with union2.
// Deal with array<X>.
const isNodeOrComposite = type =>
    type === Array ||
    type[NodeSymbol] ||
    getKind(type) === union2 &&
        union2.components(type).some(isNodeOrComposite) ||
    getKind(type) === union &&
        union.components(type).some(isNodeOrComposite);

Object
    .values(Node)
    .filter(type => type[NodeSymbol])
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

