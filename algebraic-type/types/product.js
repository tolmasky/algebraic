const { IArray } = require("../intrinsics");
const ConstructorDeclaration = require("../constructor-definition");


function Product(name, body)
{
    // FIXME: isPositional === isArray(body) ?
    const constructorDeclaration =
        ConstructorDeclaration(name, body, preprocess);
    const constructorDeclarations = [constructorDeclaration];
    const inherits = constructorDeclaration.hasPositionalFields ?
        IArray.prototype :
        false;

    return { name, constructorDeclarations, inherits };
}

module.exports = Product;

Product.Product = Product;

Product.isProductBody = body => true;

function preprocess(T, C, values)
{
    return  C.hasPositionFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
