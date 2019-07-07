const { is } = require("./declaration");

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
const field = (function ()
{
    const union = require("./union");
    const { parameterized } = require("./parameterized");
    const { data } = require("./data");
    const { ftype, string } = require("./primitive");
    const field = parameterized(T => 
    {
        const fieldT = data `data.field <${T}>` (
            name    => string,
            init    => [fieldT.init, fieldT.init.none] );
    
        fieldT.init = union `data.field <${T}>.init` (
            data `none` (),
            data `default` ( value => T ),
            data `compute` (
                initializer     => ftype,
                dependencies    => Array ) );
    
        return fieldT;
    });

    field.declaration = data `field.declaration` (
        name    => string,
        λfield  => ftype );

    return field;
})();

const fromShorthandDeclaration = (function ()
{
    const fNameRegExp = /(?:^\(\[([^\]]+)\]\))|([^=\s]+)\s*=>/;

    return f =>
        (([, compute, set]) =>
            ({ compute: !!compute, name: compute || set }))
        (fNameRegExp.exec(f + ""));
})();



module.exports = field;

// Our internal "compiled" representation is an array with the following
// elements:
//
// [0] string - This is the name of the field.
// [1] any - This is the type of the field.
// [2] 0 | 1 | 2 - These correspond to whether it is a non, default or compute.
// [3] any -> T - This is the generated initializer.
// [4] nullable<data.field> - This is present if the user manually gives us one.
const has = hasOwnProperty.call.bind(hasOwnProperty);
const fail = require("./fail");

const toRequiredField = (typename, name, type) =>
    [0, name, type, toRequiredInitializer(typename, name, type)];
const toRequiredInitializer = (typename, name, type) =>
    provided => has(provided, name) ? provided[name] : 
        fail.type(`${typename} constructor requires field "${name}"`);

const toDefaultField = (typename, name, type, value) =>
    [1, name, type, toDefaultInitializer(name, type, value)];
const toDefaultInitializer = (name, type, value) => Object.assign(
    provided => has(provided, name) ? provided[name] : value,
    { value })

const toComputedField = (typename, name, [type, shorthand]) =>
    [2, name, type, fromShorthandCompute(shorthand)];
const fromShorthandCompute = (function ()
{
    const  templateRegExp = require("./templated-regular-expression");
    const regexps = templateRegExp(
    {
        name: /[^,\}\s\)]+/g,
        names: /${name}(?:\s*,\s*${name})*/,
        object: /^\(\s*\{\s*${names}\s*\}\)/,
        list: /^\(?\s*(${names})\s*\)?/,
    });

    return function fromShorthandCompute(shorthand)
    {
        const fString = shorthand + "";
        const object = regexps.object.exec(fString);
        const destructured = !!object;
        const extracted = destructured ?
            object[1] : regexps.list.exec(fString)[1];
        const dependencies = extracted.split(/\s*,\s*/);
        const deduped = Array.from(new Set(dependencies));
        const initializer = destructured ?
            values => shorthand(values) :
            values => shorthand(...dependencies.map(name => values[name]));
        const initProperties = { dependencies, initializer };

        return Object.assign(initializer, initProperties);
    }
})();

const fromArrowFunction = (function ()
{
    const { isArray } = Array;
    const fNameRegExp = /(?:^\(\[([^\]]+)\]\))|([^=\s]+)\s*=>/;
    const toUncomputedField = (typename, name, definition) =>
        isArray(definition) ?
            toDefaultField(typename, name, ...definition) :
            toRequiredField(typename, name, definition);

    return function fromArrowFunction(typename, f)
    {
        const [, compute, set] = fNameRegExp.exec(f + "");
        const toField = (set ? toUncomputedField : toComputedField);
        const name = set || compute;

        return toField(typename, name, f([]));
    }
})();

const fromManualDeclaration = (function ()
{
    const { parameterized } = require("./parameterized");
    const toInitEnum = init =>
        is(init, field.init.none) ? 0 :
        is(init, field.init.default) ? 1 : 2;
    const toComputeWrap = f => Object.assign(x => f.initializer(x), f);

    return function fromManualDeclaration(typename, decalaration)
    {
        const instantiated = decalaration.λfield();
        const type = parameterized.parameters(instantiated)[0];
        const { name, init } = instantiated;
        const initEnum =
            is(field(type).init.none, init) ? 0 :
            is(field(type).init.default, init) ? 1 : 2;
        const common = [typename, name, type];

        return  initEnum === 0 ? toRequiredField(...common) :
                initEnum === 1 ? toDefaultField(...common, init.value) :
                /*initEnum === 2 ?*/
                [2, name, type, toComputeWrap(init)];
    }
})();

const fromFieldDeclaration = (function ()
{
    const { getTypename, is } = require("./declaration");
    const typecheck = require("./typecheck");
    const mismatch = (typename, name) => (type, value) =>
        `${typename} constructor passed value for field "${name}" of wrong ` +
        `type. Expected type ${getTypename(type)} but got ` +
        `${JSON.stringify(value)}.`;

    return function fromFieldDeclaration(typename, declaration)
    {
        const shorthand = !is(field.declaration, declaration);
        const compile = shorthand ? fromArrowFunction : fromManualDeclaration;
        const [initEnum, name, type, initializer] =
            compile(typename, declaration);
        const typechecked = Object.assign(
            typecheck.function(type, mismatch(typename, name), initializer),
            initializer);

        return [initEnum, name, type, typechecked];
    }
})();

module.exports.compile = function (typename, fieldDeclarations)
{
    const partition = require("@climb/partition");
    const compiled = fieldDeclarations.map(
        fieldDeclaration =>
            fromFieldDeclaration(typename, fieldDeclaration));
    const [computed, uncomputed] = partition(
        ([initEnum]) => initEnum === 2,
        compiled);

    return Object.assign(compiled, { computed, uncomputed });
}

module.exports.fromCompiled = function ([initEnum, name, type, initializer])
{
    const fieldT = field(type);
    const init =
        initEnum === 0 ? fieldT.init.none :
        initEnum === 1 ? fieldT.init.default(initializer) :
        /*initEnum === 2 ? */
        fieldT.init.compute(initializer)

    return fieldT({ name, init });
}

field.declaration.concretize = function concretize (declaration)
{
    if (is(field.declaration, declaration))
        return declaration;

    const { compute, name } = fromShorthandDeclaration(declaration);
    const λfield = () => field.fromCompiled(fromFieldDeclaration("", declaration));

    return field.declaration({ name, λfield });
}


// Users can supply:
// field.declaration || shorthand
// We can only use field, but have to store it as compiled
// So, (field.declaration || shorthand) => lazy[compiled]
// (field.declaration || shorthand) => field.declaration
// 













