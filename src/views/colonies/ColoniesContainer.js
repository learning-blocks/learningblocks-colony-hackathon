import Colonies from './Colonies';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  drizzleStatus: state.drizzleStatus

});

const ColoniesContainer = drizzleConnect(Colonies, mapStateToProps);

export default ColoniesContainer;
