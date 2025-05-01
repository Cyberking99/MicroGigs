// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./TaskEscrow.sol";

contract TaskFactory {
    address[] public tasks;
    event TaskCreated(address indexed taskAddress, address indexed creator);

    function createTask(
        string memory _descriptionHash, // IPFS hash
        uint256 _reward,
        uint256 _deadline
    ) external payable returns (address) {
        require(msg.value == _reward, "Deposit must match reward");
        
        TaskEscrow newTask = new TaskEscrow(
            address(this),
            msg.sender,
            _descriptionHash,
            _reward,
            _deadline
        );
        
        tasks.push(address(newTask));
        payable(address(newTask)).transfer(_reward); // Fund escrow
        
        emit TaskCreated(address(newTask), msg.sender);
        return address(newTask);
    }

    function getAllTasks() external view returns (address[] memory) {
        return tasks;
    }
}