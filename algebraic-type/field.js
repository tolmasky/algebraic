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
    const { is } = require("./declaration");
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
            data `compute` ( compute => ftype ) );
    
        return fieldT;
    });
    field.declare = data `field.declare` ( create => ftype );

    return field;
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
const toDefaultInitializer = (name, type, value) =>
    provided => has(provided, name) ? provided[name] : value;

const toComputedField = (typename, name, [type, definition]) =>
    [2, name, type, toComputeInitializer(typename, definition)];
const toComputeInitializer = (function ()
{
    const  templateRegExp = require("./templated-regular-expression");
    const regexps = templateRegExp(
    {
        name: /[^,\}\s\)]+/g,
        names: /${name}(?:\s*,\s*${name})*/,
        object: /^\(\s*\{\s*${names}\s*\}\)/,
        list: /^\(?\s*(${names})\s*\)?/,
    });

    return function toComputeInitializer(typename, declaration)
    {
        const fString = declaration + "";
        const object = regexps.object.exec(fString);
        const extracted = object ? object[1] : regexps.list.exec(fString)[1];
        const dependencies = extracted.split(/\s*,\s*/);
        const deduped = Array.from(new Set(dependencies));
        const initializer = !!object ?
            values => declaration(values) :
            values => declaration(...dependencies.map(name => values[name]));
        const original = declaration;

        return Object.assign(initializer, { original, dependencies });
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
    const { is } = require("./declaration");
    const { parameterized } = require("./parameterized");
    const toInitEnum = init =>
        is(init, field.init.none) ? 0 :
        is(init, field.init.default) ? 1 : 2;

    return function fromManualDeclaration(typename, declare)
    {
        const dataField = declare.create();
        const { name, init } = dataField;
        const type = parameterized.parameters(dataField)[0];
        const initEnum =
            is(field(type).init.none, init) ? 0 :
            is(field(type).init.default, init) ? 1 : 2;
        const common = [typename, name, type];
    
        return  initEnum === 0 ? toRequiredField(...common) :
                initEnum === 1 ? toDefaultField(...common, init.value) :
                /*initEnum === 2 ?*/
                toComputedField(typename, name, [type, init.compute]);
    }
})();

const fromFieldDeclaration = (function ()
{
    const { getTypename, is } = require("./declaration");
    const typecheck = require("./typecheck");
    const mismatch = (typename, name) => (type, value) =>
        `${typename} constructor passed value for field "${name}" of wrong ` +
        `type. Expected type ${getTypename(type)} but got ${value}.`;

    return function fromFieldDeclaration(typename, declaration)
    {
        const manual = is (field.declare, declaration);
        const compile = manual ? fromManualDeclaration : fromArrowFunction;
        const [initEnum, name, type, initializer] =
            compile(typename, declaration);
        const typechecked =
            typecheck.function(type, mismatch(typename, name), initializer);

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
