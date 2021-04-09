const { IObject, IArray } = require("./intrinsics");
const constructible = require("./constructible");
const ConstructorDefinition = require("./constructor-definition");


function product(name, ...fieldDeclarations)
{
    const constructorDefinition = ConstructorDefinition(
        name,
        fieldDeclarations,
        preprocess);

    return constructible(
        name,
        constructorDefinition.hasPositionalFields,
        [constructorDefinition]);
}

module.exports = product;

function preprocess(T, C, values)
{
    return  C.hasPositionFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}

/*


//    if (Constructor.hasPositionalFields(defaultConstructor))
//        IObject.setPrototypeOf(T.prototype, IArray.prototype);

    return T;
}

function preprocess(T, C, values)
{
    return  Constructor.hasPositionalFields(C) ||
            values.length > 1 ?
                [false, values] :
                [values[0] instanceof T, values];
}

function initialize(T, C, processed)
{
    return [processed];
}

function construct(T, C, instantiate, processed)
{
    return IObject.assign(
        Constructor.hasPositionalFields(C) ?
            IObject.setPrototypeOf([], T) :
            instantiate(T),
        processed);
}

function preprocess(T, C, values)
{
    return unprocessed.length > 1 ?
        [false, unprocessed] :
        [values instanceof T, values];
}*/
