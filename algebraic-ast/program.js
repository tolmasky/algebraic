const { type, caseof } = require("@algebraic/type");
const Node = require("./node");
const Extra = require("./extra");


exports.Directive = Node `Directive`
({
    value               :of =>  Node.DirectiveLiteral
});

exports.DirectiveLiteral = Node `DirectiveLiteral`
({
    value               :of =>  type.string,
    extra               :of =>  Extra.of(type.string) `?`
});

exports.InterpreterDirective = Node `InterpreterDirective`
({
    value               :of =>  type.string
});

exports.Script = Node `Script`
({
    // FIXME: needs "alway"s
    sourceType          :of =>  type.string,// `()=` ("script"),

    body                :of =>  Node.Statement `[]`,
    directives          :of =>  Node.Directive `[]`,
    interpreter         :of =>  Node.InterpreterDirective `?`,
    sourceFile          :of =>  type.string `?`
});

exports.ModuleItem = type `ModuleItem`
([
    caseof `.ImportDeclaration` (of => Node.ImportDeclaration),
    caseof `.ExportDeclaration` (of => Node.ExportDeclaration),
    caseof `.Statement` (of => Node.Statement)
]);

exports.Module = Node `Module`
({
    sourceType          :of =>  type.string,// `()=` ("module"),

    body                :of =>  Node.ModuleItem `[]`,
    directives          :of =>  Node.Directive `[]`,
    interpreter         :of =>  Node.InterpreterDirective `?`,
    sourceFile          :of =>  type.string `?`
});

exports.Program = type `Program`
([
    caseof `.Module` (of => Node.Module),
    caseof `.Script` (of => Node.Script)
]);

