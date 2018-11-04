const { declaration, fNamed, is, getTypename } = require("./declaration");
const { inspect } = require("util");
const { isArray } = Array;
const NoDefault = { };

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const fWithDefault = definition => isArray(definition) ?
    definition : [definition, NoDefault];
const fParseMap = farray => farray.map(f => [fNameParse(f), fWithDefault(f())]);

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

exports.data = declaration(function data (type, fieldDefinitions)
{
    const typename = getTypename(type);

    if (fieldDefinitions.length === 0)
    {
        const create = fNamed(`[create ${typename}]`, function ()
        {
            throw TypeError(
                `${typename} is a unary type, use ${typename} instead ` +
                `of ${typename}()`);
        });
        const is = value => value === type;
        const serialize = [() => 0, true];
        const deserialize = () => type;

        return { is, create, serialize, deserialize };
    }

    let children = false;
    const getChildren = () => children;
    const constructor = fNamed(`${typename}`, function (fields)
    {
        if (!fields)
            throw TypeError(`${typename} cannot be created without any fields.`);

        if (!children)
            children = fParseMap(fieldDefinitions);

        for (const [property, [child, defaultValue]] of children)
        {
            const value = hasOwnProperty.call(fields, property) ?
                fields[property] : defaultValue;

            if (value === NoDefault)
                throw TypeError(
                    `${typename} constructor requires field "${property}"`);

            if (!declaration.is(child, value))
                throw TypeError(
                    `${typename} constructor passed field ` +
                    `"${property}" of wrong type. Expected type ` +
                    `${getTypename(child)} but got ${value}.`);

            defineProperty(this, property,
                { value, writable, enumerable, configurable });
        }
    });
    constructor.prototype.toString = function () { return inspect(this) };
    const create = fNamed(`[create ${typename}]`,
        fields => new constructor(fields));
    const is = value => value instanceof constructor;
    const serialize = [toSerialize(typename, getChildren), false];
    const deserialize = toDeserialize(typename, getChildren, type);

    return { create, is, serialize, deserialize };
});


function toSerialize(typename, getChildren)
{
    // Should we skip or compress default values?
    return fNamed(`[serialize ${typename}]`, (value, serialize) =>
        getChildren().map(([property, [type]]) =>
            serialize(type, value[property])));
}

function toDeserialize(typename, getChildren, type)
{
    return fNamed(`[deserialize ${typename}]`, (serialized, deserialize) =>
        type(getChildren().reduce((fields, [property, [type]], index) =>
            (fields[property] = deserialize(type, serialized[index]), fields),
            Object.create(null))));
}

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

