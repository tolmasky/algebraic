const { Predicated, string, integer } = require("./set");

// https://tc39.es/ecma262/#sec-touint32
const ToUint32 = value => value >>> 0;

exports.Uint32 = Predicated
({
    name: "ECMA.Uint32",
    subsetof: integer.nonnegative,
    predicate: value => ToUint32(value) === value
});

const MAX_UINT32 = -1 >>> 0;
const ToString = value => value + "";

// https://tc39.es/ecma262/#sec-array-exotic-objects
// A String property name P is an array index if and only if
// ToString(ToUint32(P)) equals P and ToUint32(P) is not the same value as
// 𝔽(2^32 - 1).
const isArrayIndex = x => ToUint32(x) !== MAX_UINT32 && ToString(ToUint32(x)) === x;

/*
function isArrayIndex(value)
{
    const Uint32Value = ToUint32(value);

    return Uint32Value !== MAX_UINT32 && ToString(value) === value;
}*/

exports.ArrayIndex = Predicated
({
    name: "ECMA.ArrayIndex",
    subsetof: string,
    predicate: isArrayIndex
});
