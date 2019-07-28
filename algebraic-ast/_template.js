const fromEntries = require("@climb/from-entries");

const { of, is, string } = require("@algebraic/type");
const { OrderedSet, Map } = require("@algebraic/collections");
const { isArray } = Array;

const Node = require("@algebraic/ast/node");
const parse = require("@algebraic/ast/parse");
const valueToExpression = require("@algebraic/ast/value-to-expression");
const generate = 
    (generate => node => generate(node).code)
    (require("@babel/generator").default);


module.exports.expression = function template(f)
{
    const fExpression = parse.expression(f + "");
    const { params, body } = fExpression;
    const names = params.reduce((names, param) =>
        names.union(param.bindingNames), OrderedSet(string)());
    const hasRest = is (Node.RestElement, params[params.length - 1]);
    const replacements = Map(string, Node.PlaceholderExpression)
        (names.map(name => [name, Node.PlaceholderExpression({ name })]));
    const withPlaceholders =
        replace(replacements, names, fExpression.body);

/*console.log(`return (${params.map(param => generate(param)).join(",")}) =>
            ((${names.join(",")}) => ${generate(withPlaceholders)})
            (...[${names.join(",")}].map(valueToExpression))`)
*/
    const template = Function("valueToExpression",
        `return (${params.map(param => generate(param)).join(",")}) =>
            ((${names.join(",")}) => stuff)
            (...[${names.join(",")}].map(valueToExpression))`)(valueToExpression);
    console.log(template+"");

//    return (...params) => names.map(name => )
    console.log(withPlaceholders);
}

function replace(replacements, names, node)
{
    if (isArray(node))
        return node.reduce((updated, node, index) =>
            (mapped => node === mapped ?
                updated :
                (nodes === updated && (updated = [...nodes]),
                    updated[index] = mapped,
                    updated))(replace(replacements, names, node)), nodes);

    if (is (Node.IdentifierExpression, node) &&
        replacements.has(node.name))
        return replacements.get(node.name);

    const included = names.intersect(node.freeVariables);

    if (included.size <= 0)
        return node;

    const mappedChildren = Object
        .entries(node)
        .filter(([_, node]) => is (Node, node) || isArray(node))
        .map(([key, node]) => [key, replace(replacements, included, node), node])
        .filter(([_, mapped, node]) => node !== mapped);

    return mappedChildren.length <= 0 ?
        node :
        of(node)({ ...node, ...fromEntries(mappedChildren) });
}
