const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


exports.Label = Node `Label` (
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
    id                      =>  nullable(Node.IdentifierBinding),

    parameters              =>  [array (Node.DefaultableBinding), []],
    restParameter           =>  [nullable (Node.RestElementBinding), null],

    body                    =>  Node.BlockStatement,

    generator               =>  [boolean, false],
    async                   =>  [boolean, false],

    ([varBindingNames])     =>  data.always (KeyPathsByName.None),
    ([blockBindingNames])   =>  KeyPathsByName.compute (
                                    take => `id.bindingNames`),
// wrong? because params can have a free variables that should NOT be removed from varBindings.
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
    left                    =>  or (Node.AssignmentExpression,
                                    Node.VariableDeclaration,
                                    Node.LexicalDeclaration),
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
    left                    =>  or (Node.AssignmentExpression,
                                    Node.VariableDeclaration,
                                    Node.LexicalDeclaration),
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
    init                    =>  or (Node.AssignmentExpression,
                                    Node.VariableDeclaration,
                                    Node.LexicalDeclaration),
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
    param                   =>  Node.Binding,
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

// https://tc39.es/ecma262/#prod-VariableStatement
exports.VariableDeclaration   = Node `VariableDeclaration` (
    bindings                =>  array (or (
                                    Node.IdentifierBinding,
                                    Node.DefaultedBinding ) ) );

// https://tc39.es/ecma262/#prod-LexicalDeclaration
exports.LexicalDeclaration = union2 `LexicalDeclaration` (
    is                      =>  Node.LetLexicalDeclaration,
    or                      =>  Node.ConstLexicalDeclaration );

exports.LetLexicalDeclaration = Node `LetLexicalDeclaration` (
    bindings                =>  array (or (
                                    Node.IdentifierBinding,
                                    Node.DefaultedBinding ) ) );

exports.ConstLexicalDeclaration = Node `ConstLexicalDeclaration` (
    bindings                =>  array (Node.DefaultedBinding) );


