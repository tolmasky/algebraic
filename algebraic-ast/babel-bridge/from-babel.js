const { isArray } = Array;
const { fromEntries } = Object;

const { array, is, parameterized, data, type, nullable } = require("@algebraic/type");
const union = require("@algebraic/type/union-new");
const fail = require("@algebraic/type/fail");
const { parameters } = parameterized;
const given = f => f();


const Node = require("../node");
const { toDefaultTranslation, ...mappings } = require("./migrations");
const specifications = mappings;

const toPredicatedTranslate = (TargetT, fields, predicate) =>
    (translate, keyPath, value) =>
        predicate(translate, keyPath, value) &&
        TargetT(fromEntries(
            fields.map(([toKey, from, FieldTN, isOptional]) =>
            [
                toKey,
                !isArray(from) ?
                    translate(FieldTN, [keyPath, from], value[from]) :
                isOptional && from.every(key => value[key] === void(0)) ?
                    null :
                    translate(FieldTN, keyPath, value)
            ])));

const toSpecificationTranslate = (TargetT, specifications) => given((
    fields = data
        .fields(TargetT)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]])
        .map(([name, FieldT]) => [name, FieldT, type.name(FieldT)])) =>
[
    fields.map(([, FieldT]) => FieldT),
    toOrderedChoice(specifications
        .map(specification => toPredicatedTranslate(
            TargetT,
            fields.map(([name, FieldT, FieldTN]) =>
            [
                name,
                specification.fields[name] || name,
                FieldTN,
                is(nullable, FieldTN)
            ]),
            toSpecificationPredicate(specification))),
        TargetT)
]);

const toSpecificationPredicate = ({ pattern, type: T }) =>
    given((
        predicates = Object.entries(pattern)) =>
        (translate, keyPath, value) =>
            !is (T, value) ?
                translate.fail(T, keyPath, value) :
            predicates
                .some(([name, expected]) =>
                    value[name] !== expected) ?
                // FIXME: This should throw for the individual field?
                translate.fail(T, keyPath, value) :
            true);

const attempt = f =>
({ catch: recover =>
    (...args) =>
    {
        try { return f(...args) }
        catch (error) { return recover(error, ...args); }
    } });

const toOrderedChoice = (candidates, ExpectedT) =>
    candidates.length <= 1 ?
        candidates[0] :
        given((recoverable = candidates
            .map(f =>
                attempt((...args) => [true, f(...args)])
                .catch((error, translate, keyPath) =>
                    error.keyPath !== keyPath ?
                        translate.fail(error) :
                        [false]))
            .concat((translate, ...rest) =>
                translate.fail(ExpectedT, ...rest))) =>
        (...args) => findMap(f => f(...args), recoverable)[1]);


const toDataTranslate = TargetT => given((
    TargetTN = type.name(TargetT)) =>
    toSpecificationTranslate(
        TargetT,
        specifications[TargetTN] || [toDefaultTranslation(TargetTN)]));

const toPrimitiveTranslate = T => 
[
    [],
    T === type.null ?
        (translate, keyPath, value) =>
            value === null || value === void(0) ?
                null :
                translate.fail(T, keyPath, value) :
        (translate, keyPath, value) =>
            is (T, value) ? value : translate.fail(T, keyPath, value)
];

const toTranlsateUnion = UnionT => given((
    Ts = union.components(UnionT)) =>
[
    Ts,
    toOrderedChoice(Ts
        .map(T => type.name(T))
        .map(TN => (translate, ...rest) => translate(TN, ...rest)),
        UnionT)
]);

const toToTranslate = T =>
    type.kind(T) === type.primitive ? toPrimitiveTranslate :
    type.kind(T) === type.array ? toArrayTranslate :
    type.kind(T) === data ? toDataTranslate :
    type.kind(T) === union ? toTranlsateUnion :
    false;   

const toTranslate = T => (
    type.kind(T) === type.primitive ? toPrimitiveTranslate :
    //parameterized.is(Node, T) ? toNodeTranslate :
    type.kind(T) === array ? toArrayTranslate :
    type.kind(T) === data ? toDataTranslate :
    type.kind(T) === union ? toTranlsateUnion :
    (console.error("wasn't expecting " + T), T => [[]]))(T);

//console.log(mappings["DefaultedAssignmentTarget"][0]);

//console.log(mappings["DefaultedAssignmentTarget"]);





const toKeyPath = path => !path || path.length <= 0 ?
    "" :
    `${path[0].length ? `${toKeyPath(path[0])}.` : ""}${path[1]}`;
const BabelTypeName = type => `[BabelNode ${type}]`;
const toExpectationString = expectation =>
    typeof expectation === "function" ?
        `type ${type.name(expectation)}` :
    expectation + "";

translate.fail = (...args) => 
    fail(args.length === 1 ?
        args[0] :
        given((
            [expected, keyPath, value] = args) =>
        Object
            .assign(Object
            .defineProperty(Error(), "message",
            {
                get: () => (console.log(expected),
                    `Expected ${toExpectationString(expected)} at ` +
                    `\`${toKeyPath(keyPath)}\`, but found: ` +
                        (!value || typeof value !== "object" ?
                            value :
                        typeof value.type === "string" ?
                            BabelTypeName(value.type) :
                        JSON.stringify(value)))
            }),
            { expected, keyPath, value })));

const findMap = (f, array) =>
    given((result = [false]) =>
        (array.find(item => (result = f(item))[0]), result));

const toTranslateEntries = (Ts, visited = Ts) =>
    Ts.size <= 0 ? [] : given((
    results = Array.from(Ts, T => [type.name(T), toTranslate(T)]),
    discovered = new Set(results
        .flatMap(([, [Ts]]) => Ts)
        .filter(T => !visited.has(T)))) =>
            results
                .map(([name, [, translate]]) => [name, translate])
                .concat(toTranslateEntries(
                    discovered,
                    Array
                        .from(discovered)
                        .reduce((visited, T) =>
                            visited.add(T), visited))));

const isRestValue = item =>
    item &&
    item.type &&
    item.type.startsWith("Rest");
const toArrayTranslate = ArrayT => given((
    ItemT = parameterized.parameters(ArrayT)[0],
    ItemTypename = type.name(ItemT)) =>
[
    [ItemT],
    (translate, keyPath, value) =>
        !Array.isArray(value) ?
            translate.fail(ArrayT, keyPath, value) :
            (isRestValue(value[value.length - 1]) ?
                value.slice(0, -1) :
                value).map((item, index) =>
                    translate(ItemTypename, [index, keyPath], item))
]);



const translates = fromEntries(toTranslateEntries(new Set(Object
    .values(Node)
    .concat(require("../source-location"))
    .filter(toToTranslate))));

console.log(translates);

function translate(TN, keyPath, value)
{
    console.log("BEING ASKED TO TRANSLATE TO " + TN + " " , toKeyPath(keyPath), value);
console.log(translates[TN] + "");
    return translates[TN](translate, keyPath, value);
}

console.log("hey", translates);

/*
console.log(specifications[type.name(Node.DefaultedAssignmentTarget)]);
console.log("--->", toDataTranslate(Node.DefaultedAssignmentTarget));

console.log("--->",
    toDataTranslate(Node.DefaultedAssignmentTarget)(translate, [[], "top"], { type:"AssignmentPattern" }));

console.log("--->", toDataTranslate(Node.WhileStatement));
*/

const { program } = require("@babel/core").parse("5+5");

const fromBabel = (TargetT, node) => translate(type.name(TargetT), [[], "top"], node);
 
 
console.log(fromBabel(Node.Module, program));
/*
        .filter(([name, FieldT]) =>
            mappings[name] || 
            type.kind(FieldT) !== type.primitive)
        .map(([name, FieldT]) =>
        [
            name,
            fromEntries(
                customized[TargetTN]
                    .map(from => [from.pattern.type, from.fields])),
            type.name(FieldT),
            FieldT
        ]));
*/



/*


const findMapWhile = given(
    NotFound = Symbol()) =>
    (f, array, sentinel) =>
{
    var result;

    array.find(item => (result = f(item)) !== sentinel);

    return [found, result];
}

const findMap = given((
    NotFound = Symbol()) =>
    (f, accum, array) =>
        array.reduce(
            (accum, item) => item === accum ? f(item) : item,
            accum);
    
    
    (f, array) => array.reduce(NotFound, array)


            fields.map(([toKey, from, FieldTN]) =>
                [
                    toKey,
                    isArray(from) ?
                        translate(FieldTN, keyPath, value) :
                        translate(FieldTN, value : value[from])
                ]))))


            ({
        ...value,
        sourceData: toSourceData(value),
        ...fromEntries(fields
            .map(([toKey, fromKey, typename]) =>
            [
                toKey,
                maps[typename](
                    maps,
                    [fromKey, path],
                    value[fromKey])
            ]))
    });
                
            fieldMappings.map()
{
    
}




const toInferredUnion = (TargetT, candidates) =>
    fields = data
        .fields(TargetT)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]]),
    TargetTN = type.name(TargetT),
    candidatesTN = candidates[TargetTN]) =>
    candidatesTN || [toDefaultTranslation(TargetTN)]
        ({ pattern, fields: fieldRemappings })
        
  
const toMapNodeFields
    (maps, path, value) =>
    ({
        ...value,
        sourceData: toSourceData(value),
        ...fromEntries(fields
            .map(([toKey, fromKey, typename]) =>
            [
                toKey,
                maps[typename](
                    maps,
                    [fromKey, path],
                    value[fromKey])
            ]))
    });
  
const toMapData = TargetT => given((
    typename = type.name(TargetT),
    fields = toFieldMappings(NodeT),
    mapNodeFields = toMapNodeFields(fields)) =>
    [
        fields.map(([, , , T]) => T),
        Object.assign((maps, path, value) =>
            !value || value.type !== typename ?
                failToMap({ path, expected: NodeT, value }) :
                TargetT(mapNodeFields(maps, path, value)),
            { fields: mapNodeFields })
    ]);
        




// Don't forget explicitly transferred fields
const toFieldMappings = (TargetT, translations) => given((
    fields = data
        .fields(TargetT)
        .filter(field =>
            is (data.field.definition.supplied, field.definition))
        .map(field => [field.name, parameters(field)[0]]),
    TargetTN = type.name(TargetT),
    translationsTN = translations[TargetTN]) =>
        fromEntries((translationsTN || [toDefaultTranslation(TargetTN)])
            .map(({ pattern, fields: fieldRemappings }) =>
            [
                pattern.type,
                fields
                    .filter(([name, FieldT]) =>
                        fieldRemappings[name] ||
                        type.kind(FieldT) !== type.primitive)
                    .map(([name, FieldT]) =>
                    [
                        name,
                        fieldRemappings[name] || name,
                        type.name(FieldT),
                        FieldT
                    ])
            ])));
  


const Success = value =>
    [true, alue];
const Failure = (ExpectedT, keyPath, value) =>
    [false, ({ ExpectedT, keyPath, value })];

CallM ([name], receiver) => { or: onError => onError(error) }

, then, orElse) => 
    


*/