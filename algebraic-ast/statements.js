const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


exports.Label = Node `Label` (
    ([ESTreeType])          =>  data.always ("Identifier"),
    name                    =>  string );

exports.BlockStatement = Node `BlockStatement` (
    body                    =>  array (Node.Statement) );

exports.BreakStatement = Node `BreakStatement` (
    label                   =>  Node.Label );

exports.ContinueStatement = Node `ContinueStatement` (
    label                   =>  Node.Label );

exports.DebuggerStatement = Node `DebuggerStatement` ();

exports.DoWhileStatement = Node `DoWhileStatement` (
    block                   =>  Node.BlockStatement,
    test                    =>  Node.Expression );

exports.EmptyStatement = Node `EmptyStatement` ( );

exports.ExpressionStatement = Node `ExpressionStatement` (
    expression              =>  Node.Expression );

exports.FunctionDeclaration = Node `FunctionDeclaration` (
    // This can be null in the `export default function() { }` case.
    id                      =>  nullable(Node.IdentifierPattern),
    params                  =>  array (Node.RootPattern),
    body                    =>  Node.BlockStatement,

    generator               =>  [boolean, false],
    async                   =>  [boolean, false] );

exports.IfStatement = Node `IfStatement` (
    test                    =>  Node.Expression,
    consequent              =>  Node.Statement,
    alternate               =>  nullable(Node.Statement) );

exports.ForOfStatement = Node `ForOfStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement );

exports.ForInStatement = Node `ForInStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement );

exports.ForStatement = Node `ForStatement` (
    init                    =>  nullable(or (Node.VariableDeclaration,
                                             Node.AssignmentExpression)),
    test                    =>  nullable(Node.Expression),
    update                  =>  nullable(Node.Expression),
    body                    =>  Node.Statement );

exports.LabeledStatement = Node `LabeledStatement` (
    label                   =>  Node.Label,
    body                    =>  Node.Statement );

exports.ReturnStatement = Node `ReturnStatement` (
    argument                =>  Node.Expression );

exports.ThrowStatement = Node `ThrowStatement` (
    argument                =>  Node.Expression );

exports.TryStatement = Node `TryStatement` (
    block                   =>  Node.BlockStatement,
    handler                 =>  [nullable(Node.CatchClause), null],
    finalizer               =>  [nullable(Node.BlockStatement), null] );

exports.CatchClause = Node `CatchClause` (
    param                   =>  Node.RootPattern,
    body                    =>  Node.BlockStatement );

exports.WhileStatement = Node `WhileStatement` (
    test                    =>  Node.Expression,
    body                    =>  Node.Statement );

exports.WithStatement = Node `WithStatement` (
    object                  =>  Node.Expression,
    body                    =>  Node.Statement );

exports.VariableDeclarator = Node `VariableDeclarator` (
    id                      =>  Node.RootPattern,
    init                    =>  [nullable(Node.Expression), null],
    definite                =>  [nullable(boolean), null] );

exports.VarVariableDeclaration = Node `VarVariableDeclaration` (
    ([ESTreeType])          =>  data.always ("VariableDeclaration"),
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    ([kind])                =>  data.always ("var") );

exports.BlockVariableDeclaration = Node `BlockVariableDeclaration` (
    ([ESTreeType])          =>  data.always ("VariableDeclaration"),
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    kind                    =>  string );

exports.VariableDeclaration = union2 `VariableDecalaration` (
    is                      => Node.VarVariableDeclaration,
    or                      => Node.BlockVariableDeclaration );






