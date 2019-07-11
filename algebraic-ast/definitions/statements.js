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
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.BlockStatement = Node `BlockStatement` (
    body                    =>  array (Node.Statement),

    ([varBindings])         =>  compute (StringSet, take => `body.varBindings` ),
    ([blockBindings])       =>  compute (StringSet,
                                    take => `body.blockBindingNames` ),

    ([blockBindingNames])   =>  compute.empty (StringSet),

    ([freeVariables])       =>  compute (StringSet,
                                    take => `body.freeVariables`,
                                    subtract => `varBindings`,
                                    subtract => `blockBindings` ) );

exports.BreakStatement = Node `BreakStatement` (
    label                   =>  Node.Label,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.ContinueStatement = Node `ContinueStatement` (
    label                   =>  Node.Label,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.DebuggerStatement = Node `DebuggerStatement` (
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.DoWhileStatement = Node `DoWhileStatement` (
    block               =>  Node.BlockStatement,
    test                =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("block", "test") );

exports.EmptyStatement = Node `EmptyStatement` (
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute.empty (StringSet) );

exports.ExpressionStatement = Node `ExpressionStatement` (
    expression              =>  Node.Expression,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `expression.freeVariables`) );

exports.FunctionDeclaration = Node `FunctionDeclaration` (
    // This can be null in the `export default function() { }` case.
    id                  =>  nullable(Node.IdentifierPattern),
    params              =>  array (Node.RootPattern),
    body                =>  Node.BlockStatement,

    generator           =>  [boolean, false],
    async               =>  [boolean, false],

    ([freeVariables])   =>  FreeVariables.from("id", "params", "body") )

exports.IfStatement = Node `IfStatement` (
    test                =>  Node.Expression,
    consequent          =>  Node.Statement,
    alternate           =>  nullable(Node.Statement),
    ([varBindings])     =>  compute (StringSet,
                                take => `consequent.varBindings`,
                                take => `alternate.varBindings` ),
    ([freeVariables])   =>  compute (StringSet,
                                take => `test.freeVariables`,
                                take => `consequent.freeVariables`,
                                take => `alternate.freeVariables`,
                                subtract => `varBindings` ) );

exports.ForOfStatement = Node `ForOfStatement` (
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForInStatement = Node `ForInStatement` (
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForStatement = Node `ForStatement` (
    init                =>  nullable(or (Node.VariableDeclaration,
                                         Node.AssignmentExpression)),
    test                =>  nullable(Node.Expression),
    update              =>  nullable(Node.Expression),
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from
                                ("init", "test", "update", "body") );

exports.LabeledStatement = Node `LabeledStatement` (
    label                   =>  Node.Label,
    body                    =>  Node.Statement,
    ([varBindings])         =>  compute (StringSet,
                                    take => `body.varBindings` ),

    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                take => `body.freeVariables` ) );

exports.ReturnStatement = Node `ReturnStatement` (
    argument                =>  Node.Expression,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `argument.freeVariables` ) );

exports.ThrowStatement = Node `ThrowStatement` (
    argument                =>  Node.Expression,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `argument.freeVariables` ) );

exports.WhileStatement = Node `WhileStatement` (
    test                    =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindings])         =>  compute (StringSet,
                                    take => `body.varBindings` ),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `test.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindings` ) );

exports.WithStatement = Node `WithStatement` (
    object                  =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `object.freeVariables`,
                                    take => `body.freeVariables` ) );

exports.VariableDeclarator = Node `VariableDeclarator` (
    id                      =>  Node.RootPattern,
    init                    =>  [nullable(Node.Expression), null],
    definite                =>  [nullable(boolean), null],

    ([bindingNames])        =>  compute (StringSet, take => `id.bindingNames` ),
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

    ([varBindings])         =>  compute (StringSet,
                                    take => `declarators.bindingNames`),
    ([blockBindingNames])   =>  compute.empty (StringSet),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `declarators.freeVariables`,
                                    subtract => `varBindings` ) );

exports.BlockVariableDeclaration = Node `BlockVariableDeclaration` (
    ({override:type})       =>  "VariableDeclaration",
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    kind                    =>  string,

    ([varBindings])         =>  compute.empty (StringSet),
    ([blockBindingNames])   =>  compute (StringSet,
                                    take => `declarators.bindingNames`),
    ([freeVariables])       =>  compute (StringSet,
                                    take => `declarators.freeVariables`,
                                    subtract => `blockBindings` ) );

exports.VariableDeclaration = union2 `VariableDecalaration` (
    is                      => Node.VarVariableDeclaration,
    or                      => Node.BlockVariableDeclaration );






















