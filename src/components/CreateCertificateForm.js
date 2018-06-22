import { Grid } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Field } from "redux-form";
import { TextField } from "redux-form-material-ui";
import DateTimePicker from "react-widgets/lib/DateTimePicker";
import DropdownList from "react-widgets/lib/DropdownList";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
import { Button, ItemGrid, RegularCard } from ".";
import ipfs from "../services/ipfs";
// import CourseDropdown from "./CourseDropdown";

import "react-widgets/dist/css/react-widgets.css";
import TrufflepigLoader from "@colony/colony-js-contract-loader-http/lib/loaders/TrufflepigLoader";
import EthersAdapter from "@colony/colony-js-adapter-ethers/lib/EthersAdapter";
import ColonyNetworkClient from "@colony/colony-js-client/lib/ColonyNetworkClient";


const { providers, Wallet } = require("ethers");
const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider("http://localhost:8545/");
const colonyData = require("./../../colony.json");

momentLocalizer(moment);

const renderDateTimePicker = props => {
  const {
    input: { onChange, value },
    placeholder,
    showTime,
    onSetDate
  } = props;
  return (
    <DateTimePicker
      onChange={onSetDate}
      format="DD MMM YYYY"
      time={null}
      // value={!value ? null : new Date(value)}
      placeholder={placeholder}
    />
  );
};

const ValueInput = ({ item }) => (
  <span>
    <strong>{item.name}</strong>
  </span>
);

const renderCourseDropdown = props => {
  let dropdownData = [];
  const options = props.options;
  Object.keys(options).forEach(key =>
    dropdownData.push({
      id: key,
      name: options[key]
    })
  );
  return (
    <DropdownList
      data={dropdownData}
      onChange={props.onSetCourse}
      valueField="id"
      textField="name"
      valueComponent={ValueInput}
      placeholder={"Select Certificate"}
    />
  );
};

class CreateCertificateForm extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.submitHandler = this.submitHandler.bind(this);

    this.state = {
      isAdmin: false,
      isSystemManager: false,
      courses: [],
      courseOptions: {},
      courseId: null,
      courseName: "",
      issuanceDate: null,
      expirationDate: null
    };
  }

  setCourse = course => {
    this.setState({ courseId: course.id, courseName: course.name });
  };

  setIssuanceDate = date => {
    this.setState({ issuanceDate: date });
  };

  setExpirationDate = date => {
    this.setState({ expirationDate: date });
  };

  async submitHandler(values) {
    // create file to store on ipfs
    const ipfsValues = {
      courseId: this.state.courseId,
      isValid: true,
      dateOfCreation: Date.now(),
      dateOfIssuance: this.state.issuanceDate,
      dateOfExpiration: this.state.expirationDate,
      score: values.score,
      issuedBy: this.props.fromAccount,
      student: {
        uportId: values.mnid
      }
    };

    console.log(ipfsValues);

    const fileToStore = {
      path: "certificate.json",
      content: Buffer.from(JSON.stringify(ipfsValues))
    };

    const files = await ipfs.files.add(fileToStore);
    const hash = files[0].hash;
    console.log(
      `Certificate details saved: https://ipfs.infura.io/ipfs/${hash}`
    );

    let tx = await this.contracts.LearningBlocks.methods
      .mint(values.toAddress, hash)
      .send();
    //let id = new Date().getTime()
    //let tx = await this.contracts.LearningBlocksCourses.methods.addCourse(id, values.name, hash).send();
    console.log(tx);

    // Find the skillId matching the selected course
    let skillId;
    this.props.courses.forEach(course => {
      if (course.id == this.state.courseId) {
        skillId = course.colonySkill.id;
      }
    });

    // Create a review task for this certificate/course
    await this.createReviewTask(
      this.props.accounts[0],
      values.toAddress,
      this.state.courseId,
      skillId
    );
  }

  async createReviewTask(teacherAddress, studentAddress, courseId, skillId) {
    //Connect to colony network (This using the local colony network and revealing a private key! )
    const { privateKey } = await loader.getAccount(0);
    const wallet = new Wallet(privateKey, provider);
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

    //store task description on ipfs and get hash
    const ipfsValues = {
      title: "Review this course",
      description:
        "Leave a review for this course and gain your skill reputation in the Learningblocks colony",
      courseId: courseId
    };
    const fileToStore = {
      content: Buffer.from(JSON.stringify(ipfsValues))
    };

    const files = await ipfs.files.add(fileToStore);
    const specificationHash = files[0].hash;
    console.log(
      `Task details saved: https://ipfs.infura.io/ipfs/${specificationHash}`
    );

    // Create a task in the root domain
    // We could create domains per course in the future
    const {
      eventData: { taskId }
    } = await colonyClient.createTask.send({
      specificationHash,
      domainId: 1
    });

    //set skillId to be rewarded at end of skill completion
    await colonyClient.setTaskSkill.send({
      taskId: taskId,
      skillId: parseInt(skillId)
    });

    // set manager (teacher)
    await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "MANAGER",
      user: teacherAddress
    });
     // set evaluator (teacher)
     await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "EVALUATOR",
      user: teacherAddress
    });

    // set worker to teacher
    await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "WORKER",
      user: teacherAddress
    });


    //set the task due date. This is a multisig and we're cheating by using the same worker/evaluator
    const op = await colonyClient.setTaskDueDate.startOperation({
      taskId: taskId,
      dueDate: new Date(2100, 0, 0, 0, 0, 0, 0) //far in the future
    });
    console.log(op.missingSignees)
    let op2 = await op.sign();
    console.log(op2.missingSignees);
    await op2.send()


    // set worker to actual student
    await colonyClient.setTaskRoleUser.send({
      taskId: taskId,
      role: "WORKER",
      user: studentAddress
    });

  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <RegularCard
        cardTitle="Issue a new certificate"
        cardSubtitle="Fill out the this to issue a new Learning Blocks Token and send it to a student"
        content={
          <form onSubmit={handleSubmit(this.submitHandler)}>
            <Grid container>
              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="courseId"
                  type="input"
                  options={this.props.courseOptions}
                  onSetCourse={this.setCourse}
                  component={renderCourseDropdown}
                  fullWidth={true}
                />
              </ItemGrid>

              <div style={{ paddingTop: 15 }}>
                <ItemGrid xs={12} sm={12} md={12}>
                  <Field
                    name="dateOfIssuance"
                    onSetDate={this.setIssuanceDate}
                    component={renderDateTimePicker}
                    placeholder="Date of issuance"
                    fullWidth={true}
                    value={this.state.issuanceDate}
                  />
                </ItemGrid>
              </div>

              <div style={{ paddingTop: 15 }}>
                <ItemGrid xs={12} sm={12} md={12}>
                  <Field
                    name="dateOfExpiration"
                    onSetDate={this.setExpirationDate}
                    component={renderDateTimePicker}
                    type="text"
                    placeholder="Date of Expiration"
                    fullWidth={true}
                    value={this.state.expirationDate}
                  />
                </ItemGrid>
              </div>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="mnid"
                  component={TextField}
                  type="text"
                  label="Student UPort ID"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="toAddress"
                  component={TextField}
                  type="text"
                  label="Student Etherum account"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="score"
                  component={TextField}
                  type="text"
                  label="Points, Score or grade"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Button type="submit" disabled={submitting}>
                  Submit
                </Button>
              </ItemGrid>
            </Grid>
          </form>
        }
      />
    );
  }
}

CreateCertificateForm.contextTypes = {
  drizzle: PropTypes.object
};

export default CreateCertificateForm;
