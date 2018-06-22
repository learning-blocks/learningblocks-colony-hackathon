const truffleAssert = require("truffle-assertions");
const LearningBlocks = artifacts.require("LearningBlocks");
const LearningBlocksRBAC = artifacts.require("LearningBlocksRBAC");

contract("LearningBlock", async accounts => {
  it("should list allTokens", async () => {
    let instance = await LearningBlocks.deployed();
    let alltokens = await instance.listTokens.call();
    assert.equal(alltokens.length, 0);
  });

  it("should mint a token", async () => {
    let instance = await LearningBlocks.deployed();
    const oldTokenList = await instance.listTokens();
    const uri = "testuri";
    let tx = await instance.mint(accounts[0], uri);
    truffleAssert.eventEmitted(tx, "TokenMinted", null);
    const newTokenList = await instance.listTokens();
    expect(newTokenList.length).to.equal(oldTokenList.length + 1);
  });

  it("should list my tokens", async () => {
    let instance = await LearningBlocks.deployed();
    await instance.mint(accounts[0], "sampleuri");
    let balance = await instance.balanceOf(accounts[0]);
    expect(balance).to.be.above(0);
  });

  it("should get token details", async () => {
    let instance = await LearningBlocks.deployed();
    //mint a token
    const uri = "someRandomUri";
    await instance.mint(accounts[0], uri);

    //get amount of tokens owned
    let myBalance = await instance.balanceOf(accounts[0]);
    //get id of last owned token
    let tokenId = await instance.tokenOfOwnerByIndex(
      accounts[0],
      myBalance - 1
    );

    let [tokenUri, owner, index] = await instance.getTokenDetails(tokenId);
    expect(tokenUri).to.equal(uri);
    expect(owner).to.equal(accounts[0]);
  });

  it("should restrict minting to teachers or admins", async () => {
    let instance = await LearningBlocks.deployed();

    //send from another account with same id that has no teacher role
    let error;
    try {
      let tx = await instance.mint(accounts[1], "thishouldnotexistUri", {
        from: accounts[1]
      });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });

  it("should burn a token", async () => {
    let instance = await LearningBlocks.deployed();
    let tx = await instance.mint(accounts[0], "randomUriToBeDeleted");

    let tokenId;
    await truffleAssert.eventEmitted(tx, "TokenMinted", ev => {
      expect(ev.tokenId).to.exist;
      tokenId = ev.tokenId;
      return true;
    });

    let tokenExists = await instance.exists(tokenId);
    expect(tokenExists).to.equal(true);

    await instance.burn(tokenId);
    let tokenStillExists = await instance.exists(tokenId);
    expect(tokenStillExists).to.equal(false);
  });

  it("should restrict who can burn tokens", async () => {
    let instance = await LearningBlocks.deployed();
    let rbac = await LearningBlocksRBAC.deployed();
    let fromAccount = accounts[1];

    let isTeacher = await rbac.hasRole(fromAccount, "teacher");
    expect(isTeacher).to.equal(false);

    // doesn't matter if token exists, it should bail before
    let error;
    try {
      let tx = await instance.burn(0, { from: fromAccount });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });

  it("should allow teachers to update a token metadata uri", async () => {
    let instance = await LearningBlocks.deployed();
    let rbac = await LearningBlocksRBAC.deployed();

    // add teacher
    let teacherAddr = accounts[2];
    await rbac.addTeacher(teacherAddr);

    // mint token
    let tx = await instance.mint(teacherAddr, "testuri123", {
      from: teacherAddr
    });
    let tokenId;
    await truffleAssert.eventEmitted(tx, "TokenMinted", ev => {
      expect(ev.tokenId).to.exist;
      tokenId = ev.tokenId;
      return true;
    });

    // update token
    const updateUri = "updatedTokenUri";
    await instance.setTokenURI(tokenId, updateUri);

    //get token details
    let [tokenUri, address, index] = await instance.getTokenDetails(tokenId);
    expect(tokenUri).to.equal(updateUri);
  });

  it("should restrict who can update a tokenUri", async () => {
    let instance = await LearningBlocks.deployed();
    let rbac = await LearningBlocksRBAC.deployed();

    // not teacher or admin
    let address = accounts[8];
    let isTeacher = await rbac.hasRole(address, "teacher");
    let isAdmin = await rbac.hasRole(address, "admin");
    expect(isTeacher).to.equal(false);
    expect(isAdmin).to.equal(false);

    let error;
    try {
      //account to add doesn't matter, it should bail before
      let tx = await instance.setTokenURI(0, "updateTestUri", {
        from: address
      });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });

  it("should be able to upate the RBAC address", async() => {
    let instance = await LearningBlocks.deployed();
    let address = accounts[0];

    let currentOwner = await instance.owner.call();
    expect(currentOwner).to.equal(address);

    // set to new address
    let newAddress = "0x37a87765b06acc7dd8f7d2948d3afa8320cac028"
    let tx = await instance.setLearningBlocksRBA(newAddress, {from: address});

    // get address
    let receivedAddress = await instance.getLearningBlocksRBA();
    expect(receivedAddress).to.equal(newAddress);
  })

  it("should only allow the owner to update the RBAC address", async () => {
    let instance = await LearningBlocks.deployed();
    let address = accounts[5];

    let currentOwner = await instance.owner.call();
    expect(currentOwner).to.not.equal(address);

    let error;
    try {
      let newAddress = "0x37a87765b06acc7dd8f7d2948d3afa8320cac028";
      let tx = await instance.setLearningBlocksRBA(newAddress, {
        from: address
      });
    } catch (err) {
      error = err;
    } finally {
      expect(error, "Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  });
});
