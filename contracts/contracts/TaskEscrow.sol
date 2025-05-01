// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskEscrow {
    address public factory; // Add this
    address public taskPoster;
    address public taskCompleter;
    string public descriptionHash; // IPFS hash
    uint256 public reward;
    uint256 public deadline;
    bool public isCompleted;
    bool public isDisputed;

    enum Status { OPEN, ASSIGNED, COMPLETED, DISPUTED }
    Status public status;

    event TaskAssigned(address indexed completer);
    event TaskCompleted();
    event DisputeRaised();
    event FundsReleased(address indexed recipient, uint256 amount);

    constructor(
        address _factory,
        address _taskPoster,
        string memory _descriptionHash,
        uint256 _reward,
        uint256 _deadline
    ) {
        factory = _factory;
        taskPoster = _taskPoster;
        descriptionHash = _descriptionHash;
        reward = _reward;
        deadline = block.timestamp + _deadline;
        status = Status.OPEN;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Caller is not factory");
        _;
    }

    modifier onlyTaskPoster() {
        require(msg.sender == taskPoster, "Only task poster can call");
        _;
    }

    modifier onlyTaskCompleter() {
        require(msg.sender == taskCompleter, "Only task completer can call");
        _;
    }

    function assignTask(address _completer) external onlyTaskPoster {
        require(status == Status.OPEN, "Task already assigned/completed");
        taskCompleter = _completer;
        status = Status.ASSIGNED;
        emit TaskAssigned(_completer);
    }

    function submitWork() external onlyTaskCompleter {
        require(status == Status.ASSIGNED, "Task not assigned");
        isCompleted = true;
        status = Status.COMPLETED;
        emit TaskCompleted();
    }

    function releasePayment() external onlyTaskPoster {
        require(status == Status.COMPLETED, "Task not completed");
        payable(taskCompleter).transfer(reward);
        emit FundsReleased(taskCompleter, reward);
    }

    function raiseDispute() external {
        require(msg.sender == taskPoster || msg.sender == taskCompleter, "Unauthorized");
        isDisputed = true;
        status = Status.DISPUTED;
        emit DisputeRaised();
    }

    // Admin/DAO resolves dispute (simplified for MVP)
    function resolveDispute(address _winner) external {
        require(status == Status.DISPUTED, "No active dispute");
        payable(_winner).transfer(reward);
        status = Status.COMPLETED;
    }

    receive() external payable {}
}