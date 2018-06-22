const LearningBlocksRBAC = artifacts.require("LearningBlocksRBAC");

contract("LearningBlocksRBAC", function(accounts) {
  it("should allow admins to add teachers", async () => {
    let instance = await LearningBlocksRBAC.deployed();
    let address = accounts[7];
    let isTeacher = await instance.hasRole(address, "teacher");
    expect(isTeacher).to.equal(false);

    await instance.addTeacher(address);
    let isTeacherNow = await instance.hasRole(address, "teacher");
    expect(isTeacherNow).to.equal(true);
  });

  it("should not allow non admins to add teachers", async () => {
    let instance = await LearningBlocksRBAC.deployed();

    let fromAccount = accounts[9];
    let isAdmin = await instance.hasRole(fromAccount, "admin");
    expect(isAdmin).to.equal(false);

    let error;
    try {
      //account to add doesn't matter, it should bail before
      let tx = await instance.addTeacher(accounts[3], { from: fromAccount });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });

  it("should allow to remove teachers", async () => {
    let instance = await LearningBlocksRBAC.deployed();
    //use teacher from previous test
    let isTeacher = await instance.hasRole(accounts[7], "teacher");
    expect(isTeacher).to.equal(true);
    await instance.removeTeacher(accounts[7]);
    let isTeacherNow = await instance.hasRole(accounts[7], "teacher");
    expect(isTeacherNow).to.equal(false);
  });

  it("should not allow non admins to remove teachers", async () => {
    let instance = await LearningBlocksRBAC.deployed();
    let fromAccount = accounts[6];
    let isAdmin = await instance.hasRole(fromAccount, "admin");
    expect(isAdmin).to.equal(false);

    let error;
    try {
      //account to add doesn't matter, it should bail before
      let tx = await instance.removeTeacher(accounts[3], { from: fromAccount });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });
});
