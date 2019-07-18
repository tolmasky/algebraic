const clamp = value => Math.max(0.0, Math.min(1.0, value));

module.exports = divisor => string => clamp(parseFloat(string) / divisor);
