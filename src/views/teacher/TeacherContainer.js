import { drizzleConnect } from 'drizzle-react';
import Teacher from './Teacher';
import { loadCouresesRoutine } from './../../store/routines'; // import our routine

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  SimpleStorage: state.contracts.SimpleStorage,
  TutorialToken: state.contracts.TutorialToken,
  LearningBlocks: state.contracts.LearningBlocks,
  drizzleStatus: state.drizzleStatus
});

const mapDispatchToProps = {
  loadCouresesRoutine,
};

const TeacherContainer = drizzleConnect(Teacher, mapStateToProps, mapDispatchToProps);

export default TeacherContainer;
