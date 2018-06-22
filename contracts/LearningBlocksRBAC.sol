pragma solidity ^0.4.23;
import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";

contract LearningBlocksRBAC is RBAC {

    string public constant ROLE_ADMIN = "admin";
    string public constant ROLE_TEACHER = "teacher";
    string public constant ROLE_SYSTEM_MANAGER = "systemmanager";

    event TeacherAdded(
      string message,
      address addr
    );

    event TeacherRemoved(
      string message,
      address addr
    );

    modifier onlyAdmin() {
        require(
            hasRole(msg.sender, ROLE_ADMIN)
        );
        _;
    }

    function isTeacher(address addr) public returns(bool) {
        return hasRole(addr, ROLE_TEACHER);
    }

    function isAdminOrTeacher(address addr) public returns (bool) {
        return hasRole(addr, ROLE_ADMIN) || hasRole(addr, ROLE_TEACHER);
    }

    function isSystemManager(address addr) public returns (bool) {
        return hasRole(addr, ROLE_SYSTEM_MANAGER) || hasRole(addr, ROLE_ADMIN);
    }

    constructor() public {
        // give contract owner all available roles
        addRole(msg.sender, ROLE_TEACHER);
        addRole(msg.sender, ROLE_ADMIN);
        addRole(msg.sender, ROLE_SYSTEM_MANAGER);
    }

    function addTeacher(address addr) onlyAdmin public {
        addRole(addr, ROLE_TEACHER);
        emit TeacherAdded("Teacher added", addr);
    }

    function removeTeacher(address addr) onlyAdmin public {
        removeRole(addr, ROLE_TEACHER);
        emit TeacherAdded("Teacher removed", addr);
    }

    function addSystemManager(address addr) onlyAdmin public {
        addRole(addr, ROLE_SYSTEM_MANAGER);
    }

    function removeSystemManager(address addr) onlyAdmin public {
        removeRole(addr, ROLE_SYSTEM_MANAGER);
    }


}
