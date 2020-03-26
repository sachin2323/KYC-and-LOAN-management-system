import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import * as Containers from "./App/Containers";

import "./App/Stylesheets/main.less";
import "./App/Stylesheets/main.css";

import * as Layouts from "./App/Layouts";

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Layouts.NonPrivateRoute exact path="/" component={Containers.Home} />
          <Layouts.NonPrivateRoute
            exact
            path="/login"
            component={Containers.Login}
          />
          <Layouts.NonPrivateRoute
            exact
            path="/signup"
            component={Containers.Signup}
          />
          <Layouts.PrivateRoute
            exact
            path="/client/kyc/add-kyc"
            component={Containers.AddKYC}
          />
          <Layouts.PrivateRoute
            exact
            path="/client/kyc"
            component={Containers.ClientKYC}
          />
          <Layouts.PrivateRoute
            exact
            path="/list-kycs"
            component={Containers.ListKYC}
          />
          <Layouts.PrivateRoute
            exact
            path="/kyc-home"
            component={Containers.KYCHome}
          />
          <Layouts.PrivateRoute
            exact
            path="/users"
            component={Containers.Users}
          />
          <Layouts.PrivateRoute
            exact
            path="/kyc"
            component={Containers.GbKYC}
          />
          <Layouts.PrivateRoute
            exact
            path="/kyc-requests"
            component={Containers.ListRequest}
          />
          <Layouts.PrivateRoute
            exact
            path="/client-approved-requests"
            component={Containers.ClientApprovedRequest}
          />
          <Layouts.PrivateRoute
            exact
            path="/client/claim/add-claim"
            component={Containers.AddClaim}
          />
          <Layouts.PrivateRoute
            exact
            path="/list-client-claims"
            component={Containers.ListClientClaims}
          />

          <Layouts.PrivateRoute
            exact
            path="/list-org-claims"
            component={Containers.ListOrgClaims}
          />
          <Layouts.PrivateRoute
            exact
            path="/list-all-claims"
            component={Containers.ListAllClaims}
          />
          {/* 404 */}
          <Route component={Containers.NotFound} />
        </Switch>
      </Router>
    );
  }
}
