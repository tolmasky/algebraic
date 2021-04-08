const
{
    entries,
    defineProperty,
    hasOwnProperty,
    getOwnPropertyNames
} = Object;
const fromEntries = require("@climb/from-entries");

const extract = object =>
    fromEntries(
        getOwnPropertyNames(object)
        .map(name => [name, object[name]]));

exports.IObject = 
{
    ...extract(Object),
    fromEntries,
    has: (key, object) => hasOwnProperty.call(object, key),
    assignNonenumerable: (to, ...from) => from
        .flatMap(from => entries(from))
        .reduce((to, [key, value]) =>
            defineProperty(to, key, { value }),
            to)
};

exports.IArray = extract(Array);
