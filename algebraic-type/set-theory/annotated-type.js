const given = f => f();
const fail = require("./fail");

const f = require("./f-construct");
const { isTaggedCall, tagResolve } = require("./templating");

const AnnotationsRegExp = /^\s*(\??)\s*(?:(=|\s*\(\s*\)\*=)\s*)?$/;
const annotate = (AT, annotations) => given((
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

function AnnotatedType(type, ...rest)
{
    const fallback = rest.length >= 1 ? rest[0] : Default.None;

    if (fallback instanceof Default.Value && !type.has(fallback.value))
        fail.type(`Cannot set ${fallback.value} for type ${type}`);

    return Object.assign(
        f.constructible `${type.name}`
            ((AT, ...arguments) => 
                isTaggedCall(arguments) ?
                    annotate(AT, tagResolve(...arguments)) :
                    (()=>{ fail(`undefined... for ${AT.name}`) }),
            AnnotatedType.prototype),
        { type, fallback });
}

module.exports = AnnotatedType;
