const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.EmptyStatement = data `EmptyStatement` (
    ([type])            =>  data.always ("EmptyStatement"),
    ([freeVariables])   =>  FreeVariables.Never );

exports.ExpressionStatement = data `ExpressionStatement` (
    ([type])            =>  data.always ("ExpressionStatement"),
    expression          =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("expression") );

