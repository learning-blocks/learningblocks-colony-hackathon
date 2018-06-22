import { ContractForm } from "drizzle-react-components";
import { Card, CardContent, CardHeader, Grid, Typography } from "material-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";
import ReactTable from "react-table";
import { Button, ItemGrid, RegularCard } from "../../components";
import CreateCourseFormContainer from "../../components/CreateCourseFormContainer";
import ipfs from "../../services/ipfs";

class Admin extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.loadCourses = this.loadCourses.bind(this);

    this.state = {
      isAdmin: false,
      isSystemManager: false,
      courses: []
    };
  }

  //TODO: Move into redux store
  async loadCourses() {
    // get length of available courses
    let length = await this.contracts.LearningBlocksCourses.methods
      .getCoursesLength()
      .call();
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

      //load details from ipfs and prepare object to render
      try {
        let files = await ipfs.get(course.metadataHash);
        files.forEach(file => {
          let object = JSON.parse(file.content.toString("utf8"));
          course.name = object.name;
          course.provider = object.provider;
          course.description = object.description;
          course.skill = object.colonySkill.name;
        });
      } catch (error) {
        console.log(error);
      } finally {
      }
      courses.push(course);
    }
    this.setState({ courses: courses });
  }

  async componentDidMount() {
    this.setState({
      isAdmin: await this.contracts.LearningBlocksRBAC.methods
        .hasRole(this.props.accounts[0], "admin")
        .call()
    });

    this.setState({
      isSystemManager: await this.contracts.LearningBlocksRBAC.methods
        .hasRole(this.props.accounts[0], "systemmanager")
        .call()
    });

    // get list of courses
    this.loadCourses();
  }

  render() {
    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <Typography variant="display1" gutterBottom>
              Learning Blocks Administration
            </Typography>

            {/* <div className="pure-u-1-1">
              <h2>Active Account</h2>
              <AccountData accountIndex="0" units="ether" precision="3" />
              <p>Is Admin: {this.state.isAdmin.toString()}</p>
              <p>Is SystemManager: {this.state.isSystemManager.toString()}</p>
            </div> */}

            <RegularCard
              cardTitle="Existing courses"
              content={
                <div>
                  <ReactTable
                    data={this.state.courses}
                    showPagination={false}
                    defaultPageSize={10}
                    noDataText="No Courses found"
                    columns={[
                      {
                        Header: "Name",
                        accessor: "name"
                      },
                      {
                        Header: "Internal Id",
                        accessor: "id"
                      },
                      {
                        Header: "Metadata Hash",
                        accessor: "metadataHash"
                      },
                      {
                        Header: "Provider",
                        accessor: "provider"
                      },
                      {
                        Header: "Description",
                        accessor: "description"
                      },
                      {
                        Header: "Colony Skill",
                        accessor: "skill"
                      }
                    ]}
                  />
                  <Button onClick={this.loadCourses}>
                    Refresh
                  </Button>
                </div>
              }
            />
            <CreateCourseFormContainer />
          </ItemGrid>
        </Grid>
{/*
  // DISABLED FOR THIS DEMO

        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <RegularCard
              cardTitle="Manage Teachers"
              content={
                <Grid container>
                  <ItemGrid xs={12} sm={12} md={6}>
                    <Card>
                      <CardHeader title="Add a teacher" />
                      <CardContent>
                        <ContractForm
                          contract="LearningBlocks"
                          method="addTeacher"
                        />
                      </CardContent>
                    </Card>
                  </ItemGrid>

                  <ItemGrid xs={12} sm={12} md={6}>
                    <Card>
                      <CardHeader title="Remove a teacher" />
                      <CardContent>
                        <ContractForm
                          contract="LearningBlocks"
                          method="removeTeacher"
                        />
                      </CardContent>
                    </Card>
                  </ItemGrid>
                </Grid>
              }
            />
          </ItemGrid>
        </Grid>

        <Grid container>
          <ItemGrid xs={12} sm={12} md={8}>
            <RegularCard
              cardTitle="Manage Teachers"
              content={
                <Grid container>
                  <ItemGrid xs={12} sm={12} md={6}>
                    <Card>
                      <CardHeader title="Add a System Manager" />
                      <CardContent>
                        <ContractForm
                          contract="LearningBlocksCourses"
                          method="addSystemManager"
                        />
                      </CardContent>
                    </Card>
                  </ItemGrid>

                  <ItemGrid xs={12} sm={12} md={6}>
                    <Card>
                      <CardHeader title="Remove a System Manager" />
                      <CardContent>
                        <ContractForm
                          contract="LearningBlocksCourses"
                          method="removeTeacher"
                        />
                      </CardContent>
                    </Card>
                  </ItemGrid>
                </Grid>
              }
            />
          </ItemGrid>
        </Grid>
            */}

      </div>
    );
  }
}

Admin.contextTypes = {
  drizzle: PropTypes.object
};

export default Admin;
