const { IObject, IArray } = require("./intrinsics");
const Constructible = require("./constructible");
const ConstructorDefinition = require("./constructor-definition");


module.exports = function product(name, ...fieldDeclarations)
{
    const constructorDefinition = ConstructorDefinition(
        name,
        fieldDeclarations,
        preprocess);

    return Constructible(
        name,
        constructorDefinition.hasPositionalFields,
        [constructorDefinition]);
}

function preprocess(T, C, values)
{
    return  C.hasPositionFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
