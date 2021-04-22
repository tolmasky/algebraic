const type = require("@algebraic/type");
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

// https://tc39.es/ecma262/#prod-EmptyStatement

exports.EmptyStatement = Node `EmptyStatement` ();

// https://tc39.es/ecma262/#prod-DebuggerStatement

exports.DebuggerStatement = Node `DebuggerStatement` ();
