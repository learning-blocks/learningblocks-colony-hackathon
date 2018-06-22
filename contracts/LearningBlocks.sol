pragma solidity ^0.4.2;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

// Interface
contract ILearningBlocksRBAC{
    function isAdminOrTeacher(address addr) view  public returns (bool) {}
}

contract LearningBlocks is ERC721Token, Pausable {

    event TokenMinted(
      string message,
      uint tokenId,
      string _uri
    );

    event TokenUpdated(
      string message,
      uint tokenId,
      string _uri
    );

    event TokenBurned(
      string message,
      uint tokenId
    );

    ILearningBlocksRBAC private learningBlocksRBAC;

    modifier onlyAdminOrTeacher() {
        require(
            learningBlocksRBAC.isAdminOrTeacher(msg.sender)
        );
        _;
    }

    constructor(string name, string symbol, address learningBlocksRBACAddress) public ERC721Token(name, symbol) {
        learningBlocksRBAC = ILearningBlocksRBAC(learningBlocksRBACAddress);
    }

    function setLearningBlocksRBA(address addr) onlyOwner public {
        learningBlocksRBAC = ILearningBlocksRBAC(addr);
    }

    function getLearningBlocksRBA() public view returns (address){
        return learningBlocksRBAC;
    }



    function mint(address _to, string _uri) onlyAdminOrTeacher whenNotPaused public{
        uint256 _tokenId = allTokens.length;
        super._mint(_to, _tokenId);
        super._setTokenURI(_tokenId, _uri);
        emit TokenMinted("Token successfully minted", _tokenId, _uri);
    }

    function burn(uint256 _tokenId) onlyAdminOrTeacher whenNotPaused public{
        super._burn(ownerOf(_tokenId), _tokenId);
        emit TokenBurned("Token successfully burned", _tokenId);
    }

    function listTokens() public view returns (uint256[]) {
        return allTokens;
    }

    // Returns the details of a token
    function getTokenDetails(uint256 _tokenId) public view returns (string tokenURI, address _owner, uint256 index) {
        return(tokenURIs[_tokenId], ownerOf(_tokenId), allTokensIndex[_tokenId]);
    }

    function setTokenURI(uint256 _tokenId, string _uri) onlyAdminOrTeacher public {
        super._setTokenURI(_tokenId, _uri);
        emit TokenUpdated("Token successfully updated", _tokenId, _uri);
    }

}
