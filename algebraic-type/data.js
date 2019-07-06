const any = require("./any");
const fail = require("./fail");
const partition = require("@climb/partition");

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
            field({ type, name, init: field.init.computed({ compute }) }))
        (computed, f([]));

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

    // Legacy
    let children = false;
    const getChildren = () => children || (children =
        fieldDefinitions.map(fieldFromDeclaration)
        .map(field => [field.name, [field.type, field.init]]));

    let initializers = () =>
        (created => (initializers = () => created, created))
        (toFieldInitializers(typename, fieldDefinitions));

    const create = fNamed(`[create ${typename}]`, function (...args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];

        if (values instanceof type)
            return values;

        if (!(this instanceof type))
            return new type(values);

        const inits = initializers();
        const uncomputed = inits.uncomputed
            .map(([name, init]) => [name, init(values)]);
        const computed = inits.computed.length <= 0 ?
            [] :
            (intermediate => inits.computed
                .map(([name, init]) => [name, init(intermediate)]))
            (Object.fromEntries(uncomputed));

        uncomputed.map(([name, value]) => defineProperty(this, name,
            { value, writable, enumerable, configurable }));
        computed.map(([name, value]) => defineProperty(this, name,
            { value, writable, enumerable, configurable }));
    });
    type.prototype.toString = function () { return inspect(this) };
    type[GetFieldsSymbol] = getChildren;

    const is = value => value instanceof type;
    const serialize = [toSerialize(typename, getChildren), false];
    const deserialize = toDeserialize(typename, getChildren, type);

    return { create, is, serialize, deserialize };
});

function toFieldInitializers(typename, fieldDefinitions)
{
    const typecheck = require("./typecheck");
    const mismatch = (type, value) =>
        `${typename} constructor passed value for field "${name}" of wrong"` +
        `type. Expected type ${getTypename(type)} but got ${value}.`;
    const missing = name =>
        fail.type(`${typename} constructor requires field "${name}"`);

    const fields = fieldDefinitions.map(fieldFromDeclaration);
    const [computed, uncomputed] = partition(
        ({ init }) => is(field.init.computed, init), fields);
    const fComputed = computed.map(({ type, name, init }) =>
        [name, typecheck.function(type, mismatch, init.compute)]);
    const fUncomputed = uncomputed.map(({ type, name, init }) =>
        [name, typecheck.function(type, mismatch,
            values => has(values, name) ?
                values[name] :
                is (field.init.default, init) ?
                    init.value :
                    missing(name))]);

    return { uncomputed: fUncomputed, computed: fComputed };
}

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
    data `computed` ( compute => ftype ) );

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


