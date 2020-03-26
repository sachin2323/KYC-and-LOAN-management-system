import React from "react";
import { Redirect } from "react-router-dom";
import { Spin } from "antd";

import { systemPing, getCurrentUser } from "../Models/Auth";
import { loginPath } from "../Config/LinkGenerator";

export default class Authenticator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      authenticated: false,
      errorMessage: "",
      status: null,
      newLink: null
    };
  }

  componentDidMount() {
    this.authenticate();
  }

  authenticate() {
    systemPing({
      onSuccess: function(data) {
        if (this.props.reverse) {
          this.setState({
            loading: false,
            authenticated: true,
            newLink: this.getHomeLink()
          });
        } else {
          this.setState({
            loading: false,
            authenticated: true
          });
        }
      }.bind(this),
      onError: function(data) {
        if (!this.props.reverse) {
          this.setState({
            newLink: loginPath
          });
        } else {
          this.setState({
            loading: false,
            authenticated: false
          });
        }
      }.bind(this)
    });
  }

  getHomeLink = () => {
    if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "CentralBank"
    ) {
      return "/list-kycs";
    } else if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "Bank"
    ) {
      return "/list-org-claims";
    } else if (
      (getCurrentUser().role === "Admin") &&
      getCurrentUser().organizationType === "Buyer" 
    ) {
      return "/users";
    } else if (
      (getCurrentUser().role === "Admin") &&
      getCurrentUser().organizationType === "Seller"
    ) {
      return "/users";
    }else if (getCurrentUser().role === "Client") {
      return "/client/kyc";
    }else{
      return "/users";
    }
  };

  renderLoader() {
    return (
      <div className="loader-container">
        <Spin />
        <h3>Loading...</h3>
      </div>
    );
  }

  render() {
    if (this.state.newLink) {
      return (
        <Redirect
          to={{
            pathname: this.state.newLink
          }}
        />
      );
    }

    if (this.state.loading) {
      return this.renderLoader();
    }

    return <div>{this.props.children}</div>;
  }
}
