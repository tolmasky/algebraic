const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


exports.Label = Node `Label` (
    ([ESTreeType])          =>  data.always ("Identifier"),
    name                    =>  string,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  data.always (KeyPathsByName.None) );

exports.BlockStatement = Node `BlockStatement` (
    body                    =>  array (Node.Statement),

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([blockBindings])       =>  KeyPathsByName.compute (
                                    take => `body.blockBindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.BreakStatement = Node `BreakStatement` (
    label                   =>  Node.Label,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  data.always (KeyPathsByName.None) );

exports.ContinueStatement = Node `ContinueStatement` (
    label                   =>  Node.Label,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  data.always (KeyPathsByName.None) );

exports.DebuggerStatement = Node `DebuggerStatement` (
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  data.always (KeyPathsByName.None) );

exports.DoWhileStatement = Node `DoWhileStatement` (
    block                   =>  Node.BlockStatement,
    test                    =>  Node.Expression,

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `body.freeVariables`,
                                    take => `test.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.EmptyStatement = Node `EmptyStatement` (
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  data.always (KeyPathsByName.None) );

exports.ExpressionStatement = Node `ExpressionStatement` (
    expression              =>  Node.Expression,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `expression.freeVariables`) );

exports.FunctionDeclaration = Node `FunctionDeclaration` (
    // This can be null in the `export default function() { }` case.
    id                      =>  nullable(Node.IdentifierPattern),
    params                  =>  array (Node.RootPattern),
    body                    =>  Node.BlockStatement,

    generator               =>  [boolean, false],
    async                   =>  [boolean, false],

    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  KeyPathsByName.compute (
                                    take => `id.bindingNames`),

    ([varBindings])         =>  KeyPathsByName.compute (
                                    take => `id.bindingNames`,
                                    take => `params.bindingNames`,
                                    take => `body.varBindingNames`,
                                    take => KeyPathsByName.just("arguments") ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `params.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindings` ) );

exports.IfStatement = Node `IfStatement` (
    test                    =>  Node.Expression,
    consequent              =>  Node.Statement,
    alternate               =>  nullable(Node.Statement),
    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `consequent.varBindingNames`,
                                    take => `alternate.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `test.freeVariables`,
                                    take => `consequent.freeVariables`,
                                    take => `alternate.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.ForOfStatement = Node `ForOfStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `left.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([blockBindings])       =>  KeyPathsByName.compute (
                                    take => `left.blockBindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `left.freeVariables`,
                                    take => `right.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.ForInStatement = Node `ForInStatement` (
    left                    =>  or (Node.RootPattern, Node.VariableDeclaration),
    right                   =>  Node.Expression,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `left.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([blockBindings])       =>  KeyPathsByName.compute (
                                    take => `left.blockBindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
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

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `init.varBindingNames`,
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([blockBindings])       =>  KeyPathsByName.compute (
                                    take => `init.blockBindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `init.freeVariables`,
                                    take => `test.freeVariables`,
                                    take => `update.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames`,
                                    subtract => `blockBindings` ) );

exports.LabeledStatement = Node `LabeledStatement` (
    label                   =>  Node.Label,
    body                    =>  Node.Statement,

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `body.freeVariables` ) );

exports.ReturnStatement = Node `ReturnStatement` (
    argument                =>  Node.Expression,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `argument.freeVariables` ) );

exports.ThrowStatement = Node `ThrowStatement` (
    argument                =>  Node.Expression,
    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `argument.freeVariables` ) );

exports.TryStatement = Node `TryStatement` (
    block                   =>  Node.BlockStatement,
    handler                 =>  [nullable(Node.CatchClause), null],
    finalizer               =>  [nullable(Node.BlockStatement), null],
    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `block.varBindingNames`,
                                    take => `handler.varBindingNames`,
                                    take => `finalizer.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `block.freeVariables`,
                                    take => `handler.freeVariables`,
                                    take => `finalizer.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.CatchClause = Node `CatchClause` (
    param                   =>  Node.RootPattern,
    body                    =>  Node.BlockStatement,

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),

    ([blockBindings])       =>  KeyPathsByName.compute (
                                    take => `param.bindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `param.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `blockBindings` ) );

exports.WhileStatement = Node `WhileStatement` (
    test                    =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `test.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.WithStatement = Node `WithStatement` (
    object                  =>  Node.Expression,
    body                    =>  Node.Statement,
    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `body.varBindingNames` ),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `object.freeVariables`,
                                    take => `body.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.VariableDeclarator = Node `VariableDeclarator` (
    id                      =>  Node.RootPattern,
    init                    =>  [nullable(Node.Expression), null],
    definite                =>  [nullable(boolean), null],

    ([bindingNames])        =>  KeyPathsByName.compute (
                                    take => `id.bindingNames` ),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `init.freeVariables`,
                                    take => `id.freeVariables` ) );

exports.VarVariableDeclaration = Node `VarVariableDeclaration` (
    ([ESTreeType])          =>  data.always ("VariableDeclaration"),
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    ([kind])                =>  data.always ("var"),

    ([varBindingNames])     =>  KeyPathsByName.compute (
                                    take => `declarators.bindingNames`),
    ([blockBindingNames])   =>  data.always (KeyPathsByName.None),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `declarators.freeVariables`,
                                    subtract => `varBindingNames` ) );

exports.BlockVariableDeclaration = Node `BlockVariableDeclaration` (
    ([ESTreeType])          =>  data.always ("VariableDeclaration"),
    declarators             =>  array (Node.VariableDeclarator),
    ([declarations])        =>  [array (Node.VariableDeclarator),
                                    declarators => declarators],

    kind                    =>  string,

    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  KeyPathsByName.compute (
                                    take => `declarators.bindingNames`),
    ([freeVariables])       =>  KeyPathsByName.compute (
                                    take => `declarators.freeVariables`,
                                    subtract => `blockBindingNames` ) );

exports.VariableDeclaration = union2 `VariableDecalaration` (
    is                      => Node.VarVariableDeclaration,
    or                      => Node.BlockVariableDeclaration );






















