const { declaration, getTypename, fNamed } = require("./declaration");


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

exports.boolean = primitive `boolean` (
    [value => value ? 1 : 0, true],
    serialized => !!serialized );

const specials = { n: NaN, z: -0, s: -Infinity, b: Infinity };

exports.number = primitive `number` (
    [value =>
        // NaN
        value !== value ? "n" :
        // -0
        value === 0 && 1 / value === -Infinity ? "z" :
        // -Infinity
        value === -Infinity ? "s" :
        // Infinity
        value === Infinity ? "b" : value, true],
    serialized => specials[serialized] || serialized );

exports.string = primitive `string` (
    [value => value, false],
    serialized => serialized);

exports.regexp = primitive `regexp` (
    [value => [value.source,
        (value.global ? "g" : "") +
        (value.multiline ? "m" : "") +
        (value.ignoreCase ? "i" : "") +
        (value.sticky ? "y" : "") +
        (value.unicode ? "u" : "")], false],
    serialized => RegExp(...serialized));

exports.ftype = primitive `function` (
    [value => { throw TypeError("Cannot serialize function") }, false],
    serialized => { throw TypeError("Cannot deserialize function") } );
