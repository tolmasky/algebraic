const { is } = require("@algebraic/type");
const { List } = require("@algebraic/collections");
const { isArray } = Array;

const Node = require("./node");

const ZeroLiteral = Node.NumericLiteral({ value: 0 });
const NegativeZeroLiteral =
    Node.UnaryExpression({ operator: "-", argument: ZeroLiteral });

const TrueLiteral = Node.BooleanLiteral({ value: true });
const FalseLiteral = Node.BooleanLiteral({ value: false });

const NullLiteral = Node.NullLiteral();
const Void0Literal =
    Node.UnaryExpression({ operator: "void", argument: ZeroLiteral });


module.exports = function valueToExpression(value)
{
    if (value === true)
        return TrueLiteral;

    if (value === false)
        return FalseLiteral;

    if (value === null)
        return NullLiteral;

    if (typeof value === "undefined")
        return void0;

    if (Object.is(0, value))
        return ZeroLiteral;

    if (Object.is(-0, value))
        return NegativeZeroLiteral;

    if (typeof value === "number")
        return Node.NumericLiteral({ value });

    if (typeof value === "string") {console.log(value);
        return Node.StringLiteral({ value });
}
    if (is(Node, value))
        return value;

    if (isArray(value))
        return Node.ArrayExpression(
            { elements: value.map(valueToExpression) });

    if (is (List, value))
        return valueToExpression(value.toArray());

    if (value instanceof RegExp)
        return Node.RegExpLiteral(
        {
            pattern: source,
            flags:  (global ? "g" : "") +
                    (ignoreCase ? "i" : "") +
                    (multiline ? "m" : "")
        });

    if (typeof value === "object")
        return Node.ObjectExpression(
        {
            properties: Object
                .entries(value)
                .map(([key, value]) =>
                    Node.ObjectPropertyLonghand(
                    {
                        key: Node.StringLiteral({ value: key }),
                        value: valueToExpression(value)
                    }))
        });

//    if (typeof value === "function")
//        return parseExpression(value + "");

    throw new Error("Converting object to object expression failed");
}
