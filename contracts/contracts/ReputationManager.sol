// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReputationManager {
    mapping(address => uint256) public reputation;

    event ReputationUpdated(address indexed user, uint256 newReputation);

    function increaseReputation(address _user) external {
        reputation[_user] += 1;
        emit ReputationUpdated(_user, reputation[_user]);
    }

    function decreaseReputation(address _user) external {
        require(reputation[_user] > 0, "Reputation cannot be negative");
        reputation[_user] -= 1;
        emit ReputationUpdated(_user, reputation[_user]);
    }
}