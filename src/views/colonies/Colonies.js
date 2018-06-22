import { Grid, Typography } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { ItemGrid, Button, RegularCard } from "../../components";
import ipfs from "../../services/ipfs";
import web3Utils from "web3-utils";

// Colony setup
const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");
const { TrufflepigLoader } = require("@colony/colony-js-contract-loader-http");

const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider("http://localhost:8545/");
const colonyData = require("./../../../colony.json");

let colonyClient;

class Colonies extends Component {
  constructor(props, context) {
    super(props);

    this.contracts = context.drizzle.contracts;
    this.state = {
      tasks: []
    };

    this.networkClient = {};
    this.colonyClient = {};

    //Button handler bindings
    this.loadTasks = this.loadTasks.bind(this);
    this.createTask = this.createTask.bind(this);
    this.taskClick = this.taskClick.bind(this);
  }

  async componentDidMount() {
    // connect to colony
    const { privateKey } = await loader.getAccount(0);
    const wallet = new Wallet(privateKey, provider);
    const adapter = new EthersAdapter({
      loader,
      provider,
      wallet
    });
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // Get our colonoy
    colonyClient = await networkClient.getColonyClientByAddress(
      colonyData.colonyAddress
    );

    console.log(colonyClient);
  }

  async loadTasks() {
    let taskCount = await colonyClient.getTaskCount.call();
    let tasks = [];

    for (let i = 0; i <= taskCount.count; i++) {
      let task = await colonyClient.getTask.call({ taskId: i });

      //get task roles
      task.worker = await colonyClient.getTaskRole.call({
        taskId: task.id,
        role: "WORKER"
      });
      task.evaluator = await colonyClient.getTaskRole.call({
        taskId: task.id,
        role: "EVALUATOR"
      });
      task.manager = await colonyClient.getTaskRole.call({
        taskId: task.id,
        role: "MANAGER"
      });
      tasks.push(task);
    }

    console.log(tasks);
    this.setState({ tasks: tasks });
  }

  async createTask() {
    //store task description on ipfs
    const ipfsValues = {
      title: "Claim your skill reputation",
      description:
        "This taks will gain your skill reputation in the Learningblocks colony"
    };
    const fileToStore = {
      content: Buffer.from(JSON.stringify(ipfsValues))
    };

    const files = await ipfs.files.add(fileToStore);
    const specificationHash = files[0].hash;
    console.log(`https://ipfs.infura.io/ipfs/${specificationHash}`);

    console.log(colonyClient);

    // Create a task in the root domain
    const {
      eventData: { taskId }
    } = await colonyClient.createTask.send({
      specificationHash,
      domainId: 1
    });

    //set skill
    await colonyClient.setTaskSkill.send({ taskId: taskId, skillId: 1 });

    let worker = await loader.getAccount(0);
    let evaluator = await loader.getAccount(1);

    //set worker
    await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "WORKER",
      user: worker.address
    });

    //set evaluator
    await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "EVALUATOR",
      user: evaluator.address
    });

    // Let's take a look at the newly created task
    const task = await colonyClient.getTask.call({ taskId });

    console.log(task);
  }

  async taskClick(task) {
    console.log(task);

    let taskRole = await colonyClient.getTaskRole.call({
      taskId: task.id,
      role: "WORKER"
    });
    console.log(taskRole);
  }

  async deleteTask(task) {
    console.log("deleting task: " + task.id);
    await colonyClient.cancelTask.send({ taskId: task.id });
    this.loadTasks();
  }

  async rateTask(task) {
    const salt = web3Utils.soliditySha3("0123456790");
    var BigNumber = web3Utils.BN;

    const ratingSecret = await colonyClient.generateSecret
      .call({
        salt: salt,
        value: new BigNumber(100)
      })
      .toString();

    // Rate worker
    await colonyClient.submitTaskWorkRating.send(
      {
        taskId: task.id,
        role: "WORKER",
        ratingSecret
      },
      { from: this.props.accounts[0] }
    );
    /*
    await colonyClient.submitTaskWorkRating.send({
      taskId: task.id,
      role: 'EVALUATOR',
      ratingSecret,
    });
*/
  }

  async finalizeTask(task) {
    console.log("finalizing task: " + task.id);
    try {
      await colonyClient.finalizeTask.send({ taskId: task.id });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <Typography variant="display1" gutterBottom>
              Colonies
            </Typography>
            <Button onClick={this.loadTasks}>Load Tasks</Button>
            <Button onClick={this.createTask}>Create Task</Button>
          </ItemGrid>
        </Grid>

        <Grid container>
          {this.state.tasks.map(task => (
            <ItemGrid key={task.id} xs={12} sm={4} md={4}>
              <RegularCard
                headerColor="orange"
                cardTitle={task.id}
                cardSubtitle="Task"
                content={
                  <div>
                    <p>SkillId: {task.skillId}</p>
                    <p>cancelled: {task.cancelled.toString()}</p>
                  </div>
                }
                footer={
                  <div>
                    <Button onClick={() => this.deleteTask(task)}>
                      Delete
                    </Button>
                    <Button onClick={() => this.rateTask(task)}>Rate</Button>
                    <Button onClick={() => this.finalizeTask(task)}>
                      Finalize
                    </Button>
                  </div>
                }
              />
            </ItemGrid>
          ))}
        </Grid>
      </div>
    );
  }
}

Colonies.contextTypes = {
  drizzle: PropTypes.object
};

export default Colonies;
