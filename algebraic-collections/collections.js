const { declare, getTypename } = require("@algebraic/type");


function toParamterizedType(constructor, parameters)
{
    const basename = getTypename(constructor);
    const required = parameters.length;
    const typeConstructor = function (...types)
    {
        const count = types.length;

        if (required !== count)
            throw TypeError(
                `${basename} takes ${required} types, but got ${count}`);

        const typename = `${basename}<${types.map(getTypename).join(", ")}>`;
        const create = constructor;
        const is = value => value instanceof constructor;
        const serialize = [parameters.length === 1 ?
            (value, serialize) =>
                value.toArray().map(value => serialize(types[0], value)) :
            (value, serialize) =>
                value.entrySeq().toArray().map(([key, value]) =>
                    [serialize(types[0], key), serialize(types[1], value)]),
            false];
        const deserialize = parameters.length === 1 ?
            (serialized, deserialize) => type(serialized.map(serialized =>
                deserialize(types[0], serialized))) :
            (serialized, deserialize) => type(serialized.map(([key, value]) =>
                [deserialize(types[0], key), deserialize(types[1], value)]));
        const type = declare({ typename, create, is, serialize, deserialize });

        for (const key of Object.keys(constructor))
            type[key] = constructor[key];

        return type;
    };

    return typeConstructor;
}

const { List, OrderedMap, Map, Set, OrderedSet, Stack } = require("immutable");

exports.List = toParamterizedType(List, ["element"]);
exports.OrderedMap = toParamterizedType(OrderedMap, ["key", "value"]);
exports.Map = toParamterizedType(Map, ["key", "value"]);
exports.Set = toParamterizedType(Set, ["element"]);
exports.OrderedSet = toParamterizedType(OrderedSet, ["element"]);
exports.Stack = toParamterizedType(Stack, ["element"]);


/*
const collection = (function()
{
    return I => (...args) => construct(T => forCollection(T, I, args));

    function forCollection(T, I, parameters)
    {
        const parameterNames =
            `<${parameters.map(T => type.description(T).typename)}>`;
        const typename = `${I.name}${parameterNames}`;

        // We probably want something better than this, we're not checking
        // the actual contents here.
        const is = value => value instanceof I;
        const initializer = I;
        const call = I;
        const keyedConstructors = I;

        return { typename, call, initializer, is, keyedConstructors };
    }
})();

type.Map = collection(Map);
type.Set = collection(Set);
type.OrderedSet = collection(OrderedSet);
type.List = collection(List);
type.Stack = collection(Stack);


const { is, IsSymbol, TypenameSymbol, typename } = require("@algebraic/type");
const getTypename = typename;
const InspectSymbol = require("util").inspect.custom;

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const fParseMap = farray => farray.map(f => [fNameParse(f), f()]);

const fNamed = (name, f) =>
    (Object.defineProperty(f, "name", { value: name }), f);


module.exports = function data ([typename])
{
    return define(typename);
}

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

function define (typename)
{
    return fNamed(`[define ${typename}]`, function (...fieldDefinitions)
    {
        const description = { types: false }

        return fNamed(typename, function T(fields)
        {
            if (!(this instanceof T))
                return new T(fields);

            if (!description.types)
                description.types = fParseMap(fieldDefinitions);

            for (const [property, type] of description.types)
            {
                const value = fields[property];

                if (!is(type, value))
                    throw TypeError(
                        `${typename} constructor passed field ` +
                        `"${property}" of wrong type. Expected type ` +
                        `${getTypename(type)}.`);

                defineProperty(this, property,
                    { value, writable, enumerable, configurable });
            }
        });
    });
};
*/
/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

