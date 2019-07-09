const { declaration, declare, getTypename, fNamed } = require("./declaration");


const primitive = declaration(function primitive(type, [serialize, deserialize])
{
    const typename = getTypename(type);
    const is = fNamed(`[is ${typename}]`, value => typeof value === typename);
    const create = function ()
    {
        throw TypeError(`${typename} is not a constructor`);
    }

    return { is, create, serialize, deserialize };
});

const specials = { n: NaN, z: -0, s: -Infinity, b: Infinity };

const primitives =
{
    boolean: primitive `boolean` (
        [value => value ? 1 : 0, true],
        serialized => !!serialized ),

    number: primitive `number` (
        [value =>
            // NaN
            value !== value ? "n" :
            // -0
            value === 0 && 1 / value === -Infinity ? "z" :
            // -Infinity
            value === -Infinity ? "s" :
            // Infinity
            value === Infinity ? "b" : value, true],
        serialized => specials[serialized] || serialized ),

    string: primitive `string` (
        [value => value, false],
        serialized => serialized),

    regexp: primitive `regexp` (
        [value => [value.source,
            (value.global ? "g" : "") +
            (value.multiline ? "m" : "") +
            (value.ignoreCase ? "i" : "") +
            (value.sticky ? "y" : "") +
            (value.unicode ? "u" : "")], false],
        serialized => RegExp(...serialized)),

    ftype: primitive `function` (
        [value => { throw TypeError("Cannot serialize function") }, false],
        serialized => { throw TypeError("Cannot deserialize function") } ),

    tnull: declare(
    {
        typename: "[primitive null]",
        is: fNamed("[is null]", value => value === null),
    }),

    tundefined: declare(
    {
        typename: "[primitive undefined]",
        is: fNamed("[is undefined]", value => value === void(0))
    }),

    object: primitive `object` (
        [JSON.stringify, true],
        JSON.parse)
//    λ: parameterized (...Ts => primitives.ftype)
}

if (global.URL)
{
    URL.prototype.equals = function (rhs)
    {
        return this === rhs || this.hashCode() === rhs.hashCode();
    }

    URL.prototype.hashCode = function ()
    {
        return this.href;
    }
}

primitives.primitive = primitive;
primitives.primitives = primitives;

module.exports = primitives;
