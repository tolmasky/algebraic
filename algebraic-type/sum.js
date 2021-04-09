const { IObject } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");

const f = require("./function-define");

const private = require("./private");
const Field = require("./field");
const fail = require("./fail");
const DIS = require("@algebraic/dense-int-set");

const Constructible = require("./constructible");
const ConstructorDefinition = require("./constructor-definition");


function sum(name, definitions)
{
    const T = Constructible(name, false, definitions);

    const constructors = private(T, "constructors");
    const CIDs = IObject
        .fromEntries(IObject
            .entries(constructors)
            .map(({ name }, index) => [name, index]));

    // This can be different than initializers.length if two or more have the
    // same name. Maybe we should fail earlier in that case though?
    const count = IObject.keys(CIDs).length;
    const EveryCID = [(1 << count) - 1];

    private(T, "CIDs", () => CIDs);
    private(T, "EveryCID", () => EveryCID);

    T.prototype.caseof = caseof;

    return T;
}

module.exports = sum;

sum.caseof = (...arguments) =>
    isTaggedCall(arguments) ?
        (...fieldDeclarations) =>
            toConstructorDefinition(
                tagResolve(...arguments),
                fieldDeclarations) :

    arguments.length === 1 &&
    arguments[0] instanceof type ?
        toConstructorDefinition(
            arguments[0].name,
            arguments.map(T => of => T)) :

    fail ("No. (Unnamed caseof not allowed).");

function toConstructorDefinition(name, fieldDeclarations)
{
    const innerT =
        fieldDeclarations.length === 1 &&
        typeof fieldDeclarations[0] === "object" ?
            data(name, fieldDeclarations[0]) :
            false;

    return ConstructorDefinition(
        name,
        innerT ?
            [of => innerT] :
            fieldDeclarations,
        innerT ?
            ([first, ...rest]) => [false, [innerT(first), ...rest]] :
            false,
        initialize);
}

function initialize(constructor, processed)
{
    const values = IObject.assign([], processed);

    return [{ constructor, values }];
}

// FIXME, This may be faster with bitsets, just loop each one and | together...
const caseof = function caseof(cases)
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
            fail(
                `${T.name}.match call has non-constructor case ` +
                `"${present.find(name => !necessarySet.has(name))}".`),
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

const type = require("./type");

