const { create, hasOwnProperty } = Object;
const given = f => f();

const targets = new WeakMap();
const set = (map, key, fValue, value = fValue()) =>
    (map.set(key, value), value)
const getset = (map, key, fValue) =>
    map.has(key) ? map.get(key) : set(map, key, fValue);


module.exports = (target, key, fValue) => given((
    values = getset(targets, target, () => create(null)),
    exists = hasOwnProperty.call(values, key)) =>
        exists ?
            values[key] :
            values[key] = fValue());
