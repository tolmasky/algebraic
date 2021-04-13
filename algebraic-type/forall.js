const { IObject, IArray } = require("./intrinsics");
const toCache = require("./cache");
const private = require("./private");
const fail = require("./fail");

module.exports = function forall(name, ...rest)
{
    if (rest.length === 0)
        return (...rest) => forall(name, ...rest);

    const [fDefinition] = rest;
    const variables = IArray
        .from(fDefinition, (_, index) => VariableExpression.Reference(index));
    const vDefinition = fDefinition(...variables);
    const vT = data (name, vDefinition)

    const TF = {};
    const of = (...Ts) =>
    {console.log(Ts);
        const hasVariableExpression = Ts.some(VariableExpression.has);
console.log(hasVariableExpression);
        return hasVariableExpression ?
            VariableExpression.Of({ callee: TF, arguments: Ts }) :
            data
                `${name}(${Ts.map(T => T.name).join(", ")})`
                ((console.log(fDefinition(...Ts)),fDefinition(...Ts)));
    };
    const thisExpression = of (...variables);

    const cache = toCache();
    const constructors = private(vT, "constructors");

    console.log(thisExpression);/*
    console.log(IObject.fromEntries(
            IObject
                .entries(constructors)
                .map(([name, C]) =>
                    [name, toInferencingConstructor(C)])));*/

    return IObject.assignNonenumerable(
        TF,
        IObject.fromEntries(
            IObject
                .entries(constructors)
                .map(([name, C]) =>
                    [name, toInferencingConstructor(C, of, thisExpression)])),
        { of: (...args) => cache(args, () => of(...args)) });

    return TF;
}

// Note: we need to be able to figure out EVERY variable from a consructor, or it won't work.

function toInferencingConstructor(C, fT, thisExpression)
{   
    const { hasPositionalFields } = C;
    
    
    return function (...args)
    {
        // FIXME: Cache
        console.log(C);
        const fieldExpressions = C
            .fieldDefinitions
            .map(([name, f]) => [name, f()])
            .filter(([name, f]) => VariableExpression.has(f));

        const usedReferences = indexes(fieldExpressions.map(([, expression]) => expression));

        if (usedReferences.size < indexes([thisExpression]).size)
            fail(
                `constructor "${C.name}" does not make use of enough ` +
                `type variables to use as an inference constructor.`);
console.log(usedReferences.size, indexes([thisExpression]).size);
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
        console.log("INFERRED: ", inferred);
        
            //.reduce(([name, argument])
console.log(fT);
console.log(C.name);

        return fT(...inferred)[C.name](...args);
    }
}


function infer(expressions, inferred, [name, T])
{
    const expression = expressions[name];
    
}



function infer(inferred, expression, T)
{
    return expression.caseof
    ({
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

const data = require("./data");
const { caseof } = data;
const { type } = require("./type");

const VariableExpression = data `VariableExpression`
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
        .filter(VariableExpression.has)
        .flatMap(expression => expression.caseof(
        {
            Reference: index => index,
            Of: ({ arguments }) => [...indexes(arguments)]
        })));

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
