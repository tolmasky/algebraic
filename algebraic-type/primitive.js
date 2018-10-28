const { declaration, getTypename, fNamed } = require("./declaration");


const primitive = declaration(function primitive(type)
{
    const typename = getTypename(type);
    const is = fNamed(`[is ${typename}]`, value => typeof value === typename);
    const create = function ()
    {
        throw TypeError(`${typename} is not a constructor`);
    }

    return { is, create };
});

exports.boolean = primitive `boolean` ();
exports.number = primitive `number` ();
exports.string = primitive `string` ();
exports.regexp = primitive `regexp` ();
exports.ftype = primitive `function` ();
