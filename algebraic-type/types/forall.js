const { IObject, IArray } = require("../intrinsics");
const toCache = require("../cache");
const private = require("../private");
const fail = require("../fail");

const { constructible } = require("../function-define");
const { type, caseof, definition, has } = require ("../type");

const VariableExpression = type `VariableExpression`
([
    caseof `Reference`  (of => type.number),
    caseof `Of`    (
    {
        callee      :of => type.object,
        arguments   :of => type.object/*List.of(VariableExpression)*/
    })
]);

const indexes = expressions => new Set(
    expressions
        .filter(has(VariableExpression))
        .flatMap(expression => caseof(expression,
        {
            Reference: index => index,
            Of: ({ arguments }) => [...indexes(arguments)]
        })));

const hasVariableExpression = Ts =>
    Ts.some(T => has(VariableExpression, T));


module.exports = function forall(name, ...rest)
{
    if (rest.length === 0)
        return (...rest) => forall(name, ...rest);

    const [fBody] = rest;
    const variables = IArray
        .from(fBody, (_, index) =>
            VariableExpression.Reference(index));
    const faT = type (name, fBody(...variables));

    const TF = {};
    const apply = (...Ts) =>
        hasVariableExpression(Ts) ?
            VariableExpression.Of({ callee: TF, arguments: Ts }) :
            type
                `${name}(${Ts.map(T => T.name).join(", ")})`
                (fBody(...Ts));

    const thisExpression = apply (...variables);

    const cache = toCache();
    const cachedApply = (...args) => cache(args, () => apply(...args));
    const { constructors } = definition(faT);
    const inferencingConstructors = IObject
        .entries(constructors)
        .map(([name, C]) =>
            [name, toInferencingConstructor(C, cachedApply, thisExpression)]);


    return constructible (name, () => { fail ("need the thing!"); },
    (T, property) =>
    [
        property (
        {
            name: "of",
            value: cachedApply
        }),
        ...IObject
            .entries(constructors)
            .map(([name, C]) => property
            ({
                name,
                enumerable: true,
                value: toInferencingConstructor(C, cachedApply, thisExpression)
            }))
    ]);
}

// Note: we need to be able to figure out EVERY variable from a consructor, or it won't work.

function toInferencingConstructor(C, fT, thisExpression)
{
    const { fieldDefinitions, hasPositionalFields } = definition(C);

    return function (...args)
    {
        // FIXME: Cache
//        console.log(C);
        const fieldExpressions = fieldDefinitions
            .map(([name, f]) => [name, f()])
            .filter(([name, f]) => has(VariableExpression, f));

        const usedReferences = indexes(fieldExpressions.map(([, expression]) => expression));

        if (usedReferences.size < indexes([thisExpression]).size)
            fail(
                `constructor "${C.name}" does not make use of enough ` +
                `type variables to use as an inference constructor.`);
// console.log(usedReferences.size, indexes([thisExpression]).size);
        const CTs = IObject
            .entries(hasPositionalFields ? args : args[0])
            .map(([name, argument]) => [name, type.of(argument)])

        const reconstituted = IObject
            .fromEntries(fieldExpressions);

        const inferred = IObject.assign(
            [],
            CTs.reduce((inferred, [name, T]) =>
                infer(inferred, reconstituted[name], T),
                {}));

        // It appears broken that we can pass in a 2 arg case with one arg...
//        console.log("INFERRED: ", inferred);

            //.reduce(([name, argument])
// console.log(fT);
// console.log(C.name);

        return fT(...inferred)[C.name](...args);
    }
}


function infer(expressions, inferred, [name, T])
{
    const expression = expressions[name];
}



function infer(inferred, expression, T)
{
    return caseof(expression,
    {
        Reference: index =>
            IObject.has(index, inferred) ?
                inferred[index] !== T ?
                    fail (
                        `Conflicting types for ${index} type variable: `+
                        `${inferred[index].name} and ${T.name}`)  :
                    inferred :
            { [index]: T, ...inferred },
        Of: () => inferred
    });
}

/*

function getVariableExpressions()
{
    return IObject.fromEntries(
        private(T, "fieldDefinitions");
            .map(([name, f]) => [name, f()])
            .filter(([name, f]) => isVariableExpression(f)));
}*/



/*
const indexes = expression =>
    expression.caseof(
    {
        Reference: index => new Set([index]),
        Of: ({ arguments }) => new Set(
            arguments
                .filter(VariableExpression.has)
                .flatMap(expression => indexes(expression)))
    });
*/
/*
function infer(constructor, fields, values)
{
    fields.
        type => infer(values[name])

    const types = reduce(values)

    return T.of(...types)[constructor](values);
}*/
