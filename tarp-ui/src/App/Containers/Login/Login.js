import React from "react";
import { Redirect, Link } from "react-router-dom";
import { login } from "../../Models/Auth";
import { WALLET_IMPORT } from "../../Config/Routes";
import { Upload, message, Icon, Row, Col, Spin, Button } from "antd";
const Dragger = Upload.Dragger;

export default class Login extends React.Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      newLink: null,
      loading: false
    };
  }

  // Component helper methods
  onUpload(info) {
    const status = info.file.status;

    if (status === "uploading") {
      this.setState({ loading: true });
      return;
    }

    if (status === "done") {
      login({ data: info.file.response });
      this.setState({
        newLink: "/kyc-home",
        loading: false
      });
      return;
    } else if (status === "error") {
      this.setState({ loading: false });
      message.error(`Unable to Login!`);
      return;
    }
  }

  // Renderer methods
  renderUploadStatus() {
    if (this.state.loading) {
      return <Spin />;
    }
    return (
      <div>
        <p className="ant-upload-drag-icon">
          <Icon type="upload" />
        </p>
        <p className="ant-upload-text">Upload keystore file</p>
      </div>
    );
  }

  // Renderer
  render() {
    if (this.state.newLink) {
      return <Redirect to={this.state.newLink} />;
    }
    return (
      <div className="login-wrapper">
        <Row type="flex" justify="center" align="center">
          <Col md={15} sm={22} xs={22}>
            <div className="login-box">
              <div className="login-width">
                <div className="logo-wrapper">
                  <h1>KYC and Loan Management System</h1>
                  <h2>Sign-in</h2>
                </div>
                <Dragger
                  name="card"
                  showUploadList={false}
                  accept=".card"
                  onChange={this.onUpload.bind(this)}
                  action={WALLET_IMPORT}
                >
                  {this.renderUploadStatus()}
                </Dragger>
                <div className="register-wrapper">
                  <p>Not registered yet?</p>
                  <Link to="/signup">
                    <Button type="primary">Register now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
