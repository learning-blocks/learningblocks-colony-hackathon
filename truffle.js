require("dotenv").config();

const HDWalletProvider = require("truffle-hdwallet-provider");
const infura_apikey = process.env.INFURA_APIKEY;
const mnemonic = process.env.MNEMONIC;

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          `https://ropsten.infura.io/${infura_apikey}`
        );
      },
      network_id: "3"
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/${infura_apikey}`
        );
      },
      network_id: "*"
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};
