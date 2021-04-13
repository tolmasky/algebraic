const given = f => f();
const fail = require("./fail");
const { inspect } = require("util");

const f = require("./f-construct");
const { isTaggedCall, tagResolve } = require("./templating");
const { hasOwnProperty } = Object;
/*
const Default =
{
    None: Symbol("Default.None"),
    Value: f.constructible `Default.Value`
        (function (f, value) { this.value = value } ),
    Computed: f.constructible `Default.Computed`
        (function (f, computed) { this.computed = computed })
};

function AnnotatedType(operators, type, ...rest)
{
    const fallback = rest.length >= 1 ? rest[0] : Default.None;

    if (fallback instanceof Default.Value && !type.has(fallback.value))
        fail.type(`Cannot set ${fallback.value} for type ${type}`);

    return Object.assign(
        f.constructible `${type.name}`
            ((AT, ...arguments) => 
                isTaggedCall(arguments) ?
                    annotate(operators, AT, tagResolve(...arguments)) :
                    AT.type(...arguments),
            AnnotatedType.prototype),
        { type, fallback });
}

AnnotatedType.prototype[inspect.custom] = function (...args)
{
    return this.type[inspect.custom](...args);
}

module.exports = AnnotatedType;


*/
module.exports = function annotate(operators, C, annotations)
{
    if (!hasOwnProperty.call(operators, annotations))
        fail (`Type ${AT.type} does not support the ${annotations} operator.`);

    const operator = operators[annotations];

    return operator.length === 1 ?
        operator(C) :
        rhs => operator(C, rhs);
}

