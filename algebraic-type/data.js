const { is, IsSymbol, TypenameSymbol, typename } = require("@algebraic/type");
const getTypename = typename;
const InspectSymbol = require("util").inspect.custom;
const { isArray } = Array;
const NoDefault = { };

const fNameRegExp = /([^=\s]+)\s*=>/;
const fNameParse = f => fNameRegExp.exec(f + "")[1];
const fWithDefault = definition => isArray(definition) ?
    definition : [definition, NoDefault];
const fParseMap = farray => farray.map(f => [fNameParse(f), fWithDefault(f())]);

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

            for (const [property, [type, defaultValue]] of description.types)
            {
                const value = hasOwnProperty.call(fields, property) ? 
                    fields[property] : defaultValue;

                if (value === NoDefault)
                    throw TypeError(
                        `${typename} constructor requires field "${property}"`);

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

/*
const fCreate = (f, properties) =>
    (Object.keys(properties)
        .forEach(key => defineProperty(f, key, { value: properties[key] }), f);
*/

