import { DrizzleProvider } from "drizzle-react";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
import "./assets/css/material-dashboard-react.css?v=1.2.0";
import drizzleOptions from "./drizzleOptions";
// import { LoadingContainer } from "drizzle-react-components";
import store from "./store";



ReactDOM.render(
  <Provider store={store}>
    <DrizzleProvider options={drizzleOptions} store={store}>
      {/* <LoadingContainer> */}
      <App />
      {/* </LoadingContainer> */}
    </DrizzleProvider>
  </Provider>,
  document.getElementById("root")
);
