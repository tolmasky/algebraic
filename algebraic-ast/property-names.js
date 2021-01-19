const { data, string } = require("@algebraic/type");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


// Babel has no concept of a ComputedProperyName at all, and so this would
// require significant conversion on the way back (unlike PropertyName which
// just pretends to be an Identifier). However, we can do something similar
// here and pretend to be a ParenthesizedExpression.
exports.ComputedPropertyName = Node `ComputedPropertyName` (
    ([type])            =>  data.always ("ParenthesizedExpression"),

    expression          =>  Node.Expression );

exports.PropertyName = Node `PropertyName` (
    ([type])            =>  data.always ("Identifier"),

    name                =>  string );