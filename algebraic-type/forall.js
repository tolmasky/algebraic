const { IObject } = require("./intrinsics");
const toCache = require("./cache");
const data = require("./data");

function variable(index)
{
    this.index = index;
    this.toString = () => `T${index}`;
}


module.exports = function variadic(fT)
{
    const variables = Array.from(fT, (_, index) => new variable(index));
    const template = fT(...variables);

    // FIXME: BAD!!! We should copy the type, not rename it...
    const of = (...arguments) =>
    {
        const T = fT(...arguments);
        const Vnames = arguments.map(T => T.name).join(", ");

        return Object
            .defineProperty(T, "name", { value: `${T.name}(${Vnames})` });
    };

    const cache = toCache();
    const constructors = data.constructors(template);
    const VT = IObject.assignNonenumerable(
        {},
        IObject.fromEntries(
            IObject
                .keys(constructors)
                .map(name =>
                    [name, { of: (...args) => VT.of(...args)[name] }])),
        { of: (...args) => cache(args, () => of(...args)) });
    
    return VT;
}
/*
function infer(constructor, fields, values)
{
    fields.
        type => infer(values[name])

    const types = reduce(values)

    return T.of(...types)[constructor](values);
}*/
