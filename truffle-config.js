module.exports = {
  networks: {
    test: {
      total_accounts: 20,
      default_balance_ether: 10000,
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.12"
    }
  }
};
