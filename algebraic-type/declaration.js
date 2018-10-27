const typenameStack = [];
const { defineProperty } = Object;
const fNamed = (name, f) =>
    (defineProperty(f, "name", { value: name }), f);

const { hasOwnProperty } = Object.prototype;

const IsSymbol = Symbol("is");
const TypenameSymbol = Symbol("typename");
const UnscopedTypenameSymbol = Symbol("unscoped-typename");
const InspectSymbol = require("util").inspect.custom;


function declaration(f)
{
    return fNamed(f.name, function ([typename])
    {
        typenameStack.push(typename);
        const scoped = typenameStack.join(".");

        return fNamed(`[declare ${scoped}]`, function (...args)
        {
            const type = fNamed(scoped, function (...args)
            {
                return create.apply(this, args);
            });

            type[TypenameSymbol] = scoped;
            type[UnscopedTypenameSymbol] = typename;
            type[InspectSymbol] = () => `[${f.name} ${scoped}]`;

            const { is, create } = f(type, args);

            type[IsSymbol] = is;

            typenameStack.pop();

            return type;
        });
    });
}

module.exports = declaration;

module.exports.declaration = declaration;

function declare({ is, create, typename, unscopedTypename })
{
    const type = fNamed(typename, function (...args)
    {
        return create.apply(this, args);
    });

    type[TypenameSymbol] = typename;
    type[UnscopedTypenameSymbol] = unscopedTypename || typename;
    type[InspectSymbol] = () => `[javascript ${typename}]`;
    type[IsSymbol] = is;

    return type;
}

module.exports.declare = declare;

function getTypename(type)
{
    return hasOwnProperty.call(type, TypenameSymbol) ?
        type[TypenameSymbol] : type.name;
};

module.exports.getTypename = getTypename;

function getUnscopedTypename(type)
{
    return hasOwnProperty.call(type, UnscopedTypenameSymbol) ?
        type[UnscopedTypenameSymbol] : type.name;
}

module.exports.getUnscopedTypename = getUnscopedTypename;

module.exports.is = function is(...args)
{
    const type = args[0];

    if (args.length === 1)
        return fNamed(`[is ${getTypename(type)}]`, value => is(args[0], value));

    const definedIs = type[IsSymbol];
    const value = args[1];

    return definedIs ? definedIs(value) : value instanceof args[0];
}

module.exports.fNamed = fNamed;
