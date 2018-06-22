import { drizzleConnect } from 'drizzle-react';
import Admin from './Admin';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  LearningBlocks: state.contracts.LearningBlocks,
  LearningBlocksCourses: state.contracts.LearningBlocksCourses,
  drizzleStatus: state.drizzleStatus
});

const AdminContainer = drizzleConnect(Admin, mapStateToProps);

export default AdminContainer;
