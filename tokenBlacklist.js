const blacklistedTokens = [];

function add(token) {
  blacklistedTokens.push(token);
}

function has(token) {
  return blacklistedTokens.includes(token);
}

module.exports = {
  add,
  has,
};
