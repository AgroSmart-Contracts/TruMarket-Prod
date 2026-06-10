module.exports = {
  skipFiles: ['ERC20Mock.sol'],
  testfiles: ['./test/**/*.ts'],
  mocha: {
    timeout: 100000,
  },
};
