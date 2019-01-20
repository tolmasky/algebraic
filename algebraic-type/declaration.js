const typenameStack = [];
const { defineProperty } = Object;
const fNamed = (name, f) =>
    (defineProperty(f, "name", { value: name }), f);

const { hasOwnProperty } = Object.prototype;
const types = Object.create(null);

const IsSymbol = Symbol("is");
const TypenameSymbol = Symbol("typename");
const UnscopedTypenameSymbol = Symbol("unscoped-typename");
const InspectSymbol = require("util").inspect.custom;
const SerializeSymbol = Symbol("serialize");
const DeserializeSymbol = Symbol("deserialize");
const KindSymbol = Symbol("kind");
const UUIDSymbol = Symbol("uuid");


function declaration(f)
{
    const kind = fNamed(f.name, function (...args)
    {
        const typename = toTypename(...args);

        typenameStack.push(typename);

        const scoped = typenameStack.join(".");
        const UUID = generateUUID(scoped, 2);
        return fNamed(`[declare ${scoped}]`, function (...args)
        {
            try
            {
                if (hasOwnProperty.call(types, UUID))
                    throw TypeError(`Duplicate Type Declaration for ${scoped}`);

                const type = types[UUID] = fNamed(scoped, function (...args)
                {
                    return create.apply(this, args);
                });

                type[TypenameSymbol] = scoped;
                type[UnscopedTypenameSymbol] = typename;
                type[InspectSymbol] = () => `[${f.name} ${scoped}]`;
                type[UUIDSymbol] = UUID;
                type.toString = () => `[${f.name} ${scoped}]`;

                const { is, create, serialize, deserialize } = f(type, args);

                type[IsSymbol] = is;
                type[SerializeSymbol] = serialize;
                type[DeserializeSymbol] = deserialize;
                type[KindSymbol] = kind;

                return type;
            }
            finally
            {
                typenameStack.pop();
            }
        });
    });

    return kind;
}

module.exports = declaration;

module.exports.declaration = declaration;

function toTypename(strings, ...args)
{
    const asTypename = object => !!object ? getTypename(object) : object;

    return args.reduce((typename, arg, index) =>
        typename + asTypename(arg) + strings[index + 1], strings[0]);
}

function declare({ is, create, typename, unscopedTypename, serialize, deserialize })
{
    const type = fNamed(typename, function (...args)
    {
        return create.apply(this, args);
    });

    type[UUIDSymbol] = generateUUID(typename, 2);
    type[TypenameSymbol] = typename;
    type[UnscopedTypenameSymbol] = unscopedTypename || typename;
    type[InspectSymbol] = () => `[javascript ${typename}]`;
    type[IsSymbol] = is;
    type[SerializeSymbol] = serialize;
    type[DeserializeSymbol] = deserialize;

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
        return fNamed(`[is ${getTypename(type)}]`, value => is(type, value));

    const definedIs = type[IsSymbol];
    const value = args[1];

    return definedIs ? definedIs(value) : value instanceof type;
}

module.exports.getSerialize = function getSerialize(type)
{
    return type[SerializeSymbol];
}

module.exports.getDeserialize = function getDeserialize(type)
{
    return type[DeserializeSymbol];
}

module.exports.getUUID = function (type)
{
    return type[UUIDSymbol];
}

module.exports.getTypeWithUUID = function (UUID)
{
    return types[UUID];
}

module.exports.getKind = function (type)
{
    return type[KindSymbol] || false;
}

module.exports.fNamed = fNamed;

const generateUUID = (function ()
{
    const ErrorRegExp = /(?:(?:^Error\n\s+)|(?:\n\s+))at\s+/;

    return function generateUUID(typename, index)
    {
        const { stackTraceLimit } = Error;
        Error.stackTraceLimit = index + 1;

        const frames = Error().stack.split("\n");

        Error.stackTraceLimit = stackTraceLimit;

        const frame = frames[frames.length - 1].replace(/^\s*at\s*/, "");
        const UUID = JSON.stringify({ typename, frame });

        return UUID;
    }
})();
