import { drizzleConnect } from "drizzle-react";
import React from "react";
import { reduxForm, submit } from "redux-form";
import CreateCourseForm from "./CreateCourseForm";

const FormWithRedux = reduxForm({
  form: "createCourse",
  submit: submit
})(CreateCourseForm);

const mapStateToProps = state => ({
  accounts: state.accounts,
  LearningBlocks: state.contracts.LearningBlocks,
  LearningBlocksCourses: state.contracts.LearningBlocksCourses,
  drizzleStatus: state.drizzleStatus
});

const CreateCourseFormContainer = drizzleConnect(
  FormWithRedux,
  mapStateToProps
);

export default CreateCourseFormContainer;
