const { data, string, nullable } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const Scope = require("./scope");
const NameSet = Set(string);

const unionBinaryScope =
    [Scope, (left, right) => Scope.concat(left.scope, right.scope)];

const NameSetMonoid =
    { concat: (lhs, rhs) => lhs.concat(rhs), identity: NameSet() };
const toMonoid = M => M === Scope ? Scope : NameSetMonoid;
const concat = (M_, key, items, M = toMonoid(M_)) =>
    items.map(item => item[key]).reduce(M.concat, M.identity);

const Node = (Node => name => (Node || (Node = require("./node")))[name])();

//const union = [["names", NameSet], ["scope", Scope]]
//    .map(([key, ])
//const adopt = [["names", NameSet], ["scope", Scope]]
//    .map(([key, type]) => [type, data.field.declaration({ name: "names", type: })

Error.stackTraceLimit = 1000;


//adopt.names.from `left`

module.exports = withBabelDefinitions(
{
    CatchClause: data `CatchClause` (
        param       => nullable(Node("IdentifierPattern")),
        ([scope])   => [Scope, param => Scope.identity /*FIXME*/] ),

    VariableDeclaration: data `VariableDeclaration` (
        ([scope]) => [Scope, declarations =>
            concat(Scope, "scope", declarations)] ),

    VariableDeclarator: data `VariableDeclarator` (
        ([scope]) => [Scope, (id, init) => concat(Scope, "scope", [id, init])]),

    ArrayPattern: data `ArrayPattern` (
        ([names]) => [NameSet, elements => concat(NameSet, "names", elements)],
        ([scope]) => [Scope, elements => concat(Scope, "scope", elements)] ),

    AssignmentPattern: data `AssignmentPattern` (
        left        => Node("RootPattern"),
        ([names])   => [NameSet, left => left.names],
        ([scope])   => [Scope, right => right.scope] ),

    ObjectPattern: data `ObjectPattern` (
        ([names]) => [NameSet, properties =>
            concat(NameSet, "names", properties)],
        ([scope]) => [Scope, properties =>
            concat(Scope, "scope", properties)] ),
    
    // ObjectProperty's value is Expression | PatternLike to allow it to do
    // double-duty as a member of an ObjectExpression and ObjectPattern.
    // However, since we have a separate ObjectPatternProperty, we don't need
    // PatternLike anymore.
    ObjectProperty: data `ObjectProperty` (
        value       => Node("Expression"),
        ([scope])   => [Scope, (computed, key, value) => Scope.identity /*FIXME*/ ]),

    RestElement: data `RestElement` (
        ([names]) => [NameSet, argument => argument.names],
        ([scope]) => [Scope, argument => argument.scope] ),

    BigIntLiteral: data `BigIntLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    BooleanLiteral: data `BooleanLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    NumericLiteral: data `NumericLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    NullLiteral: data `NullLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    RegExpLiteral: data `RegExpLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    StringLiteral: data `StringLiteral` (
        ([scope]) => [Scope, () => Scope.identity] ),

    IdentifierExpression: data `IdentifierExpression` (
        ([scope]) => [Scope, name => Scope.fromFree(name)] ),

    // Introduces all the left patterns to free scope?
    AssignmentExpression: data `AssignmentExpression` (
        left        => Node("RootPattern"),
        ([names])   => [NameSet, left => left.names],
        ([scope])   => [Scope, (left, right) => Scope.identity /*FIXME*/ ] ),

    BinaryExpression: data `BinaryExpression` (
        ([scope]) => unionBinaryScope ),
    
    LogicalExpression: data `LogicalExpression` (
        ([scope]) => unionBinaryScope ),

    UnaryExpression: data `UnaryExpression` (
        ([scope]) => unionBinaryScope ),

    FunctionDeclaration: data `FunctionDeclaration` (
        // id needs to be nullable because it can be null in the following case:
        // `export default function () { }`
        id          => nullable(Node("IdentifierPattern")),
        ([scope])   => [Scope, (id, params, body) => Scope.identity /*FIXME*/ ] ),

    FunctionExpression: data `FunctionExpression` (
        id          => nullable(Node("IdentifierPattern")),
        ([scope])   => [Scope, (id, params, body) => Scope.identity /*FIXME*/ ] ),

    ArrowFunctionExpression: data `ArrowFunctionExpression` (
        ([scope])   => [Scope, (params, body) => Scope.identity /*FIXME*/ ] ),

    ClassDeclaration: data `ClassDeclaration` (
        id          => Node("IdentifierPattern"),
        ([scope])   => [Scope, id => Scope.identity /*FIXME*/ ] ),

    ClassDeclaration: data `ClassExpression` (
        id          => nullable(Node("IdentifierPattern")),
        ([scope])   => [Scope, id => Scope.identity /*FIXME*/ ] ),
    
    // ClassImplements?

    ExportSpecifier: data `ExportSpecifier` (
        local       => Node("IdentifierExpression"),
        ([scope])   => [Scope, id => Scope.identitiy /*FIXME*/ ] ),

    ExportDefaultSpecifier: data `ExportDefaultSpecifier` (
        exported    => Node("IdentifierExpression"),
        ([scope])   => [Scope, id => Scope.identitiy /*FIXME*/ ] ),

    ImportDefaultSpecifier: data `ImportDefaultSpecifier` (
        local       => Node("IdentifierPattern"),
        ([scope])   => [Scope, id => Scope.identitiy /*FIXME*/ ] ),

    PrivateName: data `PrivateName` (
        id          => Node("IdentifierPattern"),
        ([scope])   => [Scope, id => Scope.identitiy /*FIXME*/ ] ),
});

function withBabelDefinitions(overrides)
{
    const { fromJS } = require("@algebraic/collections/node_modules/immutable");
    const babelDefinitions = fromJS(require("@babel/types").NODE_FIELDS);

    return Object
        .entries(overrides)
        .reduce((declarations, [typename, type]) =>
            data.fieldDeclarations(type).reduce((declarations, declaration) =>
                declarations.setIn([typename, declaration.name], declaration),
                declarations),
            babelDefinitions).toJS();
}

/*
const extension = data `extension` (
    name => string,
    declarations => Array );

const extend = ([name]) =>
    (...declarations) => extension({ name, declarations });

*/
