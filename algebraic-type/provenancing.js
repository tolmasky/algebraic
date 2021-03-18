const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const ProvenanceProperty = "Provenance" // Symbol("Provenance");
const IsProvenancing = "IsProvenancing";
const { hasOwnProperty } = Object;
const unenumerableAssign = (target, values) => Object
    .entries(values)
    .reduce((target, [name, value]) =>
        Object.defineProperty(target, name, { value }),
        target);

function Provenance(f, args, parent)
{
    this.function = f;
    this.arguments = args;
    this.classes = new WeakMap();
    this.parent = parent || false;
}

const FIXME_constructor = prototype => prototype && prototype.constructor;

const given = f => f();
const cached = given((
    set = (map, key, fValue, value = fValue()) => (map.set(key, value), value)) =>
    (map, key, miss) => map.has(key) ?
        map.get(key) :
        set(map, key, miss));

Provenance.prototype.prototypefor = function (prototype)
{
    return cached(
        this.classes,
        constructor,
        () => fNamed(
            this.function.name,
            class extends FIXME_constructor(prototype) { }))
            .prototype;
}

function provenanced (value, toProvenance)
{
    const [copied, duplicate] = 
        typeof value === "function" && value[IsProvenancing] ?
            [true, (console.log("here... " + value.name+""),provenancing(value))] :
            copy(value);

    if (!copied)
        return value;
    
    const provenance = toProvenance(value[ProvenanceProperty]);
    const prototype = provenance.prototypefor(Object.getPrototypeOf(value));
    
    // FIXME: Ugh
    if (typeof duplicate === "function")
        fNamed(provenance.function.toAppliedName(provenance.function, provenance.arguments), duplicate);
    /*    fNamed(provenance.function === alias ?
            provenance.arguments[0] :
            toAppliedName(provenance), duplicate);
*/
    return Object.defineProperty(
            Object.setPrototypeOf(duplicate, prototype),
            ProvenanceProperty,
            { value: provenance, enumerable: false });
}

const isType = f => typeof f === "function";
const defaultToAppliedName = (f, arguments) =>
    `${f.name}(${arguments
    .map(argument =>
        isType(argument) ?
            argument.name || (argument + "") :
            JSON.stringify(argument)).join(", ")})`;

function provenancing (f, toAppliedName = defaultToAppliedName)
{
    return unenumerableAssign(copy.function(f, function (fProvenancing, args)
    {
/*        const result = f(...args);
        const resultIsProvenancing = typeof f === "function" && result[IsProvenancing];
        const provenancingResult = resultIsProvenancing ? provenancing(result) : result;
*/          
        return provenanced(f(...args), parent => new Provenance(fProvenancing, args, parent));
    }), { [IsProvenancing]: true, toAppliedName });
}


const copy = (value) =>
    !value ? [false, value] :
    typeof value === "object" ? [true, copy.object(value)] :
    typeof value === "function" ? [true, copy.function(value)] :
    [false, value];

copy.object = object => ({ ...object });
copy.function = function (f, fInternal = (fCopy, args) => f(...args))
{
    // We could just do something like (...arguments) => f(...arguments), but
    // we want to maintain as much of the original properties of the function
    // as possible, specifically things like f.length. As such, we have to do
    // all this `eval` run-around to keep the same argument count.
    //
    // The rest parameter doesn't count towards the function.length, so it is
    // safe to just append one unconditionally to the end, which conveniently
    // helps us in the case where there are default parameters and length === 0
    // as well.
    const length = f.length + 1;
    const parameters = Array.from(
        { length },
        (_, index) => `${index === length - 1 ? "..." : ""}p${index}`).join(", ");
    const fCopy = Object.assign(fNamed(
        f.name/* + "copy"*/,
        Function("f", `return function (${parameters}) { return f(${parameters}) }`)
        (function (...args) { return fInternal(fCopy, args) })), {/*copyof:f,*/...f});

    return fCopy;
}

// if return type is provenancing, then make it equivaent to having said provenancing((...args) => T(...args))
// "provenancing autowrap".

const alias = provenancing((name, T) => T, (_, [name]) => name);

module.exports = provenancing;

