const { IArray } = require("../intrinsics");


exports.Product = (name, body) =>
({
    name,
    inherits: IArray.isArray(body) && IArray.prototype,
    constructors: [{ name, fields: body, preprocess }]
});

exports.isProductBody = body => true;

function preprocess(T, C, values)
{
    return  C.hasPositionFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
