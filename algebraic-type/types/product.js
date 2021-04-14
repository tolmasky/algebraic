const { IArray } = require("../intrinsics");
const ConstructorDeclaration = require("../constructor-definition");


module.exports = function Product(name, body)
{
    const constructorDeclaration =
        ConstructorDeclaration(name, body, preprocess);
    const constructorDeclarations = [constructorDeclaration];
    const prototype = constructorDeclaration.hasPositionalFields ?
        IArray.prototype :
        false;

    return { name, constructorDeclarations, prototype };
}

function preprocess(T, C, values)
{
    return  C.hasPositionFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
