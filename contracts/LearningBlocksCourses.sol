pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

// Interface
contract ILearningBlocksRBAC{
    function isSystemManager(address addr) view  public returns (bool) {}
}

contract LearningBlocksCourses is Pausable {

    struct Course {
        bool used;
        string name;
        string metaDataUri;
    }

    event CourseAdded(
      string message,
      uint id,
      string name,
      string metaDataUri
    );

    event CourseRemoved(
      string message,
      uint id
    );

    ILearningBlocksRBAC private learningBlocksRBAC;

    modifier onlySystemManager() {
        require(
            learningBlocksRBAC.isSystemManager(msg.sender)
        );
        _;
    }

    mapping(uint => Course) public courses;
    uint[] public courseIndecies;

    constructor(address learningBlocksRBACAddress) public {
        learningBlocksRBAC = ILearningBlocksRBAC(learningBlocksRBACAddress);
    }

    function setLearningBlocksRBA(address addr) onlySystemManager public {
        learningBlocksRBAC = ILearningBlocksRBAC(addr);
    }

    function getLearningBlocksRBA() public view returns (address){
        return learningBlocksRBAC;
    }

    function addCourse(uint id, string _name, string _metaDataUri) onlySystemManager public {
        require(courses[id].used == false);

        courses[id].name = _name;
        courses[id].metaDataUri = _metaDataUri;
        courses[id].used = true;

        courseIndecies.push(id);
        emit CourseAdded("New course added", id, courses[id].name, courses[id].metaDataUri);
    }

    function removeCourse(uint id) onlySystemManager public {
        // make sure course exists
        require(courses[id].used);

        courses[id].used = false;

        //remove id from indecies
        removeByIndex(findIndexById(id));

        // delete item from mapping
        delete(courses[id]);
        emit CourseRemoved("Course removed", id);
    }

    function getCoursesLength() public view returns (uint count) {
        return courseIndecies.length;
    }

    // helper method to find the index of a course by id
    function findIndexById(uint id) private view returns(uint) {
        uint i = 0;
        while (courseIndecies[i] != id) {
            i++;
        }
        return i;
    }

    // helper method to remove a course from the indeciies
    function removeByIndex(uint index) private {
        uint i = index;
        while (i<courseIndecies.length-1) {
            courseIndecies[i] = courseIndecies[i+1];
            i++;
        }
        courseIndecies.length--;
    }




    function getCourseById(uint id) public view returns (string, string) {
        return (courses[id].name, courses[id].metaDataUri);
    }

    function getCourseByIndex(uint index) public view returns (uint, string, string) {

        uint id = courseIndecies[index];
        return  (id, courses[id].name, courses[id].metaDataUri );
    }



}
