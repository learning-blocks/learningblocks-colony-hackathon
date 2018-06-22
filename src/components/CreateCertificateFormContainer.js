import { drizzleConnect } from "drizzle-react";
import React from "react";
import { reduxForm, submit } from "redux-form";
import CreateCertificateForm from "./CreateCertificateForm";

const FormWithRedux = reduxForm({
  form: "createCertificate",
  submit: submit
})(CreateCertificateForm);

const mapStateToProps = state => ({
  accounts: state.accounts,
  LearningBlocks: state.contracts.LearningBlocks,
  LearningBlocksCourses: state.contracts.LearningBlocksCourses,
  drizzleStatus: state.drizzleStatus
});

const CreateCertificateFormContainer = drizzleConnect(
  FormWithRedux,
  mapStateToProps
);

export default CreateCertificateFormContainer;
