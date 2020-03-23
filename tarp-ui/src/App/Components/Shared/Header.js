import React, { Component } from "react";
import {
  Row,
  Menu,
  Avatar,
  Dropdown,
  Icon,
  Col,
  message,
  Modal,
  Spin
} from "antd";

import { NavLink, Redirect, Link } from "react-router-dom";
import { loginPath } from "../../Config/LinkGenerator";
import { logout, getCurrentUser } from "../../Models/Auth";
import {
  CB_ADMIN_LINKS,
  BUYER_CLIENT_LINKS,
  SELLER_CLIENT_LINKS,
  GB_ADMIN_LINKS,
  ADMIN_LINKS
} from "../../Config/Navbar";

export default class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.user = getCurrentUser().name;
    this.state = {
      newLink: null
    };
  }

  handleLogout = () => {
    var statusModal = Modal.info({
      title: "Logging out..",
      className: "info-modal-btns",
      content: (
        <div>
          <Spin />
        </div>
      )
    });
    logout({
      onSuccess: function(data) {
        statusModal.destroy();
        this.setState({
          newLink: loginPath
        });
      }.bind(this),
      onError: function(data) {
        statusModal.destroy();
        message.error(data.message);
      }
    });
  };

  handleMenuItemClick({ item, key, keyPath }) {
    switch (key) {
      case "0":
        // this.handleLogout();
        break;
      default:
        break;
    }
  }

  getNavbar = () => {
    if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "CentralBank" 
    ) {
      return CB_ADMIN_LINKS;
    } else if (
      (getCurrentUser().role === "Admin" ||
        getCurrentUser().role === "Manager") &&
      getCurrentUser().organizationType === "Bank"
    ) {
      return GB_ADMIN_LINKS;
    }else if (
      (getCurrentUser().role === "Admin") &&
      getCurrentUser().organizationType === "Buyer" 
    ) {
      return ADMIN_LINKS;
    } else if (
      (getCurrentUser().role === "Admin") &&
      getCurrentUser().organizationType === "Seller"
    ) {
      return ADMIN_LINKS;
    } else if (
      (getCurrentUser().role === "Client") &&
      getCurrentUser().organizationType === "Seller"
    ) {
      return SELLER_CLIENT_LINKS;
    }else {
      return BUYER_CLIENT_LINKS;
    }
  };

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
    }else {
      return "/client/kyc";
    }
  };

  renderMenu() {
    return (
      <Menu onClick={this.handleMenuItemClick.bind(this)}>
        {/* <Menu.Item key="0" >
					<Link to="/users">Users</Link>
				</Menu.Item> */}
        <Menu.Item key="0">
          <a onClick={this.handleLogout}>Logout</a>
        </Menu.Item>
      </Menu>
    );
  }

  renderNavLinks(item, index) {
    return (
      <NavLink to={item.link} key={index}>
        {item.name}
      </NavLink>
    );
  }

  render() {
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    }

    return (
      <div>
        <div className="Header-Height">
          <Row
            className="Header-Content"
            type="flex"
            justify="space-between"
            align="center"
          >
            <Col className="Main-Header-Logo">
              <NavLink to={this.getHomeLink()}>
                <h2 style={{ color: "white" }}>
                  KYC and Loan Management System
                </h2>
              </NavLink>
            </Col>
            <div className="Main-Header-Navigation">
              {this.getNavbar().map(this.renderNavLinks.bind(this))}
            </div>
            <Col className="Main-Header-Avatar">
              <Dropdown overlay={this.renderMenu()}>
                <a className="ant-dropdown-link">
                  <Avatar
                    src={"https://www.s10health.com/img/default_user_icon.png"}
                  />
                  {this.user} <Icon type="down" />
                </a>
              </Dropdown>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
