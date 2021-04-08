const { IObject } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const constructible = require("./constructible");
const f = require("./function-define");

const private = require("./private");
const Field = require("./field");
const fail = require("./fail");
const DIS = require("@algebraic/dense-int-set");


const case_ = f `case` ((f, name, initializers = []) =>
    (...arguments) =>
        isTaggedCall(arguments) ?
            (...definitions) =>
                sum(name, initializers.concat(
                    toSumInitializer(tagResolve(...arguments), definitions))) :
        arguments.length === 1 &&
        arguments[0] instanceof type ?
            sum(name, initializers.concat(
                toSumInitiailizer(
                    arguments[0].name,
                    arguments.map(T => of => T)))) :
        fail("NO."));

module.exports = case_;

function sum(name, initializers)
{
    const T = IObject.assignNonenumerable(
        constructible(name, initializers),
        { case: case_(name, initializers) });

    const CIDs = IObject
        .fromEntries(
            initializers
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

function toSumInitializer(name, definitions, preprocess = false)
{
    if (definitions.length === 1 && typeof definitions[0] === "object")
    {
        const innerT = product(name, definitions[0]);

        return toSumInitializer(
            name,
            [innerT],
            ([first, ...rest]) => [innerT(first), ...rest]);
    }
    
    // FIXME: Defer?
    // Defer for recursive?...
    const fields = definitions.map(f => new Field(f()));

    return f (name, function (f, T, instantiate, arguments)
    {
        const values = preprocess ? proprocess(arguments) : arguments;

        fields.map((field, index) => field.extract(T, index, arguments));

        const instance = instantiate(T);

        private(instance, "constructor", () => f);
        private(instance, "values", () => values);
    
        return instance;
    });
}

// FIXME, This may be faster with bitsets, just loop each one and | together...
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

