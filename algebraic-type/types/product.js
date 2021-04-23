const { IObject, IArray } = require("../intrinsics");
const isSingleObject = body => body.length === 1 && typeof body[0] === "object";
const hasPositionProperties = body => body.length > 0 && !isSingleObject(body);
const { of } = require("../type");
const onPrototype =
{
    Δ: function (mutation)
    {
        const T = of(this);
        const key = (mutation + "").match(/([^\s=])*/)[0];
        const original = this[key];
        const updated = mutation(original);

        return original === updated ?
            this :
            T({ ...this, [key]: updated });
    }
};

exports.Product = (name, body) =>
({
    name,
    inherits: hasPositionProperties(body) && IArray.prototype,
    constructors: [{ name, fields: body, preprocess }],
    onPrototype
});

exports.isProductBody = body => true;

function preprocess(T, C, values)
{
    const hasPositionalFields = T.prototype instanceof Array;

    return hasPositionalFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
