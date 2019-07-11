const { data, string } = require("@algebraic/type");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;


// Babel has no concept of a ComputedProperyName at all, and so this would
// require significant conversion on the way back (unlike PropertyName which
// just pretends to be an Identifier). However, we can do something similar
// here and pretend to be a ParenthesizedExpression.
exports.ComputedPropertyName = data `ComputedPropertyName` (
    ([type])            =>  data.always ("ParenthesizedExpression"),

    expression          =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("expression") );

exports.PropertyName = data `PropertyName` (
    ([type])            =>  data.always ("Identifier"),

    name                =>  string,
    ([freeVariables])   =>  FreeVariables.Never );