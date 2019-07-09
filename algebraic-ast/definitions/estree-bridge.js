const { data } = require("@algebraic/type");
const ESTreeFieldRegExp = /^\(\{\s*ESTree\s*\}\)/;
const isESTreeField = f => typeof f === "function" && ESTreeFieldRegExp.test(f + "");

// ESTree looks for the "type" property of nodes to identify them. We will be
// extending the types available in ESTree and thus allow one to provide the
// "translation type" if available. We use this for IdentifierPattern and
// IdentifierExpression as they both appear as "Identifier" to ESTree/Babel.
module.exports = function ESTreeBridge ([name])
{
    return function (...fields)
    {
        const found = fields.findIndex(isESTreeField)
        const ESTreeType = found > 0 ? fields[found]({}) : name;
        const filtered = fields.filter((_, index) => index !== found);
        const type = data ([name]) (...filtered);

        type.prototype.type = ESTreeType;

        return type;
    }
}
