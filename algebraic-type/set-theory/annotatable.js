const AnnotationsRegExp = /^(\??)(=|\(\)=)?$/;
const Set = require("./set");
const f = require("./f-construct");
const { isTaggedCall, tagResolve } = require("./templating");
const given = f => f();


const range = length => Array.from({ length });
const parse = (Ai, annotations) => given((
    [, nulls, fallback = ""] = annotations.match(AnnotationsRegExp),
    nullabled = Set.Union(Ai, Set.null)) =>
        fallback ?
            nullabled :
            nullabled);

const annotatable = (name, initialize = x => x) => 
    f.constructible `${name}` ((A, ...arguments) =>
        initialize(f (
            (instance, ...arguments2) =>
                isTaggedCall(arguments2) ?
                    parse(instance, tagResolve(...arguments2)) :
                    (()=>{console.log(arguments2); throw `OH No! ${arguments2}`})(),
            A.prototype),
            ...arguments));

module.exports = annotatable;
