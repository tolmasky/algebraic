module.exports = string => new RegExp([...string]
    .map(character => `[${character.toLowerCase()}${character.toUpperCase()}]`)
    .join(""));