const type = require("@algebraic/type");
const Node = require("./node");


exports.Label = Node `Label`
({
    name                    :of =>  type.string
});

exports.BlockStatement = Node `BlockStatement`
({
    body                    :of =>  type.array (Node.Statement),
});

exports.BreakStatement = Node `BreakStatement`
({
    label                   :of =>  Node.Label
});

exports.ContinueStatement = Node `ContinueStatement`
({
    label                   :of =>  Node.Label
});

exports.DebuggerStatement = Node `DebuggerStatement` ();

exports.DoWhileStatement = Node `DoWhileStatement`
({
    block                   :of =>  Node.BlockStatement,
    test                    :of =>  Node.Expression
});

exports.EmptyStatement = Node `EmptyStatement` ();

exports.ExpressionStatement = Node `ExpressionStatement`
({
    expression              :of =>  Node.Expression
});

exports.FunctionDeclaration = Node `FunctionDeclaration`
({
    // This can be null in the `export default function() { }` case.
    id                      :of =>  Node.IdentifierBinding `?`,

    parameters              :of =>  type.array (Node.DefaultableBinding) `=` ([]),
    restParameter           :of =>  Node.RestElementBinding `?`,

    body                    :of =>  Node.BlockStatement,

    generator               :of =>  type.boolean `=` (false),
    async                   :of =>  type.boolean `=` (false),
});

exports.IfStatement = Node `IfStatement`
({
    test                    :of =>  Node.Expression,
    consequent              :of =>  Node.Statement,
    alternate               :of =>  Node.Statement `?`
});

exports.ForOfStatement = Node `ForOfStatement`
({
    left                    :of =>  type.union (
                                        Node.AssignmentExpression,
                                        Node.VariableDeclaration,
                                        Node.LexicalDeclaration),
    right                   :of =>  Node.Expression,
    body                    :of =>  Node.Statement
});

exports.ForInStatement = Node `ForInStatement`
({
    left                    :of =>  type.union (
                                        Node.AssignmentExpression,
                                        Node.VariableDeclaration,
                                        Node.LexicalDeclaration),
    right                   :of =>  Node.Expression,
    body                    :of =>  Node.Statement
});

exports.ForStatement = Node `ForStatement`
({
    init                    :of =>  type.union (
                                        Node.AssignmentExpression,
                                        Node.VariableDeclaration,
                                        Node.LexicalDeclaration),
    test                    :of =>  Node.Expression `?`,
    update                  :of =>  Node.Expression `?`,
    body                    :of =>  Node.Statement
});

exports.LabeledStatement = Node `LabeledStatement`
({
    label                   :of =>  Node.Label,
    body                    :of =>  Node.Statement
});

exports.ReturnStatement = Node `ReturnStatement`
({
    argument                :of =>  Node.Expression
});

exports.ThrowStatement = Node `ThrowStatement`
({
    argument                :of =>  Node.Expression
});

exports.TryStatement = Node `TryStatement`
({
    block                   :of =>  Node.BlockStatement,
    handler                 :of =>  Node.CatchClause `?`,
    finalizer               :of =>  Node.BlockStatement `?`
});

exports.CatchClause = Node `CatchClause`
({
    param                   :of =>  Node.Binding,
    body                    :of =>  Node.BlockStatement
});

exports.WhileStatement = Node `WhileStatement`
({
    test                    :of =>  Node.Expression,
    body                    :of =>  Node.Statement
});

exports.WithStatement = Node `WithStatement`
({
    object                  :of =>  Node.Expression,
    body                    :of =>  Node.Statement
});

// https://tc39.es/ecma262/#prod-VariableStatement
exports.VariableDeclaration   = Node `VariableDeclaration`
({
    bindings                :of =>  type.array (type.union (
                                    Node.IdentifierBinding,
                                    Node.DefaultedBinding ) )
});

// https://tc39.es/ecma262/#prod-LexicalDeclaration
exports.LexicalDeclaration = type.union `LexicalDeclaration` (
    of                      =>  Node.LetLexicalDeclaration,
    of                      =>  Node.ConstLexicalDeclaration );

exports.LetLexicalDeclaration = Node `LetLexicalDeclaration`
({
    bindings                :of =>  type.array (type.union (
                                    Node.IdentifierBinding,
                                    Node.DefaultedBinding ) )
});

exports.ConstLexicalDeclaration = Node `ConstLexicalDeclaration`
({
    bindings                :of =>  type.array (Node.DefaultedBinding)
});


