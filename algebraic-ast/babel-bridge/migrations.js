const { fromEntries } = Object;
const { QuerySet: Node, Query, toObject } = require("./object-query");

const Babel = fromEntries(require("@babel/types")
    .TYPES
    .map(type => [type, Query.object({ type })
    (({
        leadingComments,
        innerComments,
        trailingComments,
        start,
        end,
        loc
    }) => sourceData)]));

Node.SourceData
    = Query.object(loc => location)

Node.Program
    = Babel.Program({ sourceType: "module" })
    | Babel.Program({ sourceType: "script" });

Node.IdentifierName
    = Babel.Identifier;

Node.IdentifierReference
    = Babel.Identifier;

Node.RestElementBinding
    = Babel.RestElement;

Node.IdentifierBinding
    = Babel.Identifier
    | Babel.VariableDeclarator({ init: null }).id

Node.Elision
    = Query.null;

Node.ArrayAssignmentTarget
    = Babel.ArrayPattern(
        elements => restElement);

Node.RestElementAssignmentTarget
    = Babel.RestElement;

Node.ObjectAssignmentTarget = Babel.ObjectPattern (
    properties  => restProperty);

Node.RestPropertyAssignmentTarget
    = Babel.RestElement;

// Remember, on the way back it's shorthand
Node.PropertyBinding
    = Babel.ObjectProperty (
        shorthand   => prefersShorthand,
        value       => binding);

Node.PropertyAssignmentTarget
    = Babel.ObjectProperty(
        shorthand   => prefersShorthand,
        value       => target);

Node.DefaultedAssignmentTarget
    = Babel.AssignmentPattern(
        left    =>  target,
        right   =>  fallback);

Node.ArrayPatternBinding
    = Babel.ArrayPattern(
        elements => restElements);

Node.ObjectPatternBinding
    = Babel.ObjectPattern(
        properties => restProperty);

Node.RestPropertyBinding
    = Babel.RestElement;

Node.LiteralPropertyName
    = ({ value: Node.IdentifierName |
                Node.StringLiteral |
                Node.NumericLiteral });

Node.DefaultedBinding
    = Babel.VariableDeclarator(id => binding, init => fallback)
    | Babel.AssignmentPattern(left => binding, right => fallback);


Node.ArrowFunctionExpression
    = Babel.ArrowFunctionExpression(
        params => parameters,
        params => restParameter);

/*
Node.ArrowFunctionExpression
    = Babel.ArrowFunctionExpression
        [deriving] `.parameters`    [from] `.params`
        [deriving] `.restParameter` [from] `.params`
        [deriving] `.sourceData`    [from]  ({ loc, pos })`this`

        [mapping] `.params` [to] `.parameters`
        [mapping] `.params` [to] `.restParameter`;
        [mapping] `this`    [to] `.sourceData`;
*/
Node.FunctionExpression
    = Babel.FunctionExpression(
        params => parameters,
        params => restParameter);
        
Node.FunctionDeclaration
    = Babel.FunctionDeclaration(
        params => parameters,
        params => restParameter);

Node.VariableDeclaration
    = Babel.VariableDeclaration(
        { kind: "var" },
        declarations    =>  bindings );

Node.LetLexicalDeclaration
    = Babel.VariableDeclaration(
        { kind: "let" },
        declarations    =>  bindings );

Node.ConstLexicalDeclaration
    = Babel.VariableDeclaration(
        { kind: "const" },
        declarations    =>  bindings );


module.exports = { ...Node, toDefaultTranslation: type => toObject(Babel[type]) };
