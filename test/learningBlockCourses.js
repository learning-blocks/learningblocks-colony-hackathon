const LearningBlocksCourses = artifacts.require("./LearningBlocksCourses.sol");
const LearningBlocksRBAC = artifacts.require("LearningBlocksRBAC");

contract('LearningBlocksCourses', function(accounts) {

  it("should create and get a course", async() => {
    const instance = await LearningBlocksCourses.deployed();

    const testId = 1;
    const testCourseName = "sampleCourseName";
    const testMetaDataUri = "someIpfsHash"
    //create
    await instance.addCourse(testId,testCourseName,testMetaDataUri);

    //retrieve
    let [name, metaDataUri] = await instance.getCourseById.call(testId);

    assert.equal(name, testCourseName);
    assert.equal(metaDataUri, testMetaDataUri);
  })

  it("should return the right amount of courses", async() => {
    const instance = await LearningBlocksCourses.deployed();

    // get current number of courses
    const oldNumCourses = await instance.getCoursesLength();
    assert.isAtLeast(oldNumCourses.valueOf(), 0);

    //add a course
    await instance.addCourse(5,"coursename","coursemeta");
    const newNumCourses = await instance.getCoursesLength();
    assert.equal(newNumCourses.valueOf(), oldNumCourses.toNumber()+1);
  });

  it("should delete a course", async() => {
    const instance = await LearningBlocksCourses.deployed();

    const previousCoursesNum = await instance.getCoursesLength();

    //add a course (creation tested in other steps)
    const courseId = 89;
    await instance.addCourse(courseId,"coursedodelete","uritodelete");

    //delete  course
    await instance.removeCourse(courseId);

    //try to retrieve course (should be empty)
    let [name, metaDataUri]= await instance.getCourseById(courseId);
    expect(name).to.be.empty;
    expect(metaDataUri).to.be.empty;

    //get number of courses (should be same as before)
    const newCoursesNum = await instance.getCoursesLength();
    expect(newCoursesNum.toNumber()).to.equal(previousCoursesNum.toNumber());
  });

  it("should return multiple courses", async() => {
    const instance = await LearningBlocksCourses.deployed();

    const mock1 = {id: 21, name: 'course1', metaDataUri: 'someuri1'};
    const mock2 = {id: 22, name: 'course2', metaDataUri: 'someuri2'};
    const mock3 = {id: 23, name: 'course3', metaDataUri: 'someuri3'};


    //create 3 additioanl courses
    await instance.addCourse(mock1.id, mock1.name, mock1.metaDataUri);
    await instance.addCourse(mock2.id, mock2.name, mock2.metaDataUri);
    await instance.addCourse(mock3.id, mock3.name, mock3.metaDataUri);

    // get length of available courses
    let length = await instance.getCoursesLength();
    expect(length.toNumber()).to.be.at.least(3);

    let courses = [];
    for (let i = 0; i < length.valueOf(); i++) {
      let [id, name, metaDataUri] = await instance.getCourseByIndex(i);
      courses.push({
        id: id.toNumber(),
        name: name,
        metaDataUri: metaDataUri
      });
    }

    expect(courses.length).to.equal(length.toNumber());
    expect(courses).to.deep.include(mock1);
    expect(courses).to.deep.include(mock2);
    expect(courses).to.deep.include(mock3);

  });

  it("should not allow to have identical ids", async() => {
    const instance = await LearningBlocksCourses.deployed();

    //create first regular itemw
    const testId = 19;
    await instance.addCourse( testId, "test1", "testuri1");

    //try another course with same id
    let error;
    try {
      await instance.addCourse( testId, "test2", "testuri2");
    } catch (err) {
      error = err;
    }finally{
      expect(error.message).to.include("revert");
    }
  })

  it("should now allow non systemmanagers to add courses", async() => {
    const instance = await LearningBlocksCourses.deployed();
    let rbac = await LearningBlocksRBAC.deployed();


    let fromAccount = accounts[5];
    let isSysAdmin = await rbac.hasRole(fromAccount, "systemmanager");
    expect(isSysAdmin).to.equal(false);

    //create a course
    let error;
    try {
      let tx = await instance.addCourse( 59, "test1", "testuri1", {from: fromAccount});
    } catch (err) {
      error= err;
    }finally{
      expect(error,"Expected error to to be thrown").to.exist;
      expect(error.message).to.include("revert");
    }
  })

  it("should only allow systemmanagers to add courses", async() => {
    const instance = await LearningBlocksCourses.deployed();
    const rbac = await LearningBlocksRBAC.deployed();

    let fromAccount = accounts[8];
    let isSysAdmin = await rbac.hasRole(fromAccount, "systemmanager");
    expect(isSysAdmin).to.equal(false);

    await rbac.addSystemManager(fromAccount);
    isSysAdmin = await rbac.hasRole(fromAccount, "systemmanager");
    expect(isSysAdmin).to.equal(true);

    //create a course
    let error;
    try {
      let tx = await instance.addCourse( 87, "test1", "testuri1", {from: fromAccount});
    } catch (err) {
      error= err;
    }finally{
      expect(error).to.be.undefined;
    }
  });

  it("should be able to upate the RBAC address", async() => {
    let instance = await LearningBlocksCourses.deployed();
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
    let instance = await LearningBlocksCourses.deployed();
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

