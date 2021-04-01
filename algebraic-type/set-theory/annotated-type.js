const given = f => f();
const fail = require("./fail");
const { inspect } = require("util");

const f = require("./f-construct");
const { isTaggedCall, tagResolve } = require("./templating");
const { hasOwnProperty } = Object;

const AnnotationsRegExp = /^\s*(\??)\s*(?:(=|\s*\(\s*\)\*=)\s*)?$/;
const annotate_ = (AT, annotations) => given((
    [, nulls, fallbacks = ""] = annotations.match(AnnotationsRegExp),
    type = nulls ? Set.Union(AT.type, Set.null) : AT.type) =>
        fallbacks ? 
            fallback => new AnnotatedType(type, new Default.Value(fallback)) :
            new AnnotatedType(type, new Default.Value(null)));

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

function annotate(operators, AT, annotations)
{
    if (!hasOwnProperty.call(operators, annotations))
        fail (`Type ${AT.type} does not support the ${annotations} operator.`);

    const operator = operators[annotations];

    return operator.length === 1 ?
        operator(AT.type) :
        rhs => operator(AT.type, rhs.type);
}
