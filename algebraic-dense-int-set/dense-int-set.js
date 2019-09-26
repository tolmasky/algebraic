const unfold = require("@climb/unfold");
const until = require("@climb/until");

const { floor, log2, ceil } = Math;
const Base = 32;
const inSlot = number => 1 << (number % Base);
const toSlot = (number, f) => f(floor(number / Base));
const ordered = (lhs, rhs, f) =>
    lhs.length < rhs.length ? f(lhs, rhs) : f(rhs, lhs);

const split = (start, number, leftmost = floor(log2(number))) =>
    [start + leftmost, number - (1 << leftmost)];
const Full = Math.pow(2, 32) - 1;

const DenseIntSet =
{
    Empty: [],

    isEmpty: set => set.length === 0,

    equals: (lhs, rhs) =>
        lhs.length === rhs.length &&
        lhs.every((slot, index) => slot === rhs[index]),

    inclusive: (number, length = ceil(number / Base)) =>
        Array.from({ length }, (_, slot) => slot < length - 1 ?
            Full :
            (1 << (number % Base)) - 1),

    has: (number, set) => toSlot(number, slot =>
        slot < set.length && !!(set[slot] & inSlot(number))),

    just: number => toSlot(number, slot =>
        Array.from({ length: slot + 1 },
            (_, index) => index === slot ? inSlot(number) : 0)),

    add: (number, set) => DenseIntSet.union(DenseIntSet.just(number), set),
    remove: (number, set) => DenseIntSet.subtract(set, DenseIntSet.just(number)),

    union: (lhs, rhs) => ordered(lhs, rhs,
        (shorter, longer) => longer.map((value, index) =>
            index < shorter.length ?
            value | shorter[index] : value)),

    intersects: (lhs, rhs) => ordered(lhs, rhs, (shorter, longer) =>
        lhs.reduce((intersects, slot, index) =>
            intersects || !!(slot | rhs[index]),
            false)),

    intersection: (lhs, rhs) => ordered(lhs, rhs, (shorter, longer) =>
        compress(shorter.map((value, index) => value & longer[index]))),

    subtract: (lhs, rhs) =>
        lhs.length === 0 ? lhs :
        rhs.length === 0 ? lhs :
        compress(lhs.map((lhsValue, slot) => lhsValue & ~rhs[slot])),

    isSubsetOf: (superset, subset) =>
        subset.length === 0 ? true :
        superset.length < subset.length ? false :
        subset.every((piece, slot) => (piece & superset[slot]) === piece),

    from: iterable => iterable.reduce((set, number) =>
        DenseIntSet.union(set, DenseIntSet.just(number)),
        DenseIntSet.Empty),

    toArray: set => set.reduce((flattened, value, index) =>
        unfold(number =>
            number !== 0 && split(index * Base, number),
            value,
            flattened),
        []),

    reduce: (f, start, set) =>
        set.reduce((accum, piece, index) => until(
            ([accum, piece]) => piece === 0,
            ([accum, piece]) =>
                (([number, piece]) => [f(accum, number), piece])
                (split(index * Base, piece)),
            [accum, piece])[0],
            start),

    first: function (set)
    {
        const found = set.findIndex(piece => piece > 0);
        const piece = set[found];
        const inSlot = Math.log2(piece & -piece);
        const number = found * Base + inSlot;

        return [number, DenseIntSet.subtract(set, DenseIntSet.just(number))];
    }
};

function compress(uncompressed)
{
    const shift = uncompressed.length - 1;
    const index = shift - uncompressed
        .findIndex((_, index) => uncompressed[shift - index] !== 0);

    return  index === uncompressed.length ? [] :
            index < uncompressed.length ? uncompressed.slice(0, index + 1) : [];
}

module.exports = DenseIntSet;
