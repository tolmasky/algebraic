const of = require("./of");
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

const DataMetadata = Symbol("data.metadata");
const cached = f => (cached => () => cached ?
    cached.value : (cached = { value: f() }).value)
    (false);

const data = declaration(function data (type, fieldDeclarations)
{
    const typename = getTypename(type);

    if (fieldDeclarations.length === 0)
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
        const empty = () => [];

        type[DataMetadata] =
            { fields: empty, fieldsCompiled: empty, fieldDeclarations };

        return { is, create, serialize, deserialize };
    }

    // Legacy
    let children = false;
    const getChildren = () => []/*children || (children =
        fieldDefinitions.map(field.compile)
        .map(field => [field.name, [field.type, field.init]]));*/

    const fields = cached(() => fieldsCompiled().map(field.fromCompiled));
    const fieldsCompiled = cached(() => field.compile(fieldDeclarations));
    const toFieldDeclarations = cached(() =>
        fieldDeclarations.map(field.toFieldDeclaration));
    const create = fNamed(`[create ${typename}]`, function (...args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];

        if (values instanceof type)
            return values;

        if (!(this instanceof type))
            return new type(values);

        const compiled = fieldsCompiled();
        const uncomputed = initialize(typename, compiled.uncomputed, values);
        const computed = compiled.computed.length <= 0 ?
            [] :
            initialize(typename,
                compiled.computed,
                Object.fromEntries(uncomputed));

        uncomputed.map(([name, value]) => defineProperty(this, name,
            { value, writable, enumerable, configurable }));
        computed.map(([name, value]) => defineProperty(this, name,
            { value, writable, enumerable, configurable }));

        return this;
    });

    type.prototype.toString = function () { return inspect(this) };
    type[DataMetadata] = { fields, fieldsCompiled, toFieldDeclarations };

    const is = value => value instanceof type;
    const serialize = [toSerialize(typename, getChildren), false];
    const deserialize = toDeserialize(typename, getChildren, type);

    return { create, is, serialize, deserialize };
});

const initialize = (function ()
{
    const toString = value =>
        typeof value === "function" ?
            value + "" :
            JSON.stringify(value);
    const typecheck = (owner, name, { expected, value }) =>
        `${owner} constructor passed value for field "${name}" of wrong ` +
        `type. Expected type ${getTypename(expected)} but got ` +
        `${toString(value)}.`;
    const missing = (owner, name) =>
        `${owner} constructor requires field "${name}"`;
    const message = (owner, name, error) =>
        is (field.error.missing, error) ?
            missing(owner, name, error) :
            typecheck(owner, name, error);

    return (typename, fields, values) => { 
    console.log(values);
//    console.log("DOING " + typename, values, fields, Error().stack);
    return fields
        .map(([name, [initialize]]) => [name, initialize(values, name)])
        .map(([name, [success, value]]) => success ?
            [name, value] :
            fail.type(message(typename, name, value)))};
})();

module.exports.data = data;

const field = require("./field");

data.always = value => [of(value), () => value];
data.field = field;
data.fields = type => type[DataMetadata].fields();
data.fieldDeclarations = type => type[DataMetadata].toFieldDeclarations();

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
