/*const colonyData = require("./../../colony.json");

const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { TrufflepigLoader } = require("@colony/colony-js-contract-loader-http");

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider("http://localhost:8545/");

exports.getSkillCount = async () => {
  // Get the private key from the first account from the ganache-accounts
  // through trufflepig
  const { privateKey } = await loader.getAccount(0);
  const wallet = new Wallet(privateKey, provider);
  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({
    loader,
    provider,
    wallet
  });

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();

  // Get our colonoy
  const colonyClient = await networkClient.getColonyClientByAddress(
    colonyData.colonyAddress
  );
  return await networkClient.getSkillCount.call();
};

exports.getTasks = async () => {};

*/

const colonyData = require("./../../colony.json");
const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { TrufflepigLoader } = require("@colony/colony-js-contract-loader-http");

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");

var ColonyService = (function() {
  // Keep this variable private inside this closure scope
  var myGrades = [93, 95, 88, 0, 55, 91];

  // Create an instance of the Trufflepig contract loader
  const loader = new TrufflepigLoader();

  // Create a provider for local TestRPC (Ganache)
  const provider = new providers.JsonRpcProvider("http://localhost:8545/");

  //console.log(privateKey)

  let privateKey;
  let inittialized = false;

  return {
    init: async function() {
      console.log("init");
      privateKey = await loader.getAccount(0);
      console.log(privateKey);

      const wallet = new Wallet(privateKey, provider);
      // Create an adapter (powered by ethers)
      const adapter = new EthersAdapter({
        loader,
        provider,
        wallet
      });

      // Connect to ColonyNetwork with the adapter!
      const networkClient = new ColonyNetworkClient({ adapter });
      await networkClient.init();

      inittialized = true;
    },

    average: function() {
      var total = myGrades.reduce(function(accumulator, item) {
        return accumulator + item;
      }, 0);

      return "Your average grade is " + total / myGrades.length + ".";
    },

    test: function() {
      console.log("test");
    },

    failing: function() {
      var failingGrades = myGrades.filter(function(item) {
        return item < 70;
      });

      return "You failed " + failingGrades.length + " times.";
    }
  };
})();

ColonyService.init();

module.exports = ColonyService;
