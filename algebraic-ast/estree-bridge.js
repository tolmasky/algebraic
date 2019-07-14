const { data } = require("@algebraic/type");

// ESTree looks for the "ESTreeType" property of nodes to identify them. We will
// be extending the types available in ESTree and thus allow one to provide the
// "translation type" if available.
module.exports = function ESTreeBridge ([name])
{
    return function (...fields)
    {
        const declarations = fields
            .map(field => data.field.toFieldDeclaration(field));
        const found = declarations.findIndex(({ name }) => name === "ESTreeType");
        const ESTreeType = found >= 0 ? declarations[found].λdefinition([])[1]() : name;
        const filtered = declarations.filter((_, index) => index !== found);
        const type = data ([name]) (...filtered);

        type.prototype.type = ESTreeType;

        return type;
    }
}
