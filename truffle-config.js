module.exports = {
  networks: {
    test: {
      total_accounts: 20,
      default_balance_ether: 10000
    },
    loc_development_development: {
      network_id: "*",
      port: 8545,
      host: "127.0.0.1"
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.12"
    }
  }
};
