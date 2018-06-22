import LearningBlocks from "./../build/contracts/LearningBlocks.json";
import LearningBlocksCourses from "./../build/contracts/LearningBlocksCourses.json";
import LearningBlocksRBAC from "./../build/contracts/LearningBlocksRBAC.json";

import ColonyNetwork from "./../lib/colonyNetwork/build/contracts/ColonyNetwork.json";

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545"
    }
  },
  contracts: [
    LearningBlocksRBAC,
    LearningBlocks,
    LearningBlocksCourses,
    ColonyNetwork
  ],
  events: {
    // LearningBlocks: [
    //   "TokenMinted",
    //   "TokenUpdated",
    //   "TokenBurned",
    //   "TeacherAdded",
    //   "TeacherRemoved"
    // ]
  },
  polls: {
    accounts: 1500
  }
};

export default drizzleOptions;
