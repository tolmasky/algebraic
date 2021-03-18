const type = require("@algebraic/type");

const Extra = require("./extra");
const Node = require("./node");


exports.BigIntLiteral = Node `BigIntLiteral`
({
    value               :of =>  type.string,
    extra               :of =>  Extra(type.string) `?`
});

exports.BooleanLiteral = Node `BooleanLiteral`
({
    value               :of =>  boolean
});

exports.NumericLiteral = Node `NumericLiteral`
({
    value               :of =>  type.number,
    extra               :of =>  Extra(type.number) `?`,
});

exports.NullLiteral = Node `NullLiteral` ();

exports.RegExpLiteral = Node `RegExpLiteral`
({
    flags               :of =>  type.string,
    pattern             :of =>  type.string,
    extra               :of =>  Extra(type.stirng) `?`
});

exports.StringLiteral = Node `StringLiteral`
({
    value               :of =>  types.string,
    extra               :of =>  Extra(type.string) `?`
});

exports.TemplateElement = Node `TemplateElement`
({
    value               :of =>  Node.TemplateElement.Value,
    tail                :of =>  type.boolean `=` (false)
});

exports.TemplateElement.Value = type `TemplateElement.Value`
({
    raw                 :of =>  type.string,
    cooked              :of =>  type.string
});

exports.TemplateLiteral = Node `TemplateLiteral`
({
    expressions         :of =>  type.array(Node.Expression),
    quasis              :of =>  type.array(Node.TemplateElement)
});
