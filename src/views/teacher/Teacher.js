import { Grid, Typography } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import "react-table/react-table.css";
import { ItemGrid } from "../../components";
import CreateCertificateFormContainer from "../../components/CreateCertificateFormContainer";
import ipfs from "../../services/ipfs";

class Teacher extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;

    this.state = {
      courses: [],
      courseOptions: {}
    };
  }

  componentDidMount() {
    // get list of courses
    this.loadCourses();
  }

  //TODO: Move into redux store
  async loadCourses() {
    // get length of available courses
    let length = await this.contracts.LearningBlocksCourses.methods
      .getCoursesLength()
      .call();

    // get details for each course
    let courses = [];
    for (let i = 0; i < length; i++) {
      let data = await this.contracts.LearningBlocksCourses.methods
        .getCourseByIndex(i)
        .call();

      let course = {
        id: data[0],
        name: data[1],
        metadataHash: data[2]
      };

      //load details from ipfs
      try {
        let files = await ipfs.get(course.metadataHash);
        files.forEach(file => {
          let object = JSON.parse(file.content.toString("utf8"));
          course.name = object.name;
          course.provider = object.provider;
          course.description = object.description;
          course.colonySkill = object.colonySkill;
        });
      } catch (error) {
        console.log(error);
      } finally {
      }
      courses.push(course);
    }
    console.log("Courses: " + courses.length);

    this.setState({ courses: courses });

    //create options for dropdown
    let courseOptions = {};
    courses.forEach(element => {
      var key = element.id;
      var value = element.name;
      courseOptions[key] = value;
    });

    this.setState({ courseOptions: courseOptions });
  }

  render() {
    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <Typography variant="display1" gutterBottom>
              Learning Blocks Teacher Interface
            </Typography>


            {/* <div className="pure-u-1-1">
              <h2>Active Account</h2>
              <AccountData accountIndex="0" units="ether" precision="3" />
            </div>

            <div className="pure-u-1-1">
              <p>
                <strong>Total Supply</strong>:{" "}
                <ContractData
                  contract="LearningBlocks"
                  method="totalSupply"
                  methodArgs={[{ from: this.props.accounts[0] }]}
                />
                <ContractData
                  contract="LearningBlocks"
                  method="symbol"
                  hideIndicator
                />
              </p>
            </div> */}

            <CreateCertificateFormContainer
              fromAccount={this.props.accounts[0]}
              courses={this.state.courses}
              courseOptions={this.state.courseOptions}
            />
          </ItemGrid>
        </Grid>
      </div>
    );
  }
}

Teacher.contextTypes = {
  drizzle: PropTypes.object
};

export default Teacher;
