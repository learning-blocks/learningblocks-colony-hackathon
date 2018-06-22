const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { TruffleLoader } = require("@colony/colony-js-contract-loader-fs");
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");
const fs = require("fs");
const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

console.log("**********  Bootstrapping colony ***********");

bootstap_colony = async () => {
  // load generated accounts file from ganache-cli
  var accounts = JSON.parse(fs.readFileSync("ganache-accounts.json"));

  //extraxt private key for first account
  const privateKey =
    "0x" + accounts.private_keys[Object.keys(accounts.private_keys)[0]];

  // Create an instance of the TruffleLoader contract loader
  const loader = new TruffleLoader({
    contractDir: "./lib/colonyNetwork/build/contracts/"
  });

  // Create a provider for local TestRPC (Ganache)
  const provider = new providers.JsonRpcProvider("http://localhost:8545/");

  // Create a wallet with the private key (so we have a balance we can use)
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

  console.log("NETWORK CLIENT")
  console.log(networkClient.contract.address)

  // Let's deploy a new ERC20 token for our Colony.
  // You could also skip this step and use a pre-existing/deployed contract.
  const tokenAddress = await networkClient.createToken({
    name: "Learning Blocks Colony Token",
    symbol: "LBCT"
  });
  console.log("Token address: " + tokenAddress);

  // Create a cool Colony!
  const {
    eventData: { colonyId, colonyAddress }
  } = await networkClient.createColony.send({ tokenAddress });

  // Congrats, you've created a Colony!
  console.log("Colony ID: " + colonyId);
  console.log("Colony address: " + colonyAddress);

  // get the Meta Colony:
  const metaColonyClient = await networkClient.getMetaColonyClient();
  console.log("Meta Colony address: " + metaColonyClient.contract.address);

  // create some global skills
   let skillLabels = [
    "Digital literacy",
    "Microsoft Office",
    "Web development",
    "Javascript"
  ];

  let skillMappings = [];
  for (let skillLabel of skillLabels) {
    console.log("Creating skill for " + skillLabel);
    let skill = await metaColonyClient.addGlobalSkill.send({
      parentSkillId: 1
    });

    skillMappings.push({
      skillId: skill.eventData.skillId,
      skilllabel: skillLabel
    });
  }

  // save mapping to IPFS
  const fileToStore = {
    path: "skillMappings.json",
    content: Buffer.from(JSON.stringify(skillMappings))
  };

  const files = await ipfs.files.add(fileToStore);
  const skillMappingsHash = files[0].hash;
  console.log(`SkillMappings saved to https://ipfs.infura.io/ipfs/${skillMappingsHash}`);


  let colonyInfo = {
    colonyId: colonyId,
    colonyAddress: colonyAddress,
    networkClientAddress: networkClient.contract.address,
    tokenAddress: tokenAddress,
    metaColonyAddress: metaColonyClient.contract.address,
    skillMappings: skillMappingsHash
  };

  await fs.writeFileSync(
    "colony.json",
    JSON.stringify(colonyInfo, null, 2),
    "utf8"
  );
  console.log("Colony info saved to colony.json ");
};

bootstap_colony().then(() => process.exit());
