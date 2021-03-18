// SingleValue()
// Data = typefunction (name, fields) => blah;
// type_f `OVERRIDE_NAME` (blah)

// data `X` (() => fields) => (type_f X => data(fields))()

// name shoudl absolutely be an automatic parameter, that we
// just solve immediately.
// (x,y,z) ===> (name, z, y, z), X `name` is what does it.

// x = or `some_name` (a, b, c);
// should we fully expand EVERYTHING, to get as close to a 
// inSet() test as possible?
// F = T => G(T)
// G = T => T
// 
// F(number) + G(string) => 
// (F(number), F, G(number), G, number), G(string), G, string)
//
// only fully expand OCCUPIED (right-hand) type?
// F(number + string) => F(number + string), F, G(number + string), string, number + string
//
// F(number) => (F(number), F, G(number), G, number)


/*


        summands.has(candidate) ||
        summands.any(summand => satsifies(summand, candidate)) ||

        candidate instanceof Sum &&
        dig(candidate) subset of criterion

        summand.every());
);
*/

const fail = require("@algebraic/type/fail");
const given = f => f();
const fNamed = (name, f) => Object.defineProperty(f, "name", { value: name });
const fPrototyped = (prototype, name, f) =>
    fNamed(name, Object.setPrototypeOf(f, prototype));

const Type = { };
const Definition = Symbol("definition");

/*const tagged = given((
    { hasOwnProperty } = Object,
    { isArray } = Array,
    is = args => isArray(args[0]) && hasOwnProperty.call(args[0], "raw")) =>
        (args, f) => is(args) ? [name, f(args)] : ["<anonymous>", f(args)]);

Object.assign(f =>
    (...args) => tagged.is(args) ?
    (...more) => f(tagged.resolve(...args), tagged.resolveUUID(...args), ...more) :
    f(false, ...args),
    {
        is: args => Array.isArray(args[0]) && has(args[0], "raw"),
        resolve: (strings, ...args) =>
            args.reduce((string, arg, index) =>
                string + typenameIfType(arg) + strings[index + 1],
                strings[0]),
        resolveUUID: (strings, ...args) =>
            args.reduce((string, arg, index) =>
                string + UUIDIfType(arg) + strings[index + 1],
                strings[0])
    });

const isTemplateCall = args => Array.isArray(args[0])
*/

const isTaggedTemplateCall = given((
    { hasOwnProperty } = Object,
    { isArray } = Array) =>
        args => isArray(args[0]) && hasOwnProperty.call(args[0], "raw"));
const resolveTagArguments = (strings, ...args) =>
    args.reduce((string, argument, index) =>
        string + argument + strings[index + 1],
        strings[0]);

Type.Expression = function Expression (...args)
{
    if (!(this instanceof Expression))
        return (...rest) => new Expression(args[0][0], ...rest);

    const [name, initialize, satisfies, construct] = args;
    const E = fNamed(name, function (...args)
    {
        return  isTaggedTemplateCall(args) ?
                    (...nextArgs) => E(resolveTagArguments(...args), ...nextArgs) :
                this instanceof E ?
                    Object.defineProperty(
                        this,
                        Definition,
                        { value: { ...initialize(...(typeof args[0] === "string" ? args : [`<anonymous ${name}>`, ...args])), satisfies } }) :
                given((T = E.apply(fPrototyped(E.prototype, name, function (...args)
                {
                    return !construct ?
                        fail.type(`${name} is not a constructable type`) :
                        construct.call(this, T, args);
                }), args)) => fNamed(T[Definition].name/*args[0]*/, T));
    });
    Object.setPrototypeOf(E.prototype, Function.prototype);

    return E;
}

const satisfies = (criterion, candidate) =>
    criterion === candidate ||
    criterion[Definition].satisfies(criterion, candidate);

Type.Expression.Primitive = Type.Expression `Primitive` (
    name => ({ name }),
    () => false);

Type.Expression.Sum = Type.Expression `Sum` (
    (...undeduped) => given((
        summands = [...new Set(undeduped)],
        expandedSet = new Set([...summands]
            .flatMap(summand =>
                summand instanceof Type.Expression.Sum ?
                    [summand, ...summand[Definition].expanded] :
                    summand)),
        expanded = [...expandedSet]) =>
        ({ summands, expanded, expandedSet })),
    given((nonSumSatisfies = (criterion, candidate) =>
        given(({ expanded, expandedSet } = criterion[Definition]) =>
            expandedSet.has(candidate) ||
            expanded.any(summand => satisfies(summand, candidate)))) =>
        (criterion, candidate) =>
            candidate instanceof Type.Expression.Sum ?
                candidate[Definition]
                    .expanded
                    .every(candidate => nonSumSatisfies(criterion, candidate)) :
                nonSumSatisfies(criterion, candidate)));


Type.Expression.Function = Type.Expression `Function` (
    (name, implementation) => ({ name, implementation }),
    (criterion, candidate) => false,
    // Let's instead have Some(F)
    /*
        candidate instanceof Type.Expression.Invocation &&
        satisfies(criterion, candidate[Definition].function)*/
    (TF, args) => Type.Expression.Invocation(
        `${TF[Definition].name}(${args
            .map(T => T[Definition].name)
            .join(", ") })`, TF, args));

Type.Expression.Invocation = Type.Expression `Invocation` (
    (name, f, args) =>
    ({
        name,
        function: f,
        arguments: args,
        effective: (0, f[Definition].implementation)(...args)
    }),
    (criterion, candidate) =>
        candidate instanceof Type.Invocation &&
        given((
            lDefinition = criterion[Definition],
            rDefinition = candidate[Definition]) => 
            satisfies(lDefinition.function, rDefinition.function) &&
            lDefinition.args.length === rDefinition.args.length &&
            lDefinition.args.every((argument, index) =>
                satisfies(argument, rDefinition.arguments[index]))),
    (TI, args) => (0, TI[Definition].effective)(...args));

const EmptyArguments = Object.freeze(Object.create(null));
function toFields(definition)
{
    return definition.fields ?
        definition.fields :
        definition.fields = Object
            .entries(definition.fFields())
            .map(([key, value]) => [key, value]);
}

const toString = x => JSON.stringify(x, null, 2);
const typecheck = (owner, name, expected, value) =>
    `${owner} initializer passed value for field "${name}" of wrong ` +
    `type. Expected type ${expected} but got:\n\n` +
    `${value && toString(value)}\n`;

Type.Expression.Data = Type.Expression `Data` (
    (name, fFields) => ({ name, fFields }),
    (criterion, candidate) => false,
    function (T, args)
    {
        const values = args.length <= 0 ? EmptyArguments : args[0];
        const definition = T[Definition];

        return  values instanceof T ? values :
                !(this instanceof T) ? new T(...args) :
                Object.assign(
                    this,
                    Object.fromEntries(
                    toFields(T[Definition])
                        .map(([key, FieldT]) => given((
                            value = values[key]) =>
                            [
                                key,
                                type.satisfies(FieldT, values[key]) ?
                                    value :
                                    fail.type(typecheck(
                                        definition.name,
                                        key,
                                        type.name(FieldT),
                                        value))
                            ]))));
    });

const type = Object
    .fromEntries(
        ["null", "undefined", "number", "string", "boolean"]
            .map(name => [name, Type.Expression.Primitive(name)]));
     
type.number[Definition];
type.of = function (value)
{
    const JSType = value === null ? "null" : typeof value;

    return type[JSType] || Object.getPrototypeOf(value).constructor;
}

type.satisfies = function (T, value)
{//console.log(value, type.of(value), type.of(value)[Definition]);
    return satisfies(T, type.of(value));
}

type.name = T => T[Definition].name;

const primitives = Object.values(type);
const firstHalf = primitives.slice(0, 3);
const secondHalf = primitives.slice(3);

const Sum1 = Type.Expression.Sum(...firstHalf)
const Sum2 = Type.Expression.Sum(Sum1, ...secondHalf)

const Tree = Type.Expression.Function("Tree", T => Type.Expression.Data("<anonymous>", () => ({ data: T }))); 
const Tree2 = Type.Expression.Function("Tree", T => Tree(T));
const NumberTree = Tree2(type.number);

//
//console.log(type.name(type.number))
//console.log(Tree({ data: 5 }));
//Tree({ data: "5" });


//type.of(Tree({data: 5 }))
//[Definition]
//Sum2[Definition].expanded;//.map(x => x.__proto__.constructor.name)

//NumberTree({ data: 5 })

const ConcreteNumberTree = Type.Expression.Data("Tree(number)", () => ({ data: type.number/*, left: Tree, right: Tree*/ }));

ConcreteNumberTree({ data: 5 });

[NumberTree, NumberTree({ data: 5 })]