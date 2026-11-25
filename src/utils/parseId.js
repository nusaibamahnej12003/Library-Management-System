const { ValidationError } = require("./errors");

function parseId(value, resource) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ValidationError(`${resource} ID must be a positive integer.`);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    throw new ValidationError(`${resource} ID must be a positive 32-bit integer.`);
  }
  return id;
}

module.exports = parseId;
