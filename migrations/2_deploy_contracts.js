var LearningBlocks = artifacts.require("LearningBlocks");
var LearningBlockCourses = artifacts.require("LearningBlocksCourses");
var LearningBlocksRBAC = artifacts.require("LearningBlocksRBAC");

module.exports = function(deployer) {
  return deployer

    .deploy(LearningBlocksRBAC)
    .then(() => {
      return LearningBlocksRBAC.deployed();
    })
    .then(() => {
      return deployer.deploy(LearningBlockCourses, LearningBlocksRBAC.address);
    })
    .then(() => {
      return LearningBlockCourses.deployed();
    })

    .then(() => {
      return deployer.deploy(LearningBlocks, "LearningBlock", "LB", LearningBlocksRBAC.address);
    })
    .then(() => {
      return LearningBlocks.deployed();
    })
    /*
    .then(()=> {
      process.exit(0);
    })
    */

};
