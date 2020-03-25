import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getCurrentUser } from '../../Models/Auth'
class KYCHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newLink : null
    }
  }
  
  componentDidMount() {
    this.setState({newLink : this.getHomeLink()})
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
  }

  render() {
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />
    }
    return (
      <div>
        
      </div>
    );
  }
}

export default KYCHome;