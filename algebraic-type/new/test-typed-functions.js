const toString = Ts => `(${Ts.slice(0, Ts.length - 1).map(T => T.name).join(", ")}) -> ${Ts[Ts.length - 1].name}`;
const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));
const given = f => f();

const populate = f => Array.from(f, () => []);
const [extract, collect] = (function ()
{
    let stack = null;
    const done = { };
    const types = function (f)
    {
        const types = [];
        stack = { types, length: f.length, next: stack };

        try { f(...populate(f)); }
        catch (error) { if (error !== done) throw error };
    
        stack = stack.next;

        return types;
    }
    const collect = function * ()
    {
        stack.types.push(this);

        if (stack.types.length === stack.length)
            throw done;
    };

    return [types, collect];
})();


const type = function type(name)
{
    return Object.assign(
        fNamed(name, function() { }),
        { [Symbol.iterator]: collect });
};

Object.assign(type,
Object.fromEntries(
    ["string", "number", "object", "null", "undefined"]
        .map(name => [name, type(name)])));


type.of = value =>
    type[value === null ? "null" : typeof value] ||
    Object.getPrototypeOf(value).constructor;

const fail = message => { throw Error(message) };
type.satisfies = (criterion, candidate) =>
    criterion === type.of(candidate);

const typed= ([name]) => function (f)
{
    const types = extract(f);
    const argumentTs = types.slice(0, types.length - 1);
    const returnT = types[types.length - 1];
    //const FT = fPrototyped(typed, f.name, )

    // Use  Function.call(null, { f.length } to maintain length...
    return Object.assign(fPrototyped(typed, name, function (...args)
    {
        const result = f.apply(this, types.map((argumentT, index) =>
            index === argumentTs.length ?
                [[]] :
            type.satisfies(argumentT, args[index]) ?
                [[args[index]]] :
                fail (`Expected value of type ${types[index].name} for ` +
                    `argument ${index} of ${name}, but instead found: ` +
                    type.of(args[index]).name)));

        // FIXME: check return type.
        return result;
    }), { argumentTs, returnT, signature: `(${argumentTs.map(T => T.name).join(", ")}) -> ${returnT.name}` });
}

const f = typed `f` (([[name] = type.string], [[fields] = type.object], [[returning] = type.number]) => 5);

f.signature