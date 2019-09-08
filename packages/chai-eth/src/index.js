/* eslint-disable func-names, no-else-return, no-param-reassign */
const BigNumber = require("bignumber.js");

module.exports = (chai, _utils) => {
  // see https://twitter.com/nicksdjohnson/status/1132394932361023488
  const convert = (value) => {
    let number;

    if (typeof value === "string" || typeof value === "number") {
      number = new BigNumber(value);
    } else if (BigNumber.isBigNumber(value)) {
      number = value;
    } else {
      new chai.Assertion(value).assert(false, `expected ${value} to be an instance of string, number or BigNumber`);
    }

    return number;
  };

  /**
   * Tolerate a larger set of values instead of just one. In real life, it can take up to 14 seconds
   * for a block to be broadcast on the Ethereum network, so we have to account for this. Note that we
   * make two assumptions:
   *
   * 1. The payment rate is 1 token/ second, which is true for all tests in this repo.
   * 2. By default, the token has 18 decimals
   */
  chai.Assertion.addMethod("tolerateTheBlockTimeVariation", function(
    expected,
    scale = new BigNumber(1e18),
    addTheBlockTimeAverage = true,
  ) {
    const actual = convert(this._obj);
    expected = convert(expected);
    scale = convert(scale);

    const blockTimeAverage = new BigNumber(14).multipliedBy(scale);
    if (addTheBlockTimeAverage) {
      const expectedCeiling = actual.plus(blockTimeAverage);

      return this.assert(
        expected.isGreaterThanOrEqualTo(actual) && expected.isLessThanOrEqualTo(expectedCeiling),
        `expected ${expected.toString()} to be >= than ${actual.toString()} and <= ${expectedCeiling.toString()}`,
      );
    } else {
      const expectedFloor = actual.minus(blockTimeAverage);

      return this.assert(
        expected.isLessThanOrEqualTo(actual) && expected.isGreaterThanOrEqualTo(expectedFloor),
        `expected ${expected.toString()} to be <= than ${actual.toString()} and >= ${expectedFloor.toString()}`,
      );
    }
  });
};
