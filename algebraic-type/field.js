const { is, fNamed } = require("./declaration");
const { parameterized } = require("./parameterized");
const { belongs, parameters } = parameterized;
const union = require("./union");
const maybe = require("./maybe");
const or = require("./or");
const { data } = require("./data");
const { ftype, string, boolean } = require("./primitive");
const { isArray } = Array;
const has = hasOwnProperty.call.bind(hasOwnProperty);
const any = require("./any");
const fail = require("./fail");


// data.fields are datas themselves, so creating them is a little tricky. You
// can quickly get into infinite recursion as data.fields have data.fields
// which have data.fields, etc. The solution is to have an internal non-data
// representation and only create the data.field representation as necessary
// (lazily).
//
// Here is our "official" representation. Technically this recurses forever,
// as data.field<T>'s init property is a data.field <data.field <T>.init>,
// which itself has an init field that is a
// data.field <data.field <data.field <T>.init >.init>, etc.
const field = parameterized(T =>
    data `data.field <${T}>` (
        name        => string,
        definition  => field.definition(T) ) );

module.exports = field;

field.definition = parameterized(function (T)
{
    const suppliedT = field.definition.supplied(T);
    const computedT = field.definition.computed(T);

    return union `data.definition<${T}>` (
        supplied => suppliedT,
        computed => computedT );
});

field.definition.supplied = parameterized(T =>
    data `field.definition<${T}>.supplied` (
        fallback        => maybe (T) ) );

field.definition.computed = parameterized(T =>
    data `field.definition<${T}>.computed` (
        compute         => ftype,
        dependencies    => Array ) );

field.deferred = data `field.deferred` (
    name                => string,
    computed            => [boolean, false],
    λdefinition         => ftype );

field.declaration = union `field.declaration` (
    field,
    field.deferred );

field.error = union `field.error` (
    data `missing` (
        name        => string ),
    data `type` (
        expected    => any,
        value       => any ) );

field.compile = function (fieldDeclarations)
{
    const partition = require("@climb/partition");
    const compiled = fieldDeclarations.map(fromDeclaration);
    const [computed, uncomputed] =
        partition(([, [, computed]]) => computed, compiled);

    return Object.assign(compiled, { computed, uncomputed });
}

// field.declaration
//  field.declaration.direct
//  field.declaration.shorthand
//
// field.declaration { name, definition }
// property { name, definition: supplied }
// property { name, definition: computed }

const parseShorthand = (function ()
{
    const fShorthandRegExp = /(?:^\(\[([^\]]+)\]\))|([^=\s]+)\s*=>/;

    return f =>
        (([, computed, supplied]) => [!!computed, computed || supplied])
        (fShorthandRegExp.exec(f + ""));
})();

function fromDeclaration(declaration)
{
    const isShorthand = !is (field.declaration, declaration);
    const [computed, name, definition] =
        isShorthand ?
            [...parseShorthand(declaration), declaration([])] :
        is (field.deferred, declaration) ?
            [declaration.computed,
                declaration.name,
                declaration.λdefinition([])] :
        [is (field.definition.computed, declaration.definition),
            declaration.name,
            declaration.definition];
    const compiled = is (field.definition, definition) ?
        fromDefinition(definition) :
        fromShorthandDefinition(computed, definition);

    return [name, compiled];
}

function fromDefinition(definition)
{
    const type = parameters(definition)[0];

    return is (field.definition.supplied, definition) ?
        toSuppliedIC(type, definition) :
        toComputedIC(type, definition);
}

function fromShorthandDefinition(computed, definition)
{
    const tuple = isArray(definition);

    if (computed && tuple)
        return fromComputedShorthand(...definition);

    if (computed && !tuple)
        return fail("Failed to parse computed property, you must pass an array");

    const type = tuple ? definition[0] : definition;
    const fallback = tuple ?
        maybe(type).just({ value: definition[1] }) :
        maybe(type).nothing;

    return  toSuppliedIC(type, { fallback });
}

const fromComputedShorthand = (function ()
{
    const templateRegExp = require("./templated-regular-expression");
    const { objectRegExp, listRegExp, emptyRegExp } = templateRegExp(
    {
        name: /[^,\}\s\)]+/g,
        names: /${name}(?:\s*,\s*${name})*/,
        objectRegExp: /^\(\s*\{\s*${names}\s*\}\)/,
        listRegExp: /^\(?\s*(${names})\s*\)?/,
        emptyRegExp: /^\(\s*(\{\s*\})?\s*\)/,
    });

    return function fromComputedShorthand(type, shorthand)
    {
        const fString = shorthand + "";

        if (emptyRegExp.exec(fString))
            return toComputedIC(type,
                { compute: () => shorthand(), dependencies:[] });

        const object = objectRegExp.exec(fString);
        const extracted = (object || listRegExp.exec(fString))[1];
        const dependencies = extracted.split(/\s*,\s*/);
        const deduped = Array.from(new Set(dependencies));
        const compute = object ?
            values => shorthand(values) :
            values => shorthand(...dependencies.map(name => values[name]));

        return toComputedIC(type, { compute, dependencies });
    }
})();

function toSuppliedIC(type, definition)
{
    const { fallback } = definition;
    const initializer = fallback === maybe(type).none ?
        (provided, name) => has(provided, name) ?
            [true, provided[name]] :
            [false, field.error.missing({ name })] :
        (provided, name) => has(provided, name) ?
            [true, provided[name]] :
            [true, fallback.value];

    return toIC(false, initializer, type, definition);
}

function toComputedIC(type, definition)
{
    const resulted = values => [true, definition.compute(values)];

    return toIC(true, resulted, type, definition);
}

function toIC(computed, initializer, type, definition)
{
    return [typechecked(type, initializer), computed, type, definition];
}

function typechecked(expected, initializer)
{
    return (...args) => (([success, value]) =>
        !success ? [success, value] :
        is (expected, value) ? [true, value] :
        [false, field.error.type({ expected, value })])
        (initializer(...args));
}

module.exports.fromCompiled = function ([name, [_, computed, type, values]])
{
    const definitionT = field.definition(type);
    const definition = computed ?
        definitionT.computed(values) :
        definitionT.supplied(values);

    return field(type)({ name, definition });
}

module.exports.toFieldDeclaration = function toFieldDeclaration (declaration)
{console.log(declaration);
    if (is (field.declaration, declaration))
        return declaration;

    const [computed, name] = parseShorthand(declaration);
    const λdefinition = declaration;

    return field.deferred({ name, computed, λdefinition });
}
