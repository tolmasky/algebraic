const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.Label = data `Label` (
    ([type])            =>  data.always ("Identifier"),
    name                =>  string,
    ([freeVariables])   =>  FreeVariables.Never );

exports.BlockStatement = data `BlockStatement` (
    ([type])            =>  data.always ("BlockStatement"),
    body                =>  array (Node.Statement),
    ([freeVariables])   =>  FreeVariables.from("body") );

exports.BreakStatement = data `BreakStatement` (
    ([type])            =>  data.always ("BreakStatement"),
    label               =>  Node.Label,
    ([freeVariables])   =>  FreeVariables.Never );

exports.ContinueStatement = data `ContinueStatement` (
    ([type])            =>  data.always ("ContinueStatement"),
    label               =>  Node.Label,
    ([freeVariables])   =>  FreeVariables.Never );

exports.DebuggerStatement = data `DebuggerStatement` (
    ([type])            =>  data.always ("DebuggerStatement"),
    ([freeVariables])   =>  FreeVariables.Never );

exports.DoWhileStatement = data `DoWhileStatement` (
    ([type])            =>  data.always ("DoWhileStatement"),
    block               =>  Node.BlockStatement,
    test                =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("block", "test") );

exports.EmptyStatement = data `EmptyStatement` (
    ([type])            =>  data.always ("EmptyStatement"),
    ([freeVariables])   =>  FreeVariables.Never );

exports.ExpressionStatement = data `ExpressionStatement` (
    ([type])            =>  data.always ("ExpressionStatement"),
    expression          =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("expression") );

exports.IfStatement = data `IfStatement` (
    ([type])            =>  data.always ("IfStatement"),
    test                =>  Node.Expression,
    consequent          =>  Node.Statement,
    alternate           =>  nullable(Node.Statement),
    ([freeVariables])   =>  FreeVariables.from
                                ("test", "consequent", "alternate") );

exports.ForOfStatement = data `ForOfStatement` (
    ([type])            =>  data.always ("ForOfStatement"),
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForInStatement = data `ForInStatement` (
    ([type])            =>  data.always ("ForInStatement"),
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForStatement = data `ForStatement` (
    ([type])            =>  data.always ("ForStatement"),
    init                =>  nullable(or (Node.VariableDeclaration,
                                         Node.AssignmentExpression)),
    test                =>  nullable(Node.Expression),
    update              =>  nullable(Node.Expression),
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from
                                ("init", "test", "update", "body") );

exports.LabeledStatement = data `LabeledStatement` (
    ([type])            =>  data.always ("LabeledStatement"),
    label               =>  Node.Label,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("body") );

exports.ReturnStatement = data `ReturnStatement` (
    ([type])            =>  data.always ("ReturnStatement"),
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.ThrowStatement = data `ThrowStatement` (
    ([type])            =>  data.always ("ThrowStatement"),
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.WhileStatement = data `WhileStatement` (
    ([type])            =>  data.always ("WhileStatement"),
    test                =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("test", "body") );

exports.WithStatement = data `WithStatement` (
    ([type])            =>  data.always ("WithStatement"),
    object              =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("object", "body") );


