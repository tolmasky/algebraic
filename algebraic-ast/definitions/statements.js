const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { StringSet } = require("./string-set");
const compute = require("./compute");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.Label = Node `Label` (
    ({override:type})       =>  "Identifier",
    name                    =>  string,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.BlockStatement = Node `BlockStatement` (
    body                    =>  array (Node.Statement),

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([blockBindings])       =>  compute (StringSet,
                                    take => `body.blockBindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.BreakStatement = Node `BreakStatement` (
    label                   =>  Node.Label,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.ContinueStatement = Node `ContinueStatement` (
    label                   =>  Node.Label,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.DebuggerStatement = Node `DebuggerStatement` (
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.DoWhileStatement = Node `DoWhileStatement` (
    block                   =>  Node.BlockStatement,
    test                    =>  Node.Expression,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `body.freeVariables`,
                                    take => `test.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.EmptyStatement = Node `EmptyStatement` (
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.ExpressionStatement = Node `ExpressionStatement` (
    expression              =>  Node.Expression,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `expression.freeVariables`) );

exports.FunctionDeclaration = Node `FunctionDeclaration` (
    // This can be null in the `export default function() { }` case.
    id                      =>  nullable(Node.IdentifierPattern),
    params                  =>  array (Node.RootPattern),
    body                    =>  Node.BlockStatement,

    generator               =>  [boolean, false],
    async                   =>  [boolean, false],

    ([varBindings])         =>  compute (StringSet,
                                    take => `body.varBindingNames` ),

    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute (StringSet,
                                    take => `id.bindingNames`),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `id.freeVariables`,
                                    take => `params.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `id.bindingNames`,
                                    subtract => `params.bindingNames`,
                                    subtract => StringSet(["arguments"]) ) );

exports.IfStatement = Node `IfStatement` (
    test                    =>  Node.Expression,
    consequent              =>  Node.Statement,
    alternate               =>  nullable(Node.Statement),
    ([varBindingNames])     =>  compute (StringSet,
                                    take => `consequent.varBindingNames`,
                                    take => `alternate.varBindingNames` ),
    ([blockBindingNames])   => compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `test.freeVariables`,
                                    take => `consequent.freeVariables`,
                                    take => `alternate.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.ForOfStatement = Node `ForOfStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `left.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([blockBindings])       =>  compute (StringSet,
                                    take => `left.blockBindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `left.freeVariables`,
                                    take => `right.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.ForInStatement = Node `ForInStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `left.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([blockBindings])       =>  compute (StringSet,
                                    take => `left.blockBindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `left.freeVariables`,
                                    take => `right.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.ForStatement = Node `ForStatement` (
    init                    =>  nullable(or (Node.VariableDeclaration,
                                             Node.AssignmentExpression)),
    test                    =>  nullable(Node.Expression),
    update                  =>  nullable(Node.Expression),
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `init.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([blockBindings])       =>  compute (StringSet,
                                    take => `init.blockBindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `init.freeVariables`,
                                    take => `test.freeVariables`,
                                    take => `update.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.LabeledStatement = Node `LabeledStatement` (
    label                   =>  Node.Label,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([freeVariables])       =>  compute (StringSet,
                                    take => `body.freeVariables` ) );

exports.ReturnStatement = Node `ReturnStatement` (
    argument                =>  Node.Expression,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `argument.freeVariables` ) );

exports.ThrowStatement = Node `ThrowStatement` (
    argument                =>  Node.Expression,
    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `argument.freeVariables` ) );

exports.TryStatement = Node `TryStatement` (
    block                   =>  Node.BlockStatement,
    handler                 =>  [nullable(Node.CatchClause), null],
    finalizer               =>  [nullable(Node.BlockStatement), null],
    ([varBindingNames])     =>  compute (StringSet,
                                    take => `block.varBindingNames`,
                                    take => `handler.varBindingNames`,
                                    take => `finalizer.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `block.freeVariables`,
                                    take => `handler.freeVariables`,
                                    take => `finalizer.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.CatchClause = Node `CatchClause` (
    param                   =>  Node.RootPattern,
    body                    =>  Node.BlockStatement,

    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([blockBindings])       =>  compute (StringSet,
                                    take => `param.bindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `param.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `blockBindings` ) );

exports.WhileStatement = Node `WhileStatement` (
    test                    =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `test.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.WithStatement = Node `WithStatement` (
    object                  =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindingNames])     =>  compute (StringSet,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `object.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.VariableDeclarator = Node `VariableDeclarator` (
    id                      =>  Node.RootPattern,
    init                    =>  [nullable(Node.Expression), null],
    definite                =>  [nullable(boolean), null],

    ([bindingNames])        =>  compute (StringSet,
                                    take => `id.bindingNames` ),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `init.freeVariables`,
                                    take => `id.freeVariables`,
                                    subtract => `id.bindingNames` ) );

exports.VarVariableDeclaration = Node `VarVariableDeclaration` (
    ({override:type})       =>  "VariableDeclaration",
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    ([kind])                =>  data.always ("var"),

    ([varBindingBames])     =>  compute (StringSet,
                                    take => `declarators.bindingNames`),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `declarators.freeVariables`,
                                    subtract => `varBindingBames` ) );

exports.BlockVariableDeclaration = Node `BlockVariableDeclaration` (
    ({override:type})       =>  "VariableDeclaration",
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    kind                    =>  string,

    ([varBindingNames])     =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute (StringSet,
                                    take => `declarators.bindingNames`),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `declarators.freeVariables`,
                                    subtract => `blockBindingNames` ) );

exports.VariableDeclaration = union2 `VariableDecalaration` (
    is                      => Node.VarVariableDeclaration,
    or                      => Node.BlockVariableDeclaration );






















