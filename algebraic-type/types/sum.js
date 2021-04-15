const { IObject } = require("../intrinsics");
const { setPrototypeOf } = IObject;
const { isTaggedCall, tagResolve } = require("../templating");

const { inspect } = require("util");
const inspectSymbol = inspect.custom;

const private = require("../private");
const fail = require("../fail");
const DIS = require("@algebraic/dense-int-set");

const { f, constructible } = require("../function-define");
const ConstructorDeclaration = require("../constructor-definition");

const onPrototype = { caseof, [inspectSymbol]: inspectSum };


function Sum(name, body)
{
    const constructors = body
        .map(({ name, body }) => toConstructorDeclaration(name, body));
    return { name, onPrototype, constructorDeclarations: constructors };
/*
    const T = Constructible(name, false, definitions);

    const constructors = private(T, "constructors");
    const CIDs = IObject
        .fromEntries(IObject
            .keys(constructors)
            .map((name, index) => [name, index]));

    // This can be different than initializers.length if two or more have the
    // same name. Maybe we should fail earlier in that case though?
    const count = IObject.keys(CIDs).length;
    const EveryCID = [(1 << count) - 1];

    private(T, "CIDs", () => CIDs);
    private(T, "EveryCID", () => EveryCID);

    T.prototype.caseof = caseof;
    T.prototype[inspectSymbol] = inspectSum;

    return T;*/
}

module.exports = Sum;

Sum.Sum = Sum;

Sum.isSumBody = declaration =>
{
    console.log(declaration);
    console.log(declaration.every(item => item instanceof SumCaseOf));
    
    return declaration.every(item => item instanceof SumCaseOf);
}
const SumCaseOf = constructible ("caseof",
    (caseof, ...arguments) =>
        isTaggedCall(arguments) ?
            toCaseOf(f (
                tagResolve(...arguments),
                ({ name }, ...body) =>
                    toCaseOf({ name }, body))) :
    
        arguments.length === 1 &&
        arguments[0] instanceof type ?
            toCaseOf(
                { name: arguments[0].name },
                arguments.map(T => of => T)) :
    
        arguments.length >= 2 ?
            toCaseOf(
                { name: arguments[0] },
                arguments.slice(1)) :
    
        fail ("No. (Unnamed caseof not allowed)."));

Sum.caseof = SumCaseOf;

SumCaseOfPrototype = Sum.caseof.prototype;

const toCaseOf = (target, body = []) =>
    IObject.setPrototypeOf(
        IObject.assign(target, { body }),
        SumCaseOfPrototype);

function toConstructorDeclaration(name, fieldDeclarations)
{
    const innerT =
        fieldDeclarations.length === 1 &&
        typeof fieldDeclarations[0] === "object" ?
            require("./data")(name, fieldDeclarations[0]) :
            false;

    return ConstructorDeclaration(
        name,
        innerT ?
            [of => innerT] :
            fieldDeclarations,
        innerT ?
            (T, C, [first, ...rest]) => [false, [innerT(first), ...rest]] :
            false,
        initialize);
}

/*
    const singleton =
        definition.isUnaryConstructor &&
        IObject.freeze(IObject.create(T.prototype));
*/

function initialize(constructor, processed)
{
    const values = IObject.assign([], processed);

    return [false, { constructor, values }];
}

function caseof(cases)
{
    const T = type.of(this);
    const CIDs = private(T, "CIDs");
    const EveryCID = private(T, "EveryCID");

    const hasDefault = IObject.has("default", cases);
    const present = IObject
        .keys(cases)
        .reduce((set, name) =>
            name === "default" ? set :
            IObject.has(name, CIDs) ? DIS.add(CIDs[name], set) :
            fail.type (
                `${T.name}.caseof call has non-constructor case ${name}.`),
            DIS.Empty);

    if (!hasDefault && !DIS.equals(present, EveryCID))
    {
        const names = Object.keys(private(T, "constructors"));
        const missing = DIS
            .toArray(DIS.subtract(EveryCID, present))
            .map(CID => names[CID]);

        fail(
            `${T.name}.match call is missing cases for ` +
            `${list(missing)}, or use default.`);
    }

    const target = private(this, "constructor").name;
    const handler = cases[target] || cases.default;

    return handler(...private(this, "values"));
}

function list(items)
{
    const count = items.length;

    return  count === 1 ? items[0] :
            count === 2 ? items.join(" and ") :
            items
                .map((item, index) =>
                    `${index === count - 1 ? "and " : ""} ${item}`)
                .join(", ");
}

function inspectSum (depth, options)
{
    if (depth < -1)
        return "{ … }";

    const T = type.of(this);
    const nextDepth = options.depth === null ? null : options.depth - 1;
    const inner = value => inspect(value, { ...options, depth: nextDepth });
    const Tname = T.name;
    const constructor = private(this, "constructor");
    const Cname = constructor.name;

    const fullyQualified = Tname === Cname ? `${Tname}*` : `${T.name}.${Cname}`;
    const values = constructor.isUnaryConstructor ?
        "" :
        ` { ${private(this, "values").map(inner).join(", ")} }`;

    // FIXME: if autogenerated inner type...
    // Or maybe just use * when its ONE item with the same name...
    return `${fullyQualified}${values}`;
};
