import Student from './Student';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  LearningBlock: state.contracts.LearningBlock,
  drizzleStatus: state.drizzleStatus
});

const StudentContainer = drizzleConnect(Student, mapStateToProps);

export default StudentContainer;
