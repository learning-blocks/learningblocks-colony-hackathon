/*
  IMPORTANT: This file is currently not used. It was the old entrypoint from drizzle with react-router
*/
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import { DrizzleProvider } from "drizzle-react";
import { Provider } from "react-redux";
// Layouts
import App from "./App";
import HomeContainer from "./layouts/home/HomeContainer";
import AdminContainer from "./layouts/admin/AdminContainer";
import TeacherContainer from "./layouts/teacher/TeacherContainer";
import StudentContainer from "./layouts/student/StudentContainer";
import { LoadingContainer } from "drizzle-react-components";

import store from "./store";
import drizzleOptions from "./drizzleOptions";

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <DrizzleProvider options={drizzleOptions} store={store}>
      <LoadingContainer>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={HomeContainer} />
            <Route path="/admin" component={AdminContainer} />
            <Route path="/teacher" component={TeacherContainer} />
            <Route path="/student" component={StudentContainer} />
          </Route>
        </Router>
      </LoadingContainer>
    </DrizzleProvider>
  </Provider>,
  document.getElementById("root")
);
