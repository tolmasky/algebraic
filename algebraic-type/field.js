const { is, fNamed } = require("./declaration");
const { parameterized } = require("./parameterized");
const { belongs, parameters } = parameterized;
const union = require("./union");
const maybe = require("./maybe");
const or = require("./or");
const { data } = require("./data");
const { ftype, string } = require("./primitive");
const { isArray } = Array;
const has = hasOwnProperty.call.bind(hasOwnProperty);
const any = require("./any");


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
        partition(([, [computed]]) => computed, compiled);

    return Object.assign(compiled, { computed, uncomputed });
}

// field.declaration
//  field.declaration.direct
//  field.declaration.shorthand
//
// field.declaration { name, definition }
// property { name, definition: supplied }
// property { name, definition: computed }

const fromDeclaration = (function fromDeclaration()
{
    const fShorthandRegExp = /(?:^\(\[([^\]]+)\]\))|([^=\s]+)\s*=>/;
    const parseShorthand = f =>
        (([, computed, supplied]) => [!!computed, computed || supplied])
        (fShorthandRegExp.exec(f + ""));

    return function fromDeclaration(declaration)
    {
        const isShorthand = !is (field.declaration, declaration);
        const [computed, name, definition] = isShorthand ?
            [...parseShorthand(declaration), declaration([])] :
            [false, declaration.name,
                is (field.deferred, declaration) ?
                    declaration.λdefinition() :
                    declaration.definition];
        const compiled = is (field.definition, definition) ?
            fromDefinition(definition) :
            fromShorthandDefinition(computed, definition);

        return [name, compiled];
    }
})();

function fromDefinition(definition)
{
    const type = parameters(definition)[0];

    return is (field.definition.supplied, definition) ?
        toSuppliedIC(type, definition.fallback) :
        toComputedIC(type,
            definition.initializer,
            definition.dependencies);
}

function fromShorthandDefinition(computed, definition)
{
    const isTuple = isArray(definition);
    const type = isTuple ? definition[0] : definition;

    return  computed ?
            fromComputedShorthand(type, definition[1]) :
            toSuppliedIC(type, isTuple ?
                maybe(type).just({ value: definition[1] }) :
                maybe(type).nothing);
}

const fromComputedShorthand = (function ()
{
    const templateRegExp = require("./templated-regular-expression");
    const { objectRegExp, listRegExp } = templateRegExp(
    {
        name: /[^,\}\s\)]+/g,
        names: /${name}(?:\s*,\s*${name})*/,
        objectRegExp: /^\(\s*\{\s*${names}\s*\}\)/,
        listRegExp: /^\(?\s*(${names})\s*\)?/,
    });

    return function fromComputedShorthand(type, shorthand)
    {
        const fString = shorthand + "";
        const object = objectRegExp.exec(fString);
        const extracted = (object || listRegExp.exec(fString))[1];
        const dependencies = extracted.split(/\s*,\s*/);
        const deduped = Array.from(new Set(dependencies));
        const initializer = object ?
            values => [true, shorthand(values)] :
            values => [true, shorthand(...dependencies
                .map(name => values[name]))];

        return toComputedIC(type, initializer, dependencies);
    }
})();

function toSuppliedIC(type, fallback)
{
    const initializer = fallback === maybe(type).none ?
        (provided, name) =>
            [true, provided[name]] :
            [false, field.error.missing({ name })] :
        (provided, name) => has(provided, name) ?
            [true, provided[name]] :
            [true, fallback.value];

    return [false, typechecked(type, initializer), type, fallback];
}

function toComputedIC(type, initializer, dependencies)
{
    return [true, typechecked(type, initializer), type, initializer, dependencies];
}

function typechecked(expected, initializer)
{
    return (...args) => (([success, value]) =>
        return !success ? [success, value] :
        is (expected, value) ? [true, value] :
        [false, field.error.type({ expected, value })])
        (initializer(...args));
}

module.exports.fromCompiled = function ([name, [computed, initializer, type, ...rest]])
{
    const definitionT = field.definition(type);
    const definition = computed ?
        definitionT.computed({ initializer: rest[0], dependencies: rest[1] }) :
        definitionT.supplied({ fallback: rest[0] });

    return field(type)({ name, definition });
}

field.declaration.concretize = function concretize (declaration)
{
    if (is (field.declaration, declaration))
        return declaration;

    const [name, [computed, _, type, ...rest]] = fromDeclaration(declaration);
    const definitionT = field.definition(type);
    const definition = computed ?
        definitionT.computed({ initializer: rest[0], dependencies: rest[1] }) :
        definitionT.supplied({ fallback: rest[0] });

    return field.declaration({ name, definition });
}
