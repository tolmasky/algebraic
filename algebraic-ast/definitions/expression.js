const { of, data, nullable, union, array, parameterized } = require("@algebraic/type");
const { boolean, string, tundefined } = require("@algebraic/type/primitive");
const { IsSymbol } = require("@algebraic/type/declaration");
const Node = require("./node");
const IsExpression = Symbol("IsExpression");
const References = require("./references");
Error.stackTraceLimit = 1000;

Expression `ArrayExpression` (
    elements        =>  array(Expression) );

Expression `CallExpression` (
    callee          =>  Expression,
    arguments       =>  array(Expression) );

Expression `ConditionalExpression` (
    test            =>  Expression,
    consequent      =>  Expression,
    alternate       =>  Expression );

Expression `IdentifierExpression` (
    ({ESTree})      =>  "Identifier",
    name            =>  string,
    ([references])  =>  [References, name => References([name])] );

Expression `BinaryExpression` (
    left            =>  Expression,
    right           =>  Expression,
    operator        =>  string );

Expression `LogicalExpression` (
    left            =>  Expression,
    right           =>  Expression,
    operator        =>  string );

Expression `StaticMemberExpression` (
    ({ESTree})      =>  "MemberExpression",
    object          =>  Expression,
    property        =>  string );

Expression `ComputedMemberExpression` (
    ({ESTree})      =>  "MemberExpression",
    object          =>  Expression,
    property        =>  Expression );

Expression `NewExpression` (
    callee          =>  Expression,
    arguments       =>  array(Expression) );

Expression `ThisExpression` ( );

Expression `SequenceExpression` (
    expressions     =>  array(Expression) );

Expression `TaggedTemplateExpression` (
    tag             =>  Expression,
    quasi           =>  TemplateLiteral );

const TemplateElement = Expression `TemplateElement` (
    value           =>  TemplateElement.Value,
    tail            =>  [boolean, false] );

TemplateElement.Value = data `TemplateElement.Value` (
    raw             =>  string,
    cooked          =>  string );

const TemplateLiteral = Expression `TemplateLiteral` (
    expressions     =>  array(Expression),
    quasis          =>  array(TemplateElement) );

const UnaryExpression = Node `UnaryExpression` (
    argument        =>  Expression,
    operator        =>  string,
    prefix          =>  [boolean, true] );

const YieldExpression = Node `YieldExpression` (
    argument        =>  Expression );

const AwaitExpression = Node `AwaitExpression` (
    argument        =>  Expression,
    delegate        =>  [boolean, false] );

/*
const AssignmentExpression = Node `AssignmentExpression` (
    left            => Node.RootPattern,
    right           => Expression,
    ([references])  => [References, (left, right) => left.union(right)] ),

const BooleanLiteral = Node `BooleanLiteral` (
    value   => boolean );

const NumericLiteral = Node `NumericLiteral` (
    value   => number,
    extra   => [nullable(Extra(number)), null] );

const NullLiteral = Node `NullLiteral` ( );

const RegExpLiteral = Node `RegExpLiteral` (
    flags   => string,
    pattern => string,
    extra   => [nullable(Extra(tundefined)), null] );

const StringLiteral = Node `StringLiteral` (
    value   => string,
    extra   => [nullable(Extra(string)), null] );

module.exports = union `SelfContained` (
    BigIntLiteral,
    BooleanLiteral,
    NumericLiteral,
    NullLiteral,
    RegExpLiteral,
    StringLiteral );*/

function Expression ([name])
{
    const fieldsof = type => data
        .fields(type)
        .filter(field =>
            parameterized.parameters(field)[0] === Expression ||
            parameterized.parameters(field)[0][IsExpression] ||
            parameterized.parameters(field)[0] === array(Expression));

    return function (...fields)
    {
        const names = fields
            .map(data.field.toFieldDeclaration)
            .map(declaration => declaration.name);
        const hasCustomReferencesDefinition =
            names.indexOf("references") >= 0;

        const dummy = data `dummy-${name}` (...fields);
        const withReferencesField =
            hasCustomReferencesDefinition ?
                fields :
                [...fields, ([references]) =>
                    (dependencies => dependencies.length === 0 ?
                        References.Never :
                        References.from(...dependencies))
                    (fieldsof(dummy).map(field => field.name))];

        const type = Node ([name]) (
            ...withReferencesField );

        type[IsExpression] = true;
        Expression[name] = type;

        return type;
    }
}

Expression[IsSymbol] = value => !!value && !!of(value)[IsExpression];

module.exports = Expression;


require("./self-contained");
/*
const Expression = union `Expression` (
    ...union.components(SelfContained),
    ArrayExpression,
    CallExpression,
    ConditionalExpression,
    IdentifierExpression,
    BinaryExpression,
    LogicalExpression,
    ComputedMemberExpression,
    StaticMemberExpression,
    NewExpression,
    ThisExpression,
    SequenceExpression,
    TemplateElement,
    TemplateLiteral,
    TaggedTemplateExpression,
    TemplateLiteral,
    UnaryExpression );

module.exports = Expression;*/
