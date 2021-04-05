const { IArray, IObject } = require("./intrinsics");
const { inspect } = require("util");
const { isTaggedCall, tagResolve } = require("./templating");

const Instantiate = { };
const private = require("./private");
const f = require("./function-define");
const given = f => f();
const fail = require("./fail");
const Field = require("./field");


module.exports = function sum(name, constructors = [])
{
    const T = f.constructible(name, function (T, constructor, args)
    {
        private(this, "constructor", () => constructor);
        private(this, "values", () => args);

        return this;
        /*if (has_default_constructor) ||
            can_infer?
            return;
        
        Instantiate

        field_check(args)

        private(this, "values", () => args);

        this.innerThingy = x;
        
        return this;
        const values = hasPositionalFields ? args : args[0];

        return  values instanceof T ? values :
                values === Instantiate ? this :
                IObject.freeze(IObject.assign(
                    hasPositionalFields ?
                        IObject.setPrototypeOf([], T.prototype) :
                    this instanceof T ?
                        this :
                        new T(Instantiate),
                    IObject.fromEntries(fields(T)
                        .map(initialize(
                            T,
                            values || UseFallbackForEveryField)))));*/
    },
    type.prototype);
    
    T.prototype[inspect.custom] = function ()
    {
        const fullyQualified = T.name + "." + private(this, "constructor").name;

        return `${fullyQualified} { ${private(this, "values")} }`;
    };
console.log(constructors);
    IObject.assign(T, IObject.fromEntries(constructors));

    T.case = (...arguments) =>
        isTaggedCall(arguments) ?
            (...definitions) =>
                sum(name,
                [
                    ...constructors,
                    toConstructor(tagResolve(...arguments), definitions)
                ]):
            fail("NO.");

    return T;
}

function toConstructor(name, definitions)
{
    // FIXME: Defer?
    const fields = definitions.map(f => new Field(f()));
    const C = f.constructible (name, function (f, ...values)
    {
        const T = this;

        fields.map((field, index) => field.extract(T, index, values));

        return new T(f, values);
    });

    return [name, C];
}

const type = require("./type");


/*
    private(T, "constructors", constructors);

    IObject.assign(T, constructors
        .map( => [constructor.name, () => { type_check(); set; });
    .map(T => [T.name, T])), 

    this.constructors = 



Sum
    Name -> args []
    

const Arguments = product();
const Constructor = product("Constructor", { name: type.string, arguments: type });

function Constructor()
{
}

const type = require("./type");
const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));


module.exports = (...types) => ({ construct, types });

function construct(T, instantiate, { types }, value)
{
    const match = types.find(T => type.belongs(T, value));

    if (!match)
        throw Error(`${value} didn't match internal ` +
                    `type: ${types.map(T => T.name).join(", ")}`);

    return fPrototyped(T.prototype, `${type.typename(T)}:${type.typename(match)}`, () => value);
}

function sum(name, definition)
{
    
}


Expression = sum(of => A, of => B, of => C);


data: {}
tuple: []
function(???): 

type `tuple` ([of => A, of => B, of => C])

type `A` (of => A | B | C )

*/