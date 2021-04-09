const { IObject, IArray } = require("./intrinsics");
const toCache = require("./cache");


function variable(index)
{
    this.index = index;
    this.toString = () => `T${index}`;
}

module.exports = function forall(name, ...rest)
{
    if (rest.length === 0)
        return (...rest) => forall(name, ...rest);

    const [fDefinition] = rest;
    const variables = IArray
        .from(fDefinition, (_, index) => new variable(index));
    const vDefinition = fDefinition(...variables);

    const of = (...Ts) =>
    {
        const Vnames = Ts.map(T => T.name).join(", ");

        return data (`${name}(${Vnames})`, fDefinition(...Ts));
    };

    const cache = toCache();
//    const constructors = data.constructors(template);
    const VT = IObject.assignNonenumerable(
        {},
        /*IObject.fromEntries(
            IObject
                .keys(constructors)
                .map(name =>
                    [name, { of: (...args) => VT.of(...args)[name] }])),*/
        { of: (...args) => cache(args, () => of(...args)) });

    return VT;
}

const data = require("./data");

console.log(data);
/*
function infer(constructor, fields, values)
{
    fields.
        type => infer(values[name])

    const types = reduce(values)

    return T.of(...types)[constructor](values);
}*/
