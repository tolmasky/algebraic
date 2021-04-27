const { type, caseof } = require("@algebraic/type");
const Node = require("./node");
//const RestableList = require("./restable-list");


// https://tc39.es/ecma262/#prod-BlockStatement

exports.BlockStatement = Node `BlockStatement`
({
    body   :of  =>  Node.Block
});

// https://tc39.es/ecma262/#prod-Block

exports.Block = Node `Block`
({
    statements   :of =>  Node.StatementList,
});

// https://tc39.es/ecma262/#prod-VariableStatement

exports.VariableStatement = Node `VariableStatement`
({
    variableDeclarations    :of => Node.VariableDeclaration `[]`
});

// https://tc39.es/ecma262/#prod-VariableDeclaration

exports.VariableDeclaration = type `VariableDeclaration`
([
    caseof `.VariableDeclarationIdentifier`
        (of => Node.VariableDeclarationIdentifier),
    caseof `.VariableDeclarationPattern`
        (of => Node.VariableDeclarationPattern)
]);

exports.VariableDeclarationIdentifier = Node `VariableDeclaration`
({
    binding                 :of => Node.BindingIdentifier,
    initializer             :of => Node.AssignmentExpression `?`
});

exports.VariableDeclarationPattern = Node `VariableDeclaration`
({
    binding                 :of => Node.BindingPattern,
    initializer             :of => Node.AssignmentExpression
});

// https://tc39.es/ecma262/#prod-EmptyStatement

exports.EmptyStatement = Node `EmptyStatement` ();

// https://tc39.es/ecma262/#prod-ExpressionStatement

exports.ExpressionStatement = Node `ExpressionStatement`
({
    expression  :of =>  Node.Expression
});

// https://tc39.es/ecma262/#prod-IfStatement

exports.IfStatement = Node `IfStatement`
({
    test                    :of =>  Node.Expression,
    consequent              :of =>  Node.Statement,
    alternate               :of =>  Node.Statement `?`
});

// https://tc39.es/ecma262/#prod-ReturnStatement

exports.ReturnStatement = Node `ReturnStatement`
({
    argument                :of =>  Node.Expression `?`
});

// https://tc39.es/ecma262/#prod-WithStatement

exports.WithStatement = Node `WithStatement`
({
    object                  :of =>  Node.Expression,
    body                    :of =>  Node.Statement
});

// https://tc39.es/ecma262/#prod-ThrowStatement

exports.ThrowStatement = Node `ThrowStatement`
({
    argument                :of =>  Node.Expression
});

// https://tc39.es/ecma262/#prod-TryStatement

exports.TryStatement = Node `TryStatement`
({
    block                   :of =>  Node.Block,
    handler                 :of =>  Node.CatchClause `?`,
    finalizer               :of =>  Node.Block `?`
});

// https://tc39.es/ecma262/#prod-Catch

exports.CatchClause = Node `CatchClause`
({
    param                   :of =>  Node.Binding `?`,
    body                    :of =>  Node.Block
});

// https://tc39.es/ecma262/#prod-DebuggerStatement

exports.DebuggerStatement = Node `DebuggerStatement` ();
