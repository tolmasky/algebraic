const any = require("./any");
const fail = require("./fail");

const { declaration, fNamed, is, getTypename } = require("./declaration");
const { inspect } = require("util");
const { isArray } = Array;
const NoDefault = { };
const has = hasOwnProperty.call.bind(hasOwnProperty);
const { string, ftype } = require("./primitive");
const { union } = require("./union");
const EmptyArguments = Object.create(null);


const fieldFromDeclaration = (function ()
{
    const fNameRegExp = /(?:^\(\[([^\]]+)\]\))|([^=\s]+)\s*=>/;
    const fNameParse = f => fNameRegExp.exec(f + "");
    const fWithDefault = definition => Array.isArray(definition) ?
        (([T, value]) => [T, field.init.default({ value })])(definition) :
        [definition, field.init.none];
    const fFromArrowFunction = (f, [, computed, set] = fNameParse(f)) =>
        set ?
            ((name, [type, init]) => field({ type, name, init }))
            (set, fWithDefault(f())) :
        ((name, [type, compute]) =>
            field({ type, name, init: field.init.compute({ compute }) }))
        (computed, f());

    return declaration => is(field.declare, declaration) ?
        declaration.create() : fFromArrowFunction(declaration);
})();

const writable = false;
const enumerable = true;
const configurable = false;
const defineProperty = Object.defineProperty;

const GetFieldsSymbol = Symbol("GetFields");

const data = declaration(function data (type, fieldDefinitions)
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

        type[GetFieldsSymbol] = () => [];

        return { is, create, serialize, deserialize };
    }

    let fields = false;
    const getFields = () => fields ||
        (fields = fieldDefinitions.map(fieldFromDeclaration));

    // Legacy
    let children = false;
    const getChildren = () => children || (children = getFields()
        .map(field => [field.name, [field.type, field.init]]));

    const create = fNamed(`[create ${typename}]`, function (...args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];

        if (values instanceof type)
            return values;

        if (!(this instanceof type))
            return new type(values);

        for (const { type, name, init } of getFields())
        {
            const value =
                has(values, name) ? values[name] :
                init !== field.init.none ? init.value :
                fail.type(`${typename} constructor requires field "${name}"`);

            if (!declaration.is(type, value))
                throw TypeError(
                    `${typename} constructor passed field ` +
                    `"${name}" of wrong type. Expected type ` +
                    `${getTypename(type)} but got ${value}.`);

            defineProperty(this, name,
                { value, writable, enumerable, configurable });
        }
    });
    type.prototype.toString = function () { return inspect(this) };
    type[GetFieldsSymbol] = getChildren;

    const is = value => value instanceof type;
    const serialize = [toSerialize(typename, getChildren), false];
    const deserialize = toDeserialize(typename, getChildren, type);

    return { create, is, serialize, deserialize };
});

module.exports.data = data;

const field = function field (values)
{
    if (!(this instanceof field))
        return new field(values);

    this.type = values.type;
    this.name = values.name;
    this.init = has(values, "init") ?
        values.init : field.init.none;

    return this;
}

data.field = field;

data.field.init = union `data.field.init` (
    data `none` (),
    data `default` ( value => any ),
    data `compute` ( compute => ftype ) );

data.field.declare = data `field.declare` (
    create => ftype );

data.fields = function (type)
{
    return type[GetFieldsSymbol]().map(([name, [type]]) => [name, type]);
}

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


