const { hasOwnProperty, getOwnPropertyNames } = Object;
const fromEntries = require("@climb/from-entries");

const extract = object =>
    fromEntries(
        getOwnPropertyNames(object)
        .map(name => [name, object[name]]));

exports.IObject = 
{
    ...extract(Object),
    fromEntries,
    has: (key, object) => hasOwnProperty.call(object, key)
};

exports.IArray = extract(Array);
