const AnnotationsRegExp = /^\s*(\??)\s*(=|\s*\(\s*\)\*=)\s*?$/;
const Set = require("./set");
const f = require("./f-construct");
const { isTaggedCall, tagResolve } = require("./templating");
const given = f => f();


const range = length => Array.from({ length });
const parse = (Ai, annotations) => given((
    [, nulls, fallback = ""] = annotations.match(AnnotationsRegExp),
    nullabled = nulls ? Set.Union(Ai, Set.null) : Ai) =>
        fallback ?
            nullabled :
            nullabled);

const annotatable = (name, initialize = x => x) => 
    f.constructible `${name}` ((A, ...arguments) =>
        initialize(f (
            (instance, ...arguments) =>
                isTaggedCall(arguments) ?
                    parse(instance, tagResolve(...arguments)) :
                    (()=>{console.log(arguments); throw `OH No! ${arguments}`})(),
            A.prototype),
            ...arguments));

module.exports = annotatable;
