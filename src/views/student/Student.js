import EthersAdapter from "@colony/colony-js-adapter-ethers/lib/EthersAdapter";
import ColonyNetworkClient from "@colony/colony-js-client/lib/ColonyNetworkClient";
import TrufflepigLoader from "@colony/colony-js-contract-loader-http/lib/loaders/TrufflepigLoader";
import merge from "lodash.merge";
import { Grid, Typography } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import "react-table/react-table.css";
import web3Utils from "web3-utils";
import { ItemGrid } from "../../components";
import TokenCard from "../../components/Cards/TokenCard";
import ipfs from "../../services/ipfs";

const { providers, Wallet } = require("ethers");
const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider("http://localhost:8545/");
const colonyData = require("./../../../colony.json");

class Student extends Component {
  constructor(props, context) {
    super(props);

    this.contracts = context.drizzle.contracts;
    this.state = {
      ownedTokensData: [],
      colonyClient: {},
      currentColonyAccount: null
    };
  }

  async componentDidMount() {
    let acccount = await loader.getAccount(1);
    this.setState({ currentColonyAccount: acccount });

    //Connect to colony network (This using the local colony network and revealing a private key! )
    const wallet = new Wallet(
      this.state.currentColonyAccount.privateKey,
      provider
    );
    const adapter = new EthersAdapter({
      loader,
      provider,
      wallet
    });
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // Get our colonyClient
    let colonyClient = await networkClient.getColonyClientByAddress(
      colonyData.colonyAddress
    );
    this.setState({ colonyClient: colonyClient });

    // get list of courses
    await this.loadTokens();
    await this.loadTasks();
  }

  async loadTasks() {
    // loading all tasks. We're only interested in task where the current account is the worker
    let taskCount = await this.state.colonyClient.getTaskCount.call();
    for (let i = 0; i <= taskCount.count; i++) {
      const worker = await this.state.colonyClient.getTaskRole.call({
        taskId: i,
        role: "WORKER"
      });
      if (worker.address == this.props.accounts[0]) {
        //get details for task
        let task = await this.state.colonyClient.getTask.call({ taskId: i });
        task.worker = worker;

        if (task.cancelled === false) {
          //assign to the matching token in ownedTokens

          let file = await ipfs.get(task.specificationHash);
          task.specification = JSON.parse(file[0].content.toString("utf8"));
          console.log(task.specification);

          //find matching courseId and assign task
          this.state.ownedTokensData.forEach(token => {
            if (task.specification.courseId === token.courseId) {
              token.task = task;
            }
          });
        }
      }
    }
  }

  async completeTask(task) {
    //figure out what the current state of the contract is
    if (!task.dueDate) {
      console.log("no due date, returning");
      // This is required by colony an can only be set by multisig. Need to exit here if the case
      return;
    }

    console.log(task);
    //submit fake work if not set
    if (!task.deliverableHash) {
      console.log("submitting work");
      let response = await this.state.colonyClient.submitTaskDeliverable.send({
        taskId: task.id,
        deliverableHash: "QmYUYzCk7gpWcwhgEQKJXUJTNDBVH7B5ydhXhECuRDizx3"
      });
      console.log(response);
    }

    //check the state of the ratings
    let rating = await this.state.colonyClient.getTaskWorkRatings.call({
      taskId: task.id
    });
    console.log(rating);

    // Rate the task/evaluator
    const salt = web3Utils.soliditySha3("0123456790");
    var BigNumber = web3Utils.BN;

    const ratingSecret = await this.state.colonyClient.generateSecret
      .call({
        salt: salt,
        value: new BigNumber(50) //full points for now
      })
      .toString();

    // Rate evaluator
    let response = await this.state.colonyClient.submitTaskWorkRating.send({
      taskId: task.id,
      role: "WORKER",
      ratingSecret
    });
    console.log(response);
  }

  async loadTokens() {
    let owner = this.props.accounts[0]; //Account currnently signed in
    console.log("Loading tokens for " + owner);

    //Get balance for current acccount
    let tokenBalance = await this.contracts.LearningBlocks.methods
      .balanceOf(owner)
      .call();

    let ownedTokensData = [];

    for (let i = 0; i < tokenBalance; i++) {
      // Data used for rendering
      let tokenData = {};

      //get details from smartcontract
      let tokenId = await this.contracts.LearningBlocks.methods
        .tokenOfOwnerByIndex(owner, i)
        .call();
      let tokenDetails = await this.contracts.LearningBlocks.methods
        .getTokenDetails(tokenId)
        .call();

      //get token details from ipfs
      try {
        let files = await ipfs.get(tokenDetails.tokenURI);
        files.forEach(file => {
          let object = JSON.parse(file.content.toString("utf8"));
          tokenData = merge(object);
        });
      } catch (error) {
        console.log(error);
      }

      //get course details from smartcontract
      let course = await this.contracts.LearningBlocksCourses.methods
        .getCourseById(tokenData.courseId)
        .call();

      //get course details from ipfs
      try {
        let files = await ipfs.get(course[1]);
        files.forEach(file => {
          let object = JSON.parse(file.content.toString("utf8"));
          tokenData = merge(tokenData, object);
        });
      } catch (error) {
        console.log(error);
      }
      ownedTokensData.push(tokenData);
    }

    console.log(ownedTokensData);
    this.setState({ ownedTokensData: ownedTokensData });
  }

  render() {
    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <Typography variant="display1" gutterBottom>
              Your Learning Block Tokens
            </Typography>
          </ItemGrid>
        </Grid>

        <Grid container>
          {this.state.ownedTokensData.map(token => (
            <ItemGrid key={token.dateOfCreation} xs={12} sm={4} md={4}>
              <TokenCard
                token={token}
                onTask={task => this.completeTask(task)}
              />
            </ItemGrid>
          ))}
        </Grid>
      </div>
    );
  }
}

Student.contextTypes = {
  drizzle: PropTypes.object
};

export default Student;
