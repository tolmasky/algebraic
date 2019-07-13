const { IsSymbol } = require("@algebraic/type/declaration");
const { of, data, nullable, array, number, getTypename, or } = require("@algebraic/type");
const tagged = require("@algebraic/type/tagged");
const SourceLocation = require("./source-location");
const Comment = require("./comment");
const ESTreeBridge = require("./estree-bridge");
const NodeSymbol = Symbol("Node");


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
