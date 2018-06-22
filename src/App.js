import React, { Component } from 'react'
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { RingLoader } from 'react-spinners';

import indexRoutes from "./routes/index.jsx";

const hist = createBrowserHistory();

// Styles
//import './css/oswald.css'
//import './css/open-sans.css'
// import './css/pure-min.css'
import './App.css'
//import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  state = {
    loading: true,
  }

  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 1000)
  }

  render() {
    if (this.state.loading === true) {
      return (
        <div className='center'>
          <RingLoader
            color={'#4286f4'}
            className='center'
            loading={this.state.loading}
          />
        </div>
      )
    } else {
      return (
        < Router history={hist} >
          <Switch>
            {indexRoutes.map((prop, key) => {
              return <Route path={prop.path} component={prop.component} key={key} />;
            })}
          </Switch>
        </Router >
      );
    }
  }
}

export default App
