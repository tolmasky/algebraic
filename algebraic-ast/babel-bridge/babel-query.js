const fromEntries = require("@climb/from-entries");

const BabelTypes = require("@babel/types").TYPES;
const { QuerySet, Query } = require("./object-query");


// Rememebr: Make QUeyr()()(() possible, that way all of these just start as Query({ type }), then no need to do any of this other stuff with args and whatnot

exports.Babel = fromEntries(BabelTypes
    .map(type => [type, Query/*.object*/({ pattern: { type } })]));

exports.Node = QuerySet;

/*
    [
        type,
        (...args) => typeof args[0] === "object" ?
            Query({ type, ...args[0] }, ...args.slice(1)) :
            Query({ type }, ...args)
     ]));

*/