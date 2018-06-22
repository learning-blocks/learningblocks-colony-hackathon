import { Grid, withStyles } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Field } from "redux-form";
//import { CustomInput } from "components";
import { TextField } from "redux-form-material-ui";
import { Button, ItemGrid, RegularCard } from ".";
import customInputStyle from "../assets/jss/material-dashboard-react/customInputStyle";
import ipfs from "../services/ipfs";
import colonyData from "./../../colony.json";
import DropdownList from "react-widgets/lib/DropdownList";

const ValueInput = ({ item }) => (
  <span>
    <strong>{item.name}</strong>
  </span>
);

const renderSkillDropdown = props => {
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
      placeholder={"Select Colony Skill"}
    />
  );
};

class CreateCourseForm extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.submitHandler = this.submitHandler.bind(this);

    this.state = {
      isAdmin: false,
      isSystemManager: false,
      courses: [],
      skillOptions: {}
    };
  }

  async componentDidMount() {
    await this.loadSkills();
  }

  async loadSkills() {
    try {
      let skillOptions = {};
      let files = await ipfs.get(colonyData.skillMappings);
      let skills = JSON.parse(files[0].content.toString("utf8"));
      //create options for dropdown
      skills.forEach(element => {
        var key = element.skillId;
        var value = element.skilllabel;
        skillOptions[key] = value;
      });
      this.setState({ skillOptions: skillOptions });
    } catch (error) {
      console.log(error);
    }
  }

  setSkill = skill => {
    console.log(skill);
    this.setState({ selectedSkill: skill });
  };

  async submitHandler(values) {
    console.log(values);

    // create file to store on ipfs
    const ipfsValues = {
      name: values.name,
      provider: values.provider,
      description: values.description,
      image: values.image,
      colonySkill: this.state.selectedSkill
    };
    const fileToStore = {
      path: "learningblocks.json",
      content: Buffer.from(JSON.stringify(ipfsValues, null, 2))
    };

    const files = await ipfs.files.add(fileToStore);
    const hash = files[0].hash;
    console.log(`https://ipfs.infura.io/ipfs/${hash}`);

    let id = new Date().getTime();
    let tx = await this.contracts.LearningBlocksCourses.methods
      .addCourse(id, values.name, hash)
      .send();
    console.log(tx);
  }

  handleSubmitButton() {
    console.log("test");
    this.refs.myForm.submit(); // will return a promise
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <RegularCard
        cardTitle="Create a new course"
        content={
          <form onSubmit={handleSubmit(this.submitHandler)}>
            <Grid container>
              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="name"
                  component={TextField}
                  label="Course Name"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="provider"
                  component={TextField}
                  label="Provider"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="image"
                  component={TextField}
                  label="Image (IPFS Hash)"
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="description"
                  component={TextField}
                  label="Description"
                  rows={2}
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Field
                  name="colonySkill"
                  type="input"
                  options={this.state.skillOptions}
                  onSetCourse={this.setSkill}
                  component={renderSkillDropdown}
                  fullWidth={true}
                />
              </ItemGrid>

              <ItemGrid xs={12} sm={12} md={12}>
                <Button type="submit">Submit</Button>
              </ItemGrid>
            </Grid>
          </form>
        }
      />
    );
  }
}

CreateCourseForm.contextTypes = {
  drizzle: PropTypes.object
};

export default withStyles(customInputStyle)(CreateCourseForm);
