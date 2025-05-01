const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  describe("MicroGigs", function () {
    const TASK_REWARD = ethers.parseEther("1.0");
    const TASK_DEADLINE = 7 * 24 * 60 * 60; // 7 days in seconds
  
    async function deployMicroGigsFixture() {
      const [owner, taskPoster, completer, randomUser] = await ethers.getSigners();
  
      // Deploy TaskFactory first (since it doesn't have dependencies)
      const TaskFactory = await ethers.getContractFactory("TaskFactory");
      const taskFactory = await TaskFactory.deploy();
  
      // Deploy ReputationManager (not used in current contracts but keeping for future)
      const ReputationManager = await ethers.getContractFactory("ReputationManager");
      const reputationManager = await ReputationManager.deploy();
  
      return { 
        taskFactory,
        reputationManager,
        owner, 
        taskPoster, 
        completer, 
        randomUser 
      };
    }
  
    async function deployWithTaskFixture() {
      const baseFixture = await loadFixture(deployMicroGigsFixture);
      const { taskFactory, taskPoster } = baseFixture;
  
      // Create a task
      const tx = await taskFactory.connect(taskPoster).createTask(
        "QmXYZ123",
        TASK_REWARD,
        TASK_DEADLINE,
        { value: TASK_REWARD }
      );
      const receipt = await tx.wait();
      const taskCreatedEvent = receipt.logs?.find(log => {
        try {
            return taskFactory.interface.parseLog(log)?.name === "TaskCreated";
        } catch {
            return false;
        }
        });
      if (!taskCreatedEvent) throw new Error("TaskCreated event not found");
      const parsedEvent = taskFactory.interface.parseLog(taskCreatedEvent);
      const taskAddress = taskCreatedEvent.args.taskAddress;
    //   console.log("Task Address:", taskAddress);
    //   console.log("Parsed Event:", parsedEvent);
  
      const taskEscrow = await ethers.getContractAt("TaskEscrow", taskAddress);
  
      return {
        ...baseFixture,
        taskEscrow
      };
    }

    async function deployWithAssignedTaskFixture() {
        // Start with a deployed task
        const { taskEscrow, taskPoster, completer, ...baseFixture } = await loadFixture(deployWithTaskFixture);
        
        // Assign the task to a completer
        const assignTx = await taskEscrow.connect(taskPoster).assignTask(completer.address);
        await assignTx.wait();
    
        return {
            ...baseFixture,
            taskEscrow,
            taskPoster,
            completer
        };
    }
  
    describe("TaskFactory Deployment", function () {
      it("Should deploy TaskFactory with empty task list", async function () {
        const { taskFactory } = await loadFixture(deployMicroGigsFixture);
        const tasks = await taskFactory.getAllTasks();
        expect(tasks.length).to.equal(0);
      });
    });
  
    describe("Task Creation", function () {
      it("Should create a new task escrow contract", async function () {
        const { taskFactory, taskPoster } = await loadFixture(deployMicroGigsFixture);
        
        await expect(
          taskFactory.connect(taskPoster).createTask(
            "QmXYZ123",
            TASK_REWARD,
            TASK_DEADLINE,
            { value: TASK_REWARD }
          )
        ).to.emit(taskFactory, "TaskCreated");
        
        const tasks = await taskFactory.getAllTasks();
        expect(tasks.length).to.equal(1);
      });
  
      it("Should properly initialize the TaskEscrow", async function () {
        const { taskEscrow, taskPoster } = await loadFixture(deployWithTaskFixture);
        
        expect(await taskEscrow.taskPoster()).to.equal(taskPoster.address);
        expect(await taskEscrow.reward()).to.equal(TASK_REWARD);
        expect(await taskEscrow.descriptionHash()).to.equal("QmXYZ123");
        expect(await taskEscrow.status()).to.equal(0); // OPEN status
      });

    it("Should initialize TaskEscrow with correct parameters", async function () {
        const { taskEscrow, taskPoster } = await loadFixture(deployWithTaskFixture);
        
        expect(await taskEscrow.taskPoster()).to.equal(taskPoster.address);
        expect(await taskEscrow.reward()).to.equal(TASK_REWARD);
        expect(await taskEscrow.descriptionHash()).to.equal("QmXYZ123");
        expect(await taskEscrow.status()).to.equal(0); // OPEN status
      });
    });
    
    describe("Assigned Task State", function() {
        it("Should correctly assign a completer", async function() {
            const { taskEscrow, completer } = await loadFixture(deployWithAssignedTaskFixture);
            
            expect(await taskEscrow.taskCompleter()).to.equal(completer.address);
            expect(await taskEscrow.status()).to.equal(1); // ASSIGNED = 1
        });
    
        it("Should emit TaskAssigned event", async function() {
            const { taskEscrow, taskPoster, completer } = await loadFixture(deployWithTaskFixture);
            
            await expect(
                taskEscrow.connect(taskPoster).assignTask(completer.address)
            ).to.emit(taskEscrow, "TaskAssigned")
             .withArgs(completer.address);
        });
    
        it("Should prevent assignment by non-poster", async function() {
            const { taskEscrow, randomUser, completer } = await loadFixture(deployWithTaskFixture);
            
            await expect(
                taskEscrow.connect(randomUser).assignTask(completer.address)
            ).to.be.revertedWith("Only task poster can call");
        });
    
        it("Should prevent double assignment", async function() {
            const { taskEscrow, taskPoster, completer } = await loadFixture(deployWithAssignedTaskFixture);
            
            await expect(
                taskEscrow.connect(taskPoster).assignTask(completer.address)
            ).to.be.revertedWith("Task already assigned/completed");
        });
    });
    
    describe("Task Completion Flow", function() {
        it("Should allow completer to submit work", async function() {
            const { taskEscrow, completer } = await loadFixture(deployWithAssignedTaskFixture);
            
            await expect(taskEscrow.connect(completer).submitWork())
                .to.emit(taskEscrow, "TaskCompleted");
            
            expect(await taskEscrow.isCompleted()).to.be.true;
            expect(await taskEscrow.status()).to.equal(2); // COMPLETED = 2
        });
    
        it("Should prevent submission by non-completer", async function() {
            const { taskEscrow, randomUser } = await loadFixture(deployWithAssignedTaskFixture);
            
            await expect(
                taskEscrow.connect(randomUser).submitWork()
            ).to.be.revertedWith("Only task completer can call");
        });
    
        it("Should release payment to completer", async function() {
            const { taskEscrow, taskPoster, completer } = await loadFixture(deployWithAssignedTaskFixture);
            
            // Complete the task first
            await taskEscrow.connect(completer).submitWork();
            
            const initialBalance = await ethers.provider.getBalance(completer.address);
            await taskEscrow.connect(taskPoster).releasePayment();
            const finalBalance = await ethers.provider.getBalance(completer.address);
            
            expect(finalBalance - initialBalance).to.equal(TASK_REWARD);
            expect(await taskEscrow.status()).to.equal(2); // COMPLETED
        });
    });
  
  
    describe("Dispute Resolution", function () {
      it("Should allow dispute raising", async function () {
        const { taskEscrow, taskPoster } = await loadFixture(deployWithAssignedTaskFixture);
        
        await expect(taskEscrow.connect(taskPoster).raiseDispute())
          .to.emit(taskEscrow, "DisputeRaised");
      });
    });
  });