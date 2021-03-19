const { parse } = require("@babel/core");
//Δ
const type = require("@algebraic/type");
const given = f => f();

const to = Symbol("to");
const setting = Symbol("setting");
const casting = Symbol("casting");
const toObject = Symbol("toObject");
const { toPrimitive } = Symbol;

const Empty = Object.freeze({});

const toReferencedNames = ({ type, ...expression }) =>
    type === "Identifier" ?
        [expression.name] :
    type === "MemberExpression" ?
        toReferencedNames(expression.object) :
    type === "SpreadElement" ?
        toReferencedNames(expression.argument) :
    type === "ObjectExpression" ?
        expression.properties.flatMap(toReferencedNames) :
    type === "ObjectProperty" ?
        toReferencedNames(expression.value) :
        [];

const FieldSetting = type `FieldSetting`
({
    dependencies    :of =>  type.array(type.string),
    compute         :of =>  Function
});

const FieldCasting = type `FieldCasting`
({
    TargetT         :of =>  type
});

const toFieldCasting = f =>
    FieldCasting({ TargetT: f() });

const toFieldSetting = (f, body) => given((
    dependencies = toReferencedNames(body)) =>
    FieldSetting(
    {
        dependencies,
        compute: new Function(
        `return ({${dependencies.join(", ")}}) => `+
        `(${(f + "").substring(body.start, body.end)})`)()
    }));

const fParseAssignment = (receiver, toFieldTranslation, f) => given((
    fString = f + "",
    { body, params } = parse(fString).program.body[0].expression,
    name = params[0].name) =>
        ({ ...receiver, [name]: toFieldTranslation(f, body) }));

const toProxy = (get, apply) => new Proxy(function(){},
{
    apply: (_, __, args) => apply(args[0]),
    get: (_, key) => get(key)
});

const WrappingTranslation = type `WrappingTranslation`
({
    entries             :of =>  type.array(type.object)
});

const ValueTranslation = type `ValueTranslation`
({
    type                :of =>  type,
    pattern             :of =>  type.object `=` (Empty),
    keyPath             :of =>  type.array(type.string) `=` ([]),
    fieldSettings       :of =>  type.object `=` (Empty),
    fieldCastings       :of =>  type.object `=` (Empty)
});

const toValueTranslationProxy = valueTranslation => toProxy(
    key =>
        key === setting ? f =>
            toValueTranslationProxy(
                valueTranslation.Δ(fieldSettings =>
                    fParseAssignment(fieldSettings, toFieldSetting, f))) :
        key === casting ? f =>
            toValueTranslationProxy(
                valueTranslation.Δ(fieldCastings =>
                    fParseAssignment(fieldCastings, toFieldCasting, f))) :
        key === toPrimitive ?
            () => BitMask.to(valueTranslation):
        key === toObject || key === "toObject" ?
            valueTranslation :
        toValueTranslationProxy(
            valueTranslation.Δ(keyPath => keyPath.concat(key))),
    newPattern =>
        toValueTranslationProxy(
            valueTranslation.Δ(pattern => ({ ...pattern, ...newPattern }))));

const BitMask = given((
    bitMasks = new Map(),
    to = translation => bitMasks.has(translation) ?
        bitMasks
            .get(translation) :
        bitMasks
            .set(translation, 1 << bitMasks.size)
            .get(translation),
    from = unioned =>
    [
        [...bitMasks.entries()]
            .map(([translation, mask]) =>
                (mask & unioned) && translation)
            .filter(translation => !!translation),
        bitMasks.clear()
    ][0]) => ({ from, to }));

function ValueTranslationSet()
{
    const translations = Object.create(null) ;

    return new Proxy({},
    {
        set: (translations, key, value) =>
            translations[key] =
                value && typeof value === "object" ?
                    [WrappingTranslation({ entries: Object.entries(value) })] :
                typeof value === "number" ?
                    BitMask
                        .from(value)
                        .map(translation => translation) :
                    [value[toObject]],
        get: (translations, key) => translations[key],
        ownKeys: translations => Object.keys(translations)
    });
}

module.exports = 
{
    toObject,
    setting,
    casting,
    FieldSetting,
    Set: ValueTranslationSet,
    JS:
    {
        is: T => toValueTranslationProxy(ValueTranslation({ type: T })),

        ...Object.fromEntries(
        ["object", "null", "undefined", "boolean", "number", "string"]
            .map(typename =>
            [
                typename,
                toValueTranslationProxy(
                    ValueTranslation({ type: type[typename] }))
            ]))
    }
}
